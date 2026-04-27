import type { PipelineStage, QueryFilter } from "mongoose";
import type {
  OptionalInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  extractTotalCountResult,
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import {
  byVisibility,
  withAuthor,
  withCategories,
} from "@/modules/recipes/recipe.aggregation.js";
import type { RecipeDocumentPopulated } from "@/modules/recipes/recipe.model.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { FavoriteDocument, FavoriteModelType } from "./favorite.model.js";

export type CreateFavoriteBody = {
  user: string;
  recipe: string;
};

export class FavoriteRepository {
  private model: FavoriteModelType;

  constructor(model: FavoriteModelType) {
    this.model = model;
  }

  async findByUser(
    userId: string,
    { query, initiator }: QueryMethodParams,
  ): Promise<[RecipeDocumentPopulated[], number]> {
    const result = await this.aggregate<
      WithTotalCountResult<{ recipe: RecipeDocumentPopulated }>
    >([
      {
        $match: {
          user: toObjectId(userId),
        },
      },
      { $unset: ["__v", "user"] },
      ...withRecipe(initiator),
      ...withTotalCount(
        ...withSort("-createdAt"),
        ...withPagination(query.page, query.limit),
      ),
    ]);

    const [favorites, total] = extractTotalCountResult(result);
    const recipes = favorites
      .map((fav) => fav.recipe)
      .filter((recipe) => recipe != null);

    return [recipes, total];
  }

  async findOne(
    filter: QueryFilter<FavoriteDocument>,
  ): Promise<FavoriteDocument | null> {
    return this.model.findOne(filter).lean();
  }

  async create(data: CreateFavoriteBody): Promise<FavoriteDocument> {
    return this.model.create(data);
  }

  async delete(
    userId: string,
    recipeId: string,
  ): Promise<FavoriteDocument | null> {
    return this.model
      .findOneAndDelete({
        user: userId,
        recipe: recipeId,
      })
      .lean();
  }

  async exists(userId: string, recipeId: string): Promise<boolean> {
    return !!(await this.model.exists({
      user: userId,
      recipe: recipeId,
    }));
  }

  async aggregate<T>(pipeline: PipelineStage[]): Promise<T[]> {
    return this.model.aggregate<T>(pipeline);
  }
}

function withRecipe(
  initiator: OptionalInitiator,
): PipelineStage.FacetPipelineStage[] {
  return [
    {
      $lookup: {
        from: recipesCollectionName,
        localField: "recipe",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              ...byVisibility(initiator),
            },
          },
          { $unset: "__v" },
          ...withCategories(),
          ...withAuthor(),
        ],
        as: "recipe",
      },
    },
    { $unwind: { path: "$recipe" } },
  ];
}
