import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { isValidObjectId } from "mongoose";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type {
  FavoriteModelType,
  FavoriteQuery,
} from "@/modules/favorites/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";
import type { UserModelType } from "@/modules/users/index.js";

export interface FavoriteService {
  add(owner: string, recipeId: string): Promise<{ favorited: true }>;
  remove(owner: string, recipeId: string): Promise<{ favorited: false }>;
  findByUser(
    target: string,
    viewer: string,
    query: FavoriteQuery,
  ): Promise<Paginated<Recipe>>;
  isFavorited(viewer: string, recipeId: string): Promise<boolean>;
}

export function createFavoriteService(
  favoriteModel: FavoriteModelType,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): FavoriteService {
  async function validateUser(userId: string): Promise<void> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      throw new NotFoundError("User not found");
    }
  }
  async function validateRecipe(recipeId: string): Promise<void> {
    if (!isValidObjectId(recipeId)) {
      throw new BadRequestError("Invalid recipe ID");
    }

    const recipeExists = await recipeModel.exists({ _id: recipeId });
    if (!recipeExists) {
      throw new NotFoundError("Recipe not found");
    }
  }

  return {
    add: async (owner, recipeId) => {
      await validateUser(owner);
      await validateRecipe(recipeId);

      await favoriteModel.create({ user: owner, recipe: recipeId });
      return { favorited: true };
    },

    remove: async (owner, recipeId) => {
      await validateUser(owner);
      await validateRecipe(recipeId);

      await favoriteModel.findOneAndDelete({ user: owner, recipe: recipeId });
      return { favorited: false };
    },

    findByUser: async (target, _viewer, query) => {
      await validateUser(target);

      const { page, limit } = query;

      const [favorites, total] = await favoriteModel.findByUser(target, query);
      if (!favorites) {
        return withPagination([], 0, page, limit);
      }

      const items = favorites
        .map((fav) => fav.recipe)
        .filter((recipe) => recipe != null)
        .map((recipe) => toRecipe(recipe, true));

      return withPagination(items, total, page, limit);
    },

    isFavorited: async (viewer, recipeId) => {
      return !!(await favoriteModel.exists({ user: viewer, recipe: recipeId }));
    },
  };
}
