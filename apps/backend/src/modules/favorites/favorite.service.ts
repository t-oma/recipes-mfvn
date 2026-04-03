import type { Paginated, Recipe, Replace } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { Model } from "mongoose";
import mongoose from "mongoose";
import { AppError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type { ICategoryDocument } from "@/modules/categories/index.js";
import type {
  FavoriteQuery,
  IFavoriteDocument,
} from "@/modules/favorites/index.js";
import type { IRecipeDocument } from "@/modules/recipes/index.js";
import type { IUserDocument } from "@/modules/users/index.js";

export interface FavoriteService {
  add(userId: string, recipeId: string): Promise<{ favorited: true }>;
  remove(userId: string, recipeId: string): Promise<{ favorited: false }>;
  findByUser(userId: string, query: FavoriteQuery): Promise<Paginated<Recipe>>;
  isFavorited(userId: string, recipeId: string): Promise<boolean>;
}

export function createFavoriteService(
  favoriteModel: Model<IFavoriteDocument>,
  recipeModel: Model<IRecipeDocument>,
  userModel: Model<IUserDocument>,
): FavoriteService {
  async function validateUser(userId: string): Promise<void> {
    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      throw new AppError("User not found", 404);
    }
  }
  async function validateRecipe(recipeId: string): Promise<void> {
    if (!mongoose.isValidObjectId(recipeId)) {
      throw new AppError("Invalid recipe ID", 400);
    }

    const recipeExists = await recipeModel.exists({ _id: recipeId });
    if (!recipeExists) {
      throw new AppError("Recipe not found", 404);
    }
  }

  return {
    add: async (userId, recipeId) => {
      await validateUser(userId);
      await validateRecipe(recipeId);

      await favoriteModel.create({ user: userId, recipe: recipeId });
      return { favorited: true };
    },
    remove: async (userId, recipeId) => {
      await validateUser(userId);
      await validateRecipe(recipeId);

      await favoriteModel.findOneAndDelete({ user: userId, recipe: recipeId });
      return { favorited: false };
    },
    findByUser: async (userId, query) => {
      await validateUser(userId);

      const { page, limit } = query;

      const [favorites, total] = await Promise.all([
        favoriteModel
          .find({ user: userId })
          .select({ recipe: 1, createdAt: 1 })
          .populate<{
            recipe: Replace<
              IRecipeDocument,
              {
                category: Pick<ICategoryDocument, "_id" | "name" | "slug">;
                author: Pick<IUserDocument, "_id" | "name" | "email">;
              }
            >;
          }>({
            path: "recipe",
            match: { $or: [{ isPublic: true }, { author: userId }] },
            populate: [
              { path: "author", select: "name email" },
              { path: "category", select: "name slug" },
            ],
          })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        favoriteModel.countDocuments({
          user: userId,
        }),
      ]);

      const items = favorites
        .map((fav) => fav.recipe)
        .filter((recipe) => recipe != null)
        .map((recipe) => toRecipe(recipe, true));

      return withPagination(items, total, page, limit);
    },
    isFavorited: async (userId, recipeId) => {
      return !!(await favoriteModel.exists({ user: userId, recipe: recipeId }));
    },
  };
}
