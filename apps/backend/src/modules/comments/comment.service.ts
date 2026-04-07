import type { Comment, CommentForRecipe, Paginated } from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import mongoose from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import { toComment, toCommentForRecipe } from "@/common/utils/mongo.js";
import type {
  CommentModelType,
  CommentQuery,
  CreateCommentBody,
} from "@/modules/comments/index.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";
import type { UserDocument, UserModelType } from "@/modules/users/index.js";

export interface CommentService {
  findByRecipe(
    params: { recipeId: string; viewer?: string },
    query: CommentQuery,
  ): Promise<Paginated<CommentForRecipe>>;
  findByUser(
    target: string,
    viewer: string,
    query: CommentQuery,
  ): Promise<Paginated<Comment>>;
  create(
    recipeId: string,
    author: string,
    data: CreateCommentBody,
  ): Promise<CommentForRecipe>;
  delete(id: string, owner: string): Promise<void>;
}

export function createCommentService(
  commentModel: CommentModelType,
  recipeModel: RecipeModelType,
  userModel: UserModelType,
): CommentService {
  return {
    findByRecipe: async (params, query) => {
      const { page, limit } = query;
      if (!mongoose.isValidObjectId(params.recipeId)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      const recipeExists = await recipeModel.exists({ _id: params.recipeId });
      if (!recipeExists) {
        throw new NotFoundError("Recipe not found");
      }

      const [comments, total] = await commentModel.findFull(
        { by: "recipe", recipeId: params.recipeId },
        { viewerId: params.viewer },
        query,
      );
      if (!comments) {
        return withPagination([], 0, page, limit);
      }

      return withPagination(
        comments.map((item) => toCommentForRecipe(item)),
        total,
        page,
        limit,
      );
    },

    findByUser: async (target, viewer, query) => {
      if (!mongoose.isValidObjectId(target)) {
        throw new BadRequestError("Invalid user ID");
      }

      const { page, limit } = query;

      const [comments, total] = await commentModel.findFull(
        { by: "author", authorId: target },
        { viewerId: viewer },
        query,
      );
      if (!comments) {
        return withPagination([], 0, page, limit);
      }

      return withPagination(comments.map(toComment), total, page, limit);
    },

    create: async (recipeId, author, data) => {
      if (!mongoose.isValidObjectId(recipeId)) {
        throw new BadRequestError("Invalid recipe ID");
      }
      if (!mongoose.isValidObjectId(author)) {
        throw new BadRequestError("Invalid author ID");
      }

      const recipeExists = await recipeModel.exists({ _id: recipeId });
      if (!recipeExists) {
        throw new NotFoundError("Recipe not found");
      }
      const authorExists = await userModel.exists({ _id: author });
      if (!authorExists) {
        throw new NotFoundError("Author not found");
      }

      const comment = await commentModel.create({
        text: data.text,
        recipe: recipeId,
        author,
      });
      const populated = await comment.populate<{
        author: Pick<UserDocument, "_id" | "name" | "email">;
      }>("author", "name email");

      return toCommentForRecipe(populated.toObject<typeof populated>());
    },

    delete: async (id, owner) => {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestError("Invalid comment ID");
      }

      const comment = await commentModel.findById(id);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      if (!comment.author.equals(owner)) {
        throw new ForbiddenError("Not authorized to delete this comment");
      }

      await comment.deleteOne();
    },
  };
}
