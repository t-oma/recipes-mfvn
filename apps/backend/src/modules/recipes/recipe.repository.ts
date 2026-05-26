import type { RecipeComputed, RecipeQuery, RequireKeys } from "@recipes/shared";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type {
  InitiatedMethodParams,
  OptionalInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { PaginatedStageResult } from "@/common/utils/stages.js";
import stages, { extractPaginatedResult } from "@/common/utils/stages.js";
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { CuisineDocument } from "@/modules/cuisines/cuisine.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";
import {
  byVisibility,
  withAuthor,
  withCategories,
  withCuisine,
  withFavorited,
  withUserRating,
} from "./recipe.aggregation.js";
import type {
  RecipeDocument,
  RecipeDocumentPopulated,
} from "./recipe.model.js";

export const RECIPE_POPULARITY_WEIGHTS = {
  favorites: 3,
  comments: 2,
  ratings: 1,
  averageRating: 5,
} as const;

export type RecipeStatsDelta = {
  favoritesCount?: number;
  commentsCount?: number;
  ratingCount?: number;
  ratingSum?: number;
};

export type RecipeCreateInput = RequireKeys<
  CreateInput<Omit<RecipeDocument, "createdAt" | "updatedAt">>,
  | "title"
  | "description"
  | "ingredients"
  | "instructions"
  | "category"
  | "author"
  | "difficulty"
  | "mealType"
  | "cookingTime"
  | "servings"
  | "isPublic"
  | "image"
>;
export type RecipeUpdateInput = UpdateInput<Omit<RecipeDocument, "author">>;
export type RecipeDefaultPopulate = {
  author: Pick<UserDocument, "_id" | "name" | "email">;
  category: Pick<CategoryDocument, "_id" | "name" | "slug" | "image">;
  cuisine?: Pick<CuisineDocument, "_id" | "name" | "slug" | "image">;
};

type RecipeDocumentListItem = Omit<
  RecipeDocumentPopulated,
  "description" | "ingredients" | "instructions" | "createdAt" | "updatedAt"
> &
  RecipeComputed;

export type SearchRecipeQuery = Omit<RecipeQuery, "cuisineId"> & {
  cuisineId?: string;
};

export class RecipeRepository extends BaseRepository<
  RecipeDocument,
  RecipeCreateInput,
  RecipeUpdateInput,
  RecipeDefaultPopulate
> {
  async aggregateSearch({
    query,
    initiator,
  }: QueryMethodParams<SearchRecipeQuery>): Promise<
    [RecipeDocumentListItem[], number]
  > {
    const {
      page,
      limit,
      sort,
      isFavorited,
      search,
      categoryId,
      cuisineId,
      difficulty,
      mealType,
    } = query;

    const sortWithPopularityReplaced = sort.replace(
      "popularity",
      "stats.popularity",
    );

    const pipeline = [
      stages.match<RecipeDocument>({
        ...byVisibility(initiator),
        ...(search && { $text: { $search: search } }),
        ...(categoryId && { category: toObjectId(categoryId) }),
        ...(cuisineId && { cuisine: toObjectId(cuisineId) }),
        ...(difficulty && { difficulty }),
        ...(mealType && { mealType }),
      }),
      stages.unset<RecipeDocument>("__v"),

      withFavorited(initiator.id),
      withUserRating(initiator.id),
      stages.match<RecipeDocument>({
        ...(isFavorited !== undefined && { isFavorited }),
      }),

      stages.paginated(
        {
          sort: sortWithPopularityReplaced,
          page,
          limit,
        },
        stages.project({
          description: 0,
          ingredients: 0,
          instructions: 0,
          createdAt: 0,
          updatedAt: 0,
        }),
        ...withCategories(),
        ...withCuisine(),
        ...withAuthor(),
      ),
    ].flat();

    const result =
      await this.aggregate<PaginatedStageResult<RecipeDocumentListItem>>(
        pipeline,
      );

    return extractPaginatedResult(result);
  }

  async aggregateById(
    id: string,
    { initiator }: InitiatedMethodParams<OptionalInitiator>,
  ): Promise<(RecipeDocumentPopulated & RecipeComputed) | undefined> {
    const pipeline = [
      stages.match<RecipeDocument>({
        _id: toObjectId(id),
        ...byVisibility(initiator),
      }),
      { $unset: "__v" },
      withCategories(),
      withCuisine(),
      withAuthor(),
      withFavorited(initiator.id),
      withUserRating(initiator.id),
    ].flat();

    const result = await this.aggregate<
      RecipeDocumentPopulated & RecipeComputed
    >(pipeline);

    return result[0];
  }

  async applyFavoritesDelta(
    recipeId: string,
    delta: 1 | -1,
  ): Promise<RecipeDocument | null> {
    return this.applyStatsDelta(recipeId, {
      favoritesCount: delta,
    });
  }

  async applyCommentsDelta(
    recipeId: string,
    delta: 1 | -1,
  ): Promise<RecipeDocument | null> {
    return this.applyStatsDelta(recipeId, {
      commentsCount: delta,
    });
  }

  async applyRatingCreated(
    recipeId: string,
    value: number,
  ): Promise<RecipeDocument | null> {
    return this.applyStatsDelta(recipeId, {
      ratingCount: 1,
      ratingSum: value,
    });
  }

  async applyRatingUpdated(
    recipeId: string,
    previousValue: number,
    nextValue: number,
  ): Promise<RecipeDocument | null> {
    return this.applyStatsDelta(recipeId, {
      ratingSum: nextValue - previousValue,
    });
  }

  async applyRatingDeleted(
    recipeId: string,
    value: number,
  ): Promise<RecipeDocument | null> {
    return this.applyStatsDelta(recipeId, {
      ratingCount: -1,
      ratingSum: -value,
    });
  }

  protected override getDefaultPopulate() {
    return [
      { path: "author", select: "name email" },
      { path: "category", select: "name slug image" },
      { path: "cuisine", select: "name slug image" },
    ];
  }

  private buildPopularityExpression() {
    return {
      $add: [
        stages.multiply(
          { $ifNull: ["$stats.favoritesCount", 0] },
          RECIPE_POPULARITY_WEIGHTS.favorites,
        ),
        stages.multiply(
          { $ifNull: ["$stats.commentsCount", 0] },
          RECIPE_POPULARITY_WEIGHTS.comments,
        ),
        stages.multiply(
          { $ifNull: ["$stats.ratingCount", 0] },
          RECIPE_POPULARITY_WEIGHTS.ratings,
        ),
        stages.multiply(
          { $ifNull: ["$stats.averageRating", 0] },
          RECIPE_POPULARITY_WEIGHTS.averageRating,
        ),
      ],
    };
  }

  private async applyStatsDelta(
    recipeId: string,
    delta: RecipeStatsDelta,
  ): Promise<RecipeDocument | null> {
    const favoritesDelta = delta.favoritesCount ?? 0;
    const commentsDelta = delta.commentsCount ?? 0;
    const ratingCountDelta = delta.ratingCount ?? 0;
    const ratingSumDelta = delta.ratingSum ?? 0;

    return this.model
      .findOneAndUpdate(
        { _id: toObjectId(recipeId) },
        [
          stages.set({
            "stats.favoritesCount": stages.max(0, {
              $add: [{ $ifNull: ["$stats.favoritesCount", 0] }, favoritesDelta],
            }),
            "stats.commentsCount": stages.max(0, {
              $add: [{ $ifNull: ["$stats.commentsCount", 0] }, commentsDelta],
            }),
            "stats.ratingCount": stages.max(0, {
              $add: [{ $ifNull: ["$stats.ratingCount", 0] }, ratingCountDelta],
            }),
            "stats.ratingSum": stages.max(0, {
              $add: [{ $ifNull: ["$stats.ratingSum", 0] }, ratingSumDelta],
            }),
          }),
          stages.set({
            "stats.averageRating": stages.cond(
              { $gt: ["$stats.ratingCount", 0] },
              {
                $round: [
                  {
                    $divide: ["$stats.ratingSum", "$stats.ratingCount"],
                  },
                  1,
                ],
              },
              null,
            ),
          }),
          stages.set({
            "stats.popularity": this.buildPopularityExpression(),
          }),
        ],
        {
          returnDocument: "after",
          updatePipeline: true,
        },
      )
      .lean();
  }
}
