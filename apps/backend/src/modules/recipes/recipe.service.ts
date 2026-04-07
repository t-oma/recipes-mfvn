import type { Paginated, Recipe } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import { isValidObjectId } from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import { toRecipe } from "@/common/utils/mongo.js";
import type {
  CategoryDocument,
  CategoryModelType,
} from "@/modules/categories/index.js";
import type { FavoriteModelType } from "@/modules/favorites/index.js";
import type {
  CreateRecipeBody,
  RecipeModelType,
  SearchRecipeQuery,
  UpdateRecipeBody,
} from "@/modules/recipes/index.js";
import type { UserDocument, UserModelType } from "@/modules/users/index.js";

export interface RecipeService {
  findAll(
    query: SearchRecipeQuery,
    viewer?: string,
  ): Promise<Paginated<Recipe>>;
  findById(id: string, viewer?: string): Promise<Recipe>;
  create(data: CreateRecipeBody, author: string): Promise<Recipe>;
  update(id: string, data: UpdateRecipeBody, owner: string): Promise<Recipe>;
  delete(id: string, owner: string): Promise<void>;
}

export function createRecipeService(
  recipeModel: RecipeModelType,
  userModel: UserModelType,
  favoriteModel: FavoriteModelType,
  categoryModel: CategoryModelType,
): RecipeService {
  return {
    findAll: async (query, viewer) => {
      const { page, limit, isFavorited } = query;

      if (isFavorited && !viewer) {
        return withPagination([], 0, page, limit);
      }

      const [recipes, total] = await recipeModel.searchFull(query, viewer);
      if (!recipes) {
        return withPagination([], 0, page, limit);
      }

      return withPagination(
        recipes.map((recipe) => toRecipe(recipe, recipe.isFavorited)),
        total,
        page,
        limit,
      );
    },

    findById: async (id, viewer) => {
      if (!isValidObjectId(id)) {
        throw new BadRequestError("Invalid recipe ID");
      }

      const recipe = await recipeModel.findByIdFull(id, viewer);
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      return toRecipe(recipe, recipe.isFavorited);
    },

    create: async (data, author) => {
      if (!isValidObjectId(author)) {
        throw new BadRequestError("Invalid author ID");
      }
      if (!isValidObjectId(data.category)) {
        throw new BadRequestError("Invalid category ID");
      }

      const categoryExists = await categoryModel.exists({ _id: data.category });
      if (!categoryExists) {
        throw new NotFoundError("Category not found");
      }

      const authorExists = await userModel.exists({ _id: author });
      if (!authorExists) {
        throw new NotFoundError("Author not found");
      }

      const recipe = await recipeModel.create({ ...data, author });
      const populated = await recipe.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
        category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      }>([
        { path: "author", select: "name email" },
        { path: "category", select: "name slug" },
      ]);
      return toRecipe(populated.toObject<typeof populated>(), false);
    },

    update: async (id, data, owner) => {
      if (!isValidObjectId(id)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      const recipe = await recipeModel.findById(id);
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(owner)) {
        throw new ForbiddenError("Not authorized to update this recipe");
      }

      Object.assign(recipe, data);
      await recipe.save();
      const populated = await recipe.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
        category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      }>([
        { path: "author", select: "name email" },
        { path: "category", select: "name slug" },
      ]);

      let isFavorited = false;
      if (owner) {
        const favorite = await favoriteModel
          .findOne({
            user: owner,
            recipe: id,
          })
          .lean();
        isFavorited = !!favorite;
      }

      return toRecipe(populated.toObject<typeof populated>(), isFavorited);
    },

    delete: async (id, owner) => {
      if (!isValidObjectId(id)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      const recipe = await recipeModel.findById(id).select("+author");
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(owner)) {
        throw new ForbiddenError("Not authorized to delete this recipe");
      }

      await recipe.deleteOne();
    },
  };
}
