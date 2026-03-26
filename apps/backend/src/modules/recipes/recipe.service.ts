import type { FilterQuery } from "mongoose";
import { cleanupDoc, cleanupDocs } from "@/common/utils/transform.js";
import { User } from "@/modules/auth/user.model.js";
import { Category } from "@/modules/categories/category.model.js";
import type { IRecipe } from "@/modules/recipes/recipe.model.js";
import { Recipe } from "@/modules/recipes/recipe.model.js";
import type {
  CreateRecipeBody,
  SearchRecipeQuery,
  UpdateRecipeBody,
} from "@/modules/recipes/recipe.schema.js";

interface PaginatedResult {
  items: ReturnType<typeof cleanupDocs<Record<string, unknown>>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class RecipeService {
  async findAll(query: SearchRecipeQuery): Promise<PaginatedResult> {
    const { page, limit, sort, category, search } = query;
    const filter: FilterQuery<IRecipe> = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .populate("author", "name email")
        .populate("category", "name slug")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items: cleanupDocs(items),
      pagination: {
        page,
        limit,
        total,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    const recipe = await Recipe.findById(id)
      .populate("author", "name email")
      .populate("category", "name slug")
      .lean();

    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), {
        statusCode: 404,
      });
    }
    return cleanupDoc(recipe);
  }

  async create(data: CreateRecipeBody, authorId: string) {
    const category = await Category.findById(data.category);
    if (!category) {
      throw Object.assign(new Error("Category not found"), {
        statusCode: 400,
      });
    }

    const author = await User.findById(authorId);
    if (!author) {
      throw Object.assign(new Error("Author not found"), {
        statusCode: 400,
      });
    }

    const recipe = await Recipe.create({ ...data, author: authorId });
    return recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);
  }

  async update(id: string, data: UpdateRecipeBody, userId: string) {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), {
        statusCode: 404,
      });
    }

    if (recipe.author.toString() !== userId) {
      throw Object.assign(new Error("Not authorized to update this recipe"), {
        statusCode: 403,
      });
    }

    Object.assign(recipe, data);
    await recipe.save();
    return recipe.populate([
      { path: "author", select: "name email" },
      { path: "category", select: "name slug" },
    ]);
  }

  async delete(id: string, userId: string): Promise<void> {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), {
        statusCode: 404,
      });
    }

    if (recipe.author.toString() !== userId) {
      throw Object.assign(new Error("Not authorized to delete this recipe"), {
        statusCode: 403,
      });
    }

    await recipe.deleteOne();
  }
}
