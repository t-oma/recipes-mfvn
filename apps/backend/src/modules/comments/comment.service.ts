import type {
  CommentDetails,
  CreateCommentInput,
} from "@recipes/shared/comments";
import type { Paginated } from "@recipes/shared/core";
import { withPagination } from "@recipes/shared/core";
import { ForbiddenError, NotFoundError } from "@/common/errors.js";
import type { TypedEmitter } from "@/common/events.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { UserRepository } from "@/modules/users/user.repository.js";
import { toCommentDetails } from "./comment.mapper.js";
import type { CommentRepository } from "./comment.repository.js";

export interface CommentService {
  findByRecipe(
    recipeId: string,
    params: QueryMethodParams,
  ): Promise<Paginated<CommentDetails>>;
  findByAuthor(
    authorId: string,
    params: QueryMethodParams,
  ): Promise<Paginated<CommentDetails>>;
  create(
    recipeId: string,
    params: CreateMethodParams<CreateCommentInput>,
  ): Promise<CommentDetails>;
  delete(commentId: string, params: DeleteMethodParams): Promise<void>;
}

type CommentRepositoryPort = Pick<
  CommentRepository,
  "findByRecipe" | "findByAuthor" | "findById" | "create" | "delete"
>;
type RecipeRepositoryPort = Pick<RecipeRepository, "exists" | "modelName">;
type UserRepositoryPort = Pick<UserRepository, "exists" | "modelName">;

type TypedEmitterPort = Pick<TypedEmitter, "emit">;

export function createCommentService(
  repository: CommentRepositoryPort,
  recipeRepository: RecipeRepositoryPort,
  userRepository: UserRepositoryPort,
  bus: TypedEmitterPort,
): CommentService {
  return {
    findByRecipe: async (recipeId, { query, initiator }) => {
      assertValidId(recipeId, "Recipe");
      await assertExists(recipeRepository, recipeId);

      const [comments, total] = await repository.findByRecipe(recipeId, {
        query,
        initiator,
      });

      return withPagination(
        comments.map(toCommentDetails),
        total,
        query.page,
        query.limit,
      );
    },

    findByAuthor: async (authorId, { query, initiator }) => {
      assertValidId(authorId, "Author");
      await assertExists(userRepository, authorId);

      const [comments, total] = await repository.findByAuthor(authorId, {
        query,
        initiator,
      });

      return withPagination(
        comments.map(toCommentDetails),
        total,
        query.page,
        query.limit,
      );
    },

    create: async (recipeId, { data, initiator }) => {
      assertValidId(recipeId, "Recipe");
      assertValidId(initiator.id, "Author");

      await assertExists(recipeRepository, recipeId);
      await assertExists(userRepository, initiator.id);

      const comment = await repository.create({
        text: data.text,
        recipe: recipeId,
        author: initiator.id,
      });

      bus.emit("comment:created", {
        recipeId: recipeId,
        commentId: comment._id.toHexString(),
      });

      return toCommentDetails(comment);
    },

    delete: async (id, { initiator }) => {
      assertValidId(id, "Comment");

      const comment = await repository.findById(id);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }

      if (
        !comment.author._id.equals(initiator.id) &&
        initiator.role !== "admin"
      ) {
        throw new ForbiddenError("Not authorized to delete this comment");
      }

      await repository.delete(id);

      bus.emit("comment:deleted", {
        recipeId: comment.recipe._id.toHexString(),
        commentId: id,
      });
    },
  };
}
