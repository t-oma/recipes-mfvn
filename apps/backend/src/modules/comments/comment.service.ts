import type { Comment, CommentForRecipe, Paginated } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { Model, QueryFilter } from "mongoose";
import { AppError } from "@/common/errors.js";
import { toComment, toCommentForRecipe } from "@/common/utils/mongo.js";
import type {
  CommentQuery,
  CreateCommentBody,
  ICommentDocument,
  RecipeCommentsParams,
} from "@/modules/comments/index.js";
import type { IRecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { IUserDocument } from "@/modules/users/user.model.js";

export interface CommentService {
  findByRecipe(
    params: RecipeCommentsParams,
    query: CommentQuery,
  ): Promise<Paginated<CommentForRecipe>>;
  create(
    recipeId: string,
    authorId: string,
    data: CreateCommentBody,
  ): Promise<CommentForRecipe>;
  findByUser(userId: string, query: CommentQuery): Promise<Paginated<Comment>>;
  delete(id: string, userId: string): Promise<void>;
}

export function createCommentService(
  commentModel: Model<ICommentDocument>,
  recipeModel: Model<IRecipeDocument>,
  userModel: Model<IUserDocument>,
): CommentService {
  return {
    findByRecipe: async (params, query) => {
      const { page, limit } = query;
      const { recipeId } = params;

      const recipe = await recipeModel.findById(recipeId);
      if (!recipe) {
        throw new AppError("Recipe not found", 404);
      }

      const filter: QueryFilter<ICommentDocument> = { recipe: recipeId };

      const [items, total] = await Promise.all([
        commentModel
          .find(filter)
          .populate("author", "name email")
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        commentModel.countDocuments(filter),
      ]);

      return withPagination(items.map(toCommentForRecipe), total, page, limit);
    },
    create: async (recipeId, authorId, data) => {
      const recipe = await recipeModel.findById(recipeId);
      if (!recipe) {
        throw new AppError("Recipe not found", 404);
      }

      const author = await userModel.findById(authorId);
      if (!author) {
        throw new AppError("Author not found", 404);
      }

      const comment = await commentModel.create({
        text: data.text,
        recipe: recipeId,
        author: authorId,
      });

      const populated = await comment.populate("author", "name email");
      return toCommentForRecipe(populated.toObject());
    },
    findByUser: async (userId, query) => {
      const { page, limit } = query;

      const filter: QueryFilter<ICommentDocument> = { author: userId };

      const [items, total] = await Promise.all([
        commentModel
          .find(filter)
          .populate("author", "name email")
          .populate("recipe", "title")
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        commentModel.countDocuments(filter),
      ]);

      return withPagination(items.map(toComment), total, page, limit);
    },
    delete: async (id, userId) => {
      const comment = await commentModel.findById(id);
      if (!comment) {
        throw new AppError("Comment not found", 404);
      }

      if (comment.author.toString() !== userId) {
        throw new AppError("Not authorized to delete this comment", 403);
      }

      await comment.deleteOne();
    },
  };
}
