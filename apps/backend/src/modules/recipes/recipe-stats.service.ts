import type { RecipeStats } from "@recipes/shared";
import type { Types } from "mongoose";
import stages from "@/common/utils/stages.js";
import type { CommentModelType } from "@/modules/comments/comment.model.js";
import type { FavoriteModelType } from "@/modules/favorites/favorite.model.js";
import type { RecipeRatingModelType } from "@/modules/recipe-ratings/recipe-rating.model.js";
import type { RecipeModelType } from "./recipe.model.js";
import type { RecipeRepository } from "./recipe.repository.js";
import { RECIPE_POPULARITY_WEIGHTS } from "./recipe.repository.js";

export function computeAverageRating(
  stats: Pick<RecipeStats, "ratingCount" | "ratingSum">,
): number | null {
  if (stats.ratingCount <= 0) {
    return null;
  }

  return Number((stats.ratingSum / stats.ratingCount).toFixed(1));
}

export function computePopularity(
  stats: Omit<RecipeStats, "popularity" | "averageRating">,
) {
  const averageRating = computeAverageRating(stats);

  return (
    stats.favoritesCount * RECIPE_POPULARITY_WEIGHTS.favorites +
    stats.commentsCount * RECIPE_POPULARITY_WEIGHTS.comments +
    stats.ratingCount * RECIPE_POPULARITY_WEIGHTS.ratings +
    (averageRating ?? 0) * RECIPE_POPULARITY_WEIGHTS.averageRating
  );
}

export type RecipeStatsService = ReturnType<typeof createRecipeStatsService>;

export function createRecipeStatsService(recipeRepository: RecipeRepository) {
  return {
    async onFavoriteCreated(recipeId: string) {
      return recipeRepository.applyFavoritesDelta(recipeId, 1);
    },
    async onFavoriteDeleted(recipeId: string) {
      return recipeRepository.applyFavoritesDelta(recipeId, -1);
    },
    async onCommentCreated(recipeId: string) {
      return recipeRepository.applyCommentsDelta(recipeId, 1);
    },
    async onCommentDeleted(recipeId: string) {
      return recipeRepository.applyCommentsDelta(recipeId, -1);
    },
    async onRatingCreated(recipeId: string, value: number) {
      return recipeRepository.applyRatingCreated(recipeId, value);
    },
    async onRatingUpdated(
      recipeId: string,
      previousValue: number | null,
      value: number,
    ) {
      return recipeRepository.applyRatingUpdated(
        recipeId,
        previousValue ?? 0,
        value,
      );
    },
    async onRatingDeleted(recipeId: string, value: number) {
      return recipeRepository.applyRatingDeleted(recipeId, value);
    },
  };
}

export async function rebuildRecipeStats(
  recipeModel: Pick<RecipeModelType, "find" | "bulkWrite">,
  favoriteModel: Pick<FavoriteModelType, "aggregate">,
  commentModel: Pick<CommentModelType, "aggregate">,
  recipeRatingModel: Pick<RecipeRatingModelType, "aggregate">,
) {
  const [recipes, favorites, comments, ratings] = await Promise.all([
    recipeModel.find({}, { _id: 1 }).lean(),
    favoriteModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $group: { _id: "$recipe", count: { $sum: 1 } } },
    ]),
    commentModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $group: { _id: "$recipe", count: { $sum: 1 } } },
    ]),
    recipeRatingModel.aggregate<{
      _id: Types.ObjectId;
      ratingCount: number;
      ratingSum: number;
      averageRating: number;
    }>([
      stages.group({
        _id: "$recipe",
        ratingCount: { $sum: 1 },
        ratingSum: { $sum: "$value" },
        averageRating: { $avg: "$value" },
      }),
      stages.project({
        ratingCount: 1,
        ratingSum: 1,
        averageRating: { $round: ["$averageRating", 1] },
      }),
    ]),
  ]);

  const favoriteMap = new Map(
    favorites.map((x) => [x._id.toString(), x.count]),
  );
  const commentMap = new Map(comments.map((x) => [x._id.toString(), x.count]));
  const ratingMap = new Map(ratings.map((x) => [x._id.toString(), x]));

  const ops = recipes.map((recipe) => {
    const id = recipe._id.toString();
    const favoritesCount = favoriteMap.get(id) ?? 0;
    const commentsCount = commentMap.get(id) ?? 0;
    const rating = ratingMap.get(id);

    const ratingCount = rating?.ratingCount ?? 0;
    const ratingSum = rating?.ratingSum ?? 0;
    const averageRating = rating?.averageRating ?? null;

    const popularity = computePopularity({
      favoritesCount,
      commentsCount,
      ratingCount,
      ratingSum,
    });

    return {
      updateOne: {
        filter: { _id: recipe._id },
        update: {
          $set: {
            stats: {
              favoritesCount,
              commentsCount,
              ratingCount,
              ratingSum,
              averageRating,
              popularity,
            },
          },
        },
      },
    };
  });

  if (ops.length > 0) {
    await recipeModel.bulkWrite(ops);
  }
}
