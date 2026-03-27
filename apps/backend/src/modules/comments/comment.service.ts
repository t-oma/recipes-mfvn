import type {
  Comment as CommentType,
  PaginatedResult,
  UserSummary,
} from "@recipes/shared";
import type { FilterQuery } from "mongoose";
import type { IComment } from "@/modules/comments/comment.model.js";
import { Comment as CommentModel } from "@/modules/comments/comment.model.js";
import type {
  CommentQuery,
  CreateCommentBody,
  RecipeCommentsParams,
} from "@/modules/comments/comment.schema.js";
import { Recipe as RecipeModel } from "@/modules/recipes/recipe.model.js";
import { User as UserModel } from "../auth/user.model.js";

function toComment(doc: unknown): CommentType {
  const d = doc as Record<string, unknown>;
  const author = d.author as Record<string, unknown>;
  return {
    id: String(d._id),
    text: d.text as string,
    recipeId: String(d.recipe),
    author: {
      id: String(author._id),
      email: author.email as string,
      name: author.name as string,
    } satisfies UserSummary,
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  };
}

export class CommentService {
  async findByRecipe(
    params: RecipeCommentsParams,
    query: CommentQuery,
  ): Promise<PaginatedResult<CommentType>> {
    const { page, limit } = query;
    const { recipeId } = params;

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), { statusCode: 404 });
    }
    const filter: FilterQuery<IComment> = {};

    if (recipe) {
      filter.recipe = recipeId;
    }

    const [items, total] = await Promise.all([
      CommentModel.find(filter)
        .populate("author", "name email")
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CommentModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items: items.map(toComment),
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

  async create(
    recipeId: string,
    authorId: string,
    data: CreateCommentBody,
  ): Promise<CommentType> {
    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      throw Object.assign(new Error("Recipe not found"), { statusCode: 404 });
    }

    const author = await UserModel.findById(authorId);
    if (!author) {
      throw Object.assign(new Error("Author not found"), { statusCode: 404 });
    }

    const comment = await CommentModel.create({
      text: data.text,
      recipe: recipeId,
      author: authorId,
    });

    const populated = await comment.populate("author", "name email");
    return toComment(populated.toObject());
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await CommentModel.findById(id);
    if (!comment) {
      throw Object.assign(new Error("Comment not found"), { statusCode: 404 });
    }

    if (comment.author.toString() !== userId) {
      throw Object.assign(new Error("Not authorized to delete this comment"), {
        statusCode: 403,
      });
    }

    await comment.deleteOne();
  }
}
