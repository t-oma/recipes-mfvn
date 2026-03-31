import type { PaginatedResult, Recipe } from "@recipes/shared";
import { AppError } from "@/common/errors.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import type { FavoriteQuery } from "./favorite.schema.js";

function toRecipe(doc: unknown): Recipe {
  const d = doc as Record<string, unknown>;
  const category = d.category as Record<string, unknown>;
  const author = d.author as Record<string, unknown>;
  return {
    id: String(d._id),
    title: d.title as string,
    description: d.description as string,
    ingredients: d.ingredients as Recipe["ingredients"],
    instructions: d.instructions as string[],
    category: {
      id: String(category._id),
      name: category.name as string,
      slug: category.slug as string,
    },
    author: {
      id: String(author._id),
      email: author.email as string,
      name: author.name as string,
    },
    difficulty: d.difficulty as Recipe["difficulty"],
    cookingTime: d.cookingTime as Recipe["cookingTime"],
    servings: d.servings as number,
    isPublic: d.isPublic as boolean,
    isFavorited: true,
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  };
}

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
  ): Promise<PaginatedResult<Recipe>> {
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
      .map((recipe) => toRecipe(recipe));

    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
