import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import type { IRecipeDocument } from "@/modules/recipes/recipe.model.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import type { FavoriteQuery } from "./favorite.schema.js";

export class FavoriteService {
  async toggle(
    userId: string,
    recipeId: string,
  ): Promise<{ favorited: boolean }> {
    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    const existing = await FavoriteModel.findOne({
      user: userId,
      recipe: recipeId,
    });

    if (existing) {
      await existing.deleteOne();
      return { favorited: false };
    }

    await FavoriteModel.create({ user: userId, recipe: recipeId });
    return { favorited: true };
  }

  async isFavorited(userId: string, recipeId: string): Promise<boolean> {
    const favorite = await FavoriteModel.findOne({
      user: userId,
      recipe: recipeId,
    });
    return !!favorite;
  }

  async findByUser(
    userId: string,
    query: FavoriteQuery,
  ): Promise<Paginated<Recipe>> {
    const { page, limit } = query;

    const [favorites, total] = await Promise.all([
      FavoriteModel.find({ user: userId })
        .populate({
          path: "recipe",
          populate: [
            { path: "author", select: "name email" },
            { path: "category", select: "name slug" },
          ],
        })
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      FavoriteModel.countDocuments({ user: userId }),
    ]);

    const items = favorites
      .map((fav) => fav.recipe)
      .filter((recipe) => recipe != null)
      .map((recipe) => toRecipe(recipe as unknown as IRecipeDocument, true));

    return withPagination(items, total, page, limit);
  }
}
