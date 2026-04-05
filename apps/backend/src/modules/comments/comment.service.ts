import type { Comment, CommentForRecipe, Paginated } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { Model, QueryFilter } from "mongoose";
import mongoose from "mongoose";
import { AppError } from "@/common/errors.js";
import { toComment, toCommentForRecipe } from "@/common/utils/mongo.js";
import type {
  CommentDocument,
  CommentQuery,
  CreateCommentBody,
  RecipeCommentsParams,
} from "@/modules/comments/index.js";
import type { RecipeDocument } from "@/modules/recipes/index.js";
import type { UserDocument } from "@/modules/users/index.js";

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
  commentModel: Model<CommentDocument>,
  recipeModel: Model<RecipeDocument>,
  userModel: Model<UserDocument>,
): CommentService {
  return {
    findByRecipe: async (params, query) => {
      const { page, limit } = query;
      const { recipeId } = params;

      if (!mongoose.isValidObjectId(params.recipeId)) {
        throw new AppError("Invalid recipe ID", 400);
      }
      const recipeExists = await recipeModel.exists({ _id: recipeId });
      if (!recipeExists) {
        throw new AppError("Recipe not found", 404);
      }

      const filter: QueryFilter<CommentDocument> = { recipe: recipeId };

      const [items, total] = await Promise.all([
        commentModel
          .find(filter)
          .populate<{ author: Pick<UserDocument, "_id" | "name" | "email"> }>(
            "author",
            "name email",
          )
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        commentModel.countDocuments(filter),
      ]);

      return withPagination(
        items.map((item) => toCommentForRecipe(item)),
        total,
        page,
        limit,
      );
    },

    create: async (recipeId, authorId, data) => {
      if (!mongoose.isValidObjectId(recipeId)) {
        throw new AppError("Invalid recipe ID", 400);
      }
      if (!mongoose.isValidObjectId(authorId)) {
        throw new AppError("Invalid author ID", 400);
      }

      const recipeExists = await recipeModel.exists({ _id: recipeId });
      if (!recipeExists) {
        throw new AppError("Recipe not found", 404);
      }
      const authorExists = await userModel.exists({ _id: authorId });
      if (!authorExists) {
        throw new AppError("Author not found", 404);
      }

      const comment = await commentModel.create({
        text: data.text,
        recipe: recipeId,
        author: authorId,
      });
      const populated = await comment.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
      }>("author", "name email");

      return toCommentForRecipe(populated.toObject<typeof populated>());
    },

    findByUser: async (userId, query) => {
      if (!mongoose.isValidObjectId(userId)) {
        throw new AppError("Invalid user ID", 400);
      }

      const { page, limit } = query;
      const filter: QueryFilter<CommentDocument> = { author: userId };

      const [items, total] = await Promise.all([
        commentModel
          .find(filter)
          .populate<{ author: Pick<UserDocument, "_id" | "name" | "email"> }>(
            "author",
            "name email",
          )
          .populate<{ recipe: Pick<RecipeDocument, "_id" | "title"> }>(
            "recipe",
            "title",
          )
          .sort("-createdAt")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        commentModel.countDocuments(filter),
      ]);

      return withPagination(items.map(toComment), total, page, limit);
    },

    delete: async (id, userId) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new AppError("Invalid comment ID", 400);
      }

      const comment = await commentModel.findById(id);
      if (!comment) {
        throw new AppError("Comment not found", 404);
      }

      if (!comment.author.equals(userId)) {
        throw new AppError("Not authorized to delete this comment", 403);
      }

      await comment.deleteOne();
    },
  };
}
