import type {
  CategorySummary,
  Minutes,
  PaginatedResult,
  Recipe,
  UserSummary,
} from "@recipes/shared";
import type { QueryFilter } from "mongoose";
import { AppError } from "@/common/errors.js";
import { User as UserModel } from "@/modules/auth/user.model.js";
import { Category as CategoryModel } from "@/modules/categories/category.model.js";
import type { IRecipe } from "@/modules/recipes/recipe.model.js";
import { Recipe as RecipeModel } from "@/modules/recipes/recipe.model.js";
import type {
  CreateRecipeBody,
  SearchRecipeQuery,
  UpdateRecipeBody,
} from "@/modules/recipes/recipe.schema.js";

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
    } satisfies CategorySummary,
    author: {
      id: String(author._id),
      email: author.email as string,
      name: author.name as string,
    } satisfies UserSummary,
    cookingTime: d.cookingTime as Minutes,
    servings: d.servings as number,
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  };
}

export class RecipeService {
  async findAll(query: SearchRecipeQuery): Promise<PaginatedResult<Recipe>> {
    const { page, limit, sort, category, search } = query;
    const filter: QueryFilter<IRecipe> = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const [items, total] = await Promise.all([
      RecipeModel.find(filter)
        .populate("author", "name email")
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      RecipeModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items: items.map(toRecipe),
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

  async findById(id: string): Promise<Recipe> {
    const recipe = await RecipeModel.findById(id)
      .populate("author", "name email")
      .populate("category", "name slug")
      .lean();

    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }
    return toRecipe(recipe);
  }

  async create(data: CreateRecipeBody, authorId: string): Promise<Recipe> {
    const category = await CategoryModel.findById(data.category);
    if (!category) {
      throw new AppError("Category does not exist", 400);
    }

    const author = await UserModel.findById(authorId);
    if (!author) {
      throw new AppError("Author not found", 400);
    }

    const recipe = await RecipeModel.create({ ...data, author: authorId });
    const populated = await recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);
    return toRecipe(populated.toObject());
  }

  async update(
    id: string,
    data: UpdateRecipeBody,
    userId: string,
  ): Promise<Recipe> {
    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    if (recipe.author.toString() !== userId) {
      throw new AppError("Not authorized to update this recipe", 403);
    }

    Object.assign(recipe, data);
    await recipe.save();
    const populated = await recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);
    return toRecipe(populated.toObject());
  }

  async delete(id: string, userId: string): Promise<void> {
    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }

    if (recipe.author.toString() !== userId) {
      throw new AppError("Not authorized to delete this recipe", 403);
    }

    await recipe.deleteOne();
  }
}
