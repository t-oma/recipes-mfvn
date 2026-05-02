import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockFavoriteRepository,
  createMockRecipeRepository,
  createMockUserRepository,
  createObjectId,
  createRecipeDoc,
  initiator,
  populateRecipeDoc,
  queryParams,
} from "@/__tests__/helpers.js";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import type { FavoriteRepository } from "@/modules/favorites/favorite.repository.js";
import { createFavoriteService } from "@/modules/favorites/favorite.service.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { UserRepository } from "@/modules/users/user.repository.js";

describe("favoriteService", () => {
  const favoriteRepository = createMockFavoriteRepository();
  const recipeRepository = createMockRecipeRepository();
  const userRepository = createMockUserRepository();

  const service = createFavoriteService(
    favoriteRepository as unknown as FavoriteRepository,
    recipeRepository as unknown as RecipeRepository,
    userRepository as unknown as UserRepository,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("add", () => {
    it("should add a favorite and return favorited: true", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(true);

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.add(recipeId, { initiator: init });

      expect(result).toEqual({ favorited: true });
      expect(favoriteRepository.create).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.add(createObjectId().toString(), {
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for invalid recipe ID", async () => {
      userRepository.exists.mockResolvedValue(true);

      await expect(
        service.add("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      userRepository.exists.mockResolvedValue(false);
      recipeRepository.exists.mockResolvedValue(true);

      await expect(
        service.add(createObjectId().toString(), { initiator: initiator() }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(false);

      await expect(
        service.add(createObjectId().toString(), { initiator: initiator() }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("should remove a favorite and return favorited: false", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(true);

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.remove(recipeId, { initiator: init });

      expect(result).toEqual({ favorited: false });
      expect(favoriteRepository.delete).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
    });
  });

  describe("isFavorited", () => {
    it("should return true when favorite exists", async () => {
      favoriteRepository.exists.mockResolvedValue(true);

      const result = await service.isFavorited(createObjectId().toString(), {
        initiator: initiator(),
      });

      expect(result).toBe(true);
    });

    it("should return false when favorite does not exist", async () => {
      favoriteRepository.exists.mockResolvedValue(false);

      const result = await service.isFavorited(createObjectId().toString(), {
        initiator: initiator(),
      });

      expect(result).toBe(false);
    });
  });

  describe("findByUser", () => {
    it("should return paginated recipes from favorites", async () => {
      userRepository.exists.mockResolvedValue(true);
      const recipe = populateRecipeDoc(createRecipeDoc(), {
        isFavorited: true,
      });
      favoriteRepository.findByUser.mockResolvedValue([[recipe], 1]);

      const result = await service.findByUser(
        createObjectId().toString(),
        queryParams(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("should return empty paginated result when no favorites", async () => {
      userRepository.exists.mockResolvedValue(true);
      favoriteRepository.findByUser.mockResolvedValue([[], 0]);

      const result = await service.findByUser(
        createObjectId().toString(),
        queryParams(),
      );

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
