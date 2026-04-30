import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockUserRepository,
  createObjectId,
  createUserDoc,
  queryParams,
} from "@/__tests__/helpers.js";
import { NotFoundError } from "@/common/errors.js";
import type { CommentService } from "@/modules/comments/comment.service.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import { createUserService } from "@/modules/users/user.service.js";
import type { UserRepository } from "./user.repository.js";

describe("userService", () => {
  const userRepository = createMockUserRepository();
  const commentService = {
    findByAuthor: vi.fn(),
    findByRecipe: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const favoriteService = {
    findByUser: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    isFavorited: vi.fn(),
  };
  const service = createUserService(
    userRepository as unknown as UserRepository,
    commentService as unknown as CommentService,
    favoriteService as unknown as FavoriteService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("should return user by ID", async () => {
      const doc = createUserDoc({ email: "user@test.com", name: "Test" });
      userRepository.findById.mockReturnValue(doc);

      const result = await service.getCurrentUser(createObjectId().toString());

      expect(result.email).toBe("user@test.com");
      expect(result.name).toBe("Test");
      expect(result).not.toHaveProperty("password");
    });

    it("should throw NotFoundError when user not found", async () => {
      userRepository.findById.mockReturnValue(null);

      await expect(
        service.getCurrentUser(createObjectId().toString()),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getFavorites", () => {
    it("should delegate to favoriteService.findByUser", async () => {
      const expected = {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
      favoriteService.findByUser.mockResolvedValue(expected);

      const result = await service.getFavorites(
        createObjectId().toString(),
        queryParams(),
      );

      expect(favoriteService.findByUser).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe("getComments", () => {
    it("should delegate to commentService.findByAuthor", async () => {
      const expected = {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
      commentService.findByAuthor.mockResolvedValue(expected);

      const result = await service.getComments(
        createObjectId().toString(),
        queryParams(),
      );

      expect(commentService.findByAuthor).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });
});
