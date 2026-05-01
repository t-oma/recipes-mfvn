import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCommentDoc,
  createMockCommentRepository,
  createMockRecipeModel,
  createMockUserRepository,
  createObjectId,
  initiator,
  queryParams,
} from "@/__tests__/helpers.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import type { CommentRepository } from "@/modules/comments/comment.repository.js";
import { createCommentService } from "@/modules/comments/comment.service.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import type { UserRepository } from "@/modules/users/user.repository.js";

describe("commentService", () => {
  const commentRepository = createMockCommentRepository();
  const recipeModel = createMockRecipeModel();
  const userRepository = createMockUserRepository();

  const service = createCommentService(
    commentRepository as unknown as CommentRepository,
    recipeModel as unknown as RecipeModelType,
    userRepository as unknown as UserRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("findByRecipe", () => {
    it("should return paginated comments for recipe", async () => {
      recipeModel.exists.mockResolvedValue(true);
      const authorId = createObjectId();
      const recipeId = createObjectId();
      const populatedComment = {
        _id: createObjectId(),
        text: "Nice!",
        author: { _id: authorId, name: "User", email: "user@test.com" },
        recipe: { _id: recipeId, title: "Pasta" },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };
      commentRepository.findByRecipe.mockResolvedValue([[populatedComment], 1]);

      const result = await service.findByRecipe(
        recipeId.toString(),
        queryParams(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.text).toBe("Nice!");
      expect(result.pagination.total).toBe(1);
    });

    it("should throw BadRequestError for invalid recipe ID", async () => {
      await expect(
        service.findByRecipe("invalid-id", queryParams()),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      recipeModel.exists.mockResolvedValue(null);

      await expect(
        service.findByRecipe(createObjectId().toString(), queryParams()),
      ).rejects.toThrow(NotFoundError);
    });

    it("should return empty result when no comments found", async () => {
      recipeModel.exists.mockResolvedValue(true);
      commentRepository.findByRecipe.mockResolvedValue([[], 0]);

      const result = await service.findByRecipe(
        createObjectId().toString(),
        queryParams(),
      );

      expect(result.items).toEqual([]);
    });
  });

  describe("findByAuthor", () => {
    it("should return paginated comments by author", async () => {
      userRepository.exists.mockResolvedValue(true);
      const authorId = createObjectId();
      const populatedComment = {
        _id: createObjectId(),
        text: "Great!",
        author: { _id: authorId, name: "User", email: "user@test.com" },
        recipe: { _id: createObjectId(), title: "Pasta" },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };
      commentRepository.findByAuthor.mockResolvedValue([[populatedComment], 1]);

      const result = await service.findByAuthor(
        authorId.toString(),
        queryParams(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.recipe.title).toBe("Pasta");
    });

    it("should throw BadRequestError for invalid author ID", async () => {
      await expect(
        service.findByAuthor("invalid-id", queryParams()),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("create", () => {
    it("should create a comment and return populated DTO", async () => {
      recipeModel.exists.mockResolvedValue(true);
      userRepository.exists.mockResolvedValue(true);

      const authorId = createObjectId();
      const populated = {
        ...createCommentDoc({ text: "Great recipe!" }),
        author: { _id: authorId, name: "User", email: "user@test.com" },
      };
      commentRepository.create.mockResolvedValue(populated);

      const recipeId = createObjectId().toString();
      const init = initiator(authorId.toString());
      const result = await service.create(recipeId, {
        data: { text: "Great recipe!" },
        initiator: init,
      });

      expect(commentRepository.create).toHaveBeenCalledWith({
        text: "Great recipe!",
        recipe: recipeId,
        author: init.id,
      });
      expect(result.text).toBe("Great recipe!");
    });

    it("should throw BadRequestError for invalid recipe ID", async () => {
      await expect(
        service.create("invalid-id", {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for invalid author ID", async () => {
      await expect(
        service.create(createObjectId().toString(), {
          data: { text: "Hi" },
          initiator: { id: "invalid", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      recipeModel.exists.mockResolvedValue(null);

      await expect(
        service.create(createObjectId().toString(), {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when author not found", async () => {
      recipeModel.exists.mockResolvedValue(true);
      userRepository.exists.mockResolvedValue(null);

      await expect(
        service.create(createObjectId().toString(), {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete comment when author matches", async () => {
      const authorId = createObjectId();
      const comment = createCommentDoc({ author: authorId });
      commentRepository.findById.mockResolvedValue(comment);

      await service.delete(createObjectId().toString(), {
        initiator: initiator(authorId.toString()),
      });

      expect(commentRepository.findById).toHaveBeenCalled();
      expect(commentRepository.delete).toHaveBeenCalled();
    });

    it("should delete comment when user is admin", async () => {
      const comment = createCommentDoc();
      commentRepository.findById.mockResolvedValue(comment);

      await service.delete(createObjectId().toString(), {
        initiator: initiator(createObjectId().toString(), "admin"),
      });

      expect(commentRepository.delete).toHaveBeenCalled();
    });

    it("should throw BadRequestError for invalid comment ID", async () => {
      await expect(
        service.delete("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when comment not found", async () => {
      commentRepository.findById.mockResolvedValue(null);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const comment = createCommentDoc();
      commentRepository.findById.mockResolvedValue(comment);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
