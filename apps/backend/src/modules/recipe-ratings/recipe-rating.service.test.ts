import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockBus,
  createMockRecipeRatingRepository,
  createMockRecipeRepository,
  createMockUserRepository,
  createObjectId,
  initiator,
} from "@/__tests__/helpers.js";
import { BadRequestError, NotFoundError } from "@/common/errors.js";
import type { RecipeRatingRepository } from "@/modules/recipe-ratings/recipe-rating.repository.js";
import { createRecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { UserRepository } from "@/modules/users/user.repository.js";

describe("recipeRatingService", () => {
  const repository = createMockRecipeRatingRepository();
  const recipeRepository = createMockRecipeRepository();
  const userRepository = createMockUserRepository();
  const bus = createMockBus();

  const service = createRecipeRatingService(
    repository as unknown as RecipeRatingRepository,
    recipeRepository as unknown as RecipeRepository,
    userRepository as unknown as UserRepository,
    bus,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rate", () => {
    it("should create a new rating", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(true);
      repository.upsert.mockResolvedValue({
        _id: createObjectId(),
        user: createObjectId(),
        recipe: createObjectId(),
        value: 4,
        createdAt: new Date(),
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.rate(recipeId, {
        data: { value: 4 },
        initiator: init,
      });

      expect(result).toEqual({ value: 4 });
      expect(repository.upsert).toHaveBeenCalledWith(
        { user: init.id, recipe: recipeId },
        4,
      );
      expect(bus.emit).toHaveBeenCalledWith("recipe:rated", recipeId);
    });

    it("should update an existing rating", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(true);
      repository.upsert.mockResolvedValue({
        _id: createObjectId(),
        user: createObjectId(),
        recipe: createObjectId(),
        value: 5,
        createdAt: new Date(),
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      const result = await service.rate(recipeId, {
        data: { value: 5 },
        initiator: init,
      });

      expect(result).toEqual({ value: 5 });
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.rate(createObjectId().toString(), {
          data: { value: 3 },
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for invalid recipe ID", async () => {
      userRepository.exists.mockResolvedValue(true);

      await expect(
        service.rate("invalid-id", {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      userRepository.exists.mockResolvedValue(false);
      recipeRepository.exists.mockResolvedValue(true);

      await expect(
        service.rate(createObjectId().toString(), {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(false);

      await expect(
        service.rate(createObjectId().toString(), {
          data: { value: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("should remove an existing rating", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(true);
      repository.delete.mockResolvedValue({
        _id: createObjectId(),
        user: createObjectId(),
        recipe: createObjectId(),
        value: 4,
        createdAt: new Date(),
      });

      const init = initiator();
      const recipeId = createObjectId().toString();
      await service.remove(recipeId, { initiator: init });

      expect(repository.delete).toHaveBeenCalledWith({
        user: init.id,
        recipe: recipeId,
      });
      expect(bus.emit).toHaveBeenCalledWith("recipe:rated", recipeId);
    });

    it("should throw NotFoundError when rating does not exist", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(true);
      repository.delete.mockResolvedValue(null);

      await expect(
        service.remove(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.remove(createObjectId().toString(), {
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe does not exist", async () => {
      userRepository.exists.mockResolvedValue(true);
      recipeRepository.exists.mockResolvedValue(false);

      await expect(
        service.remove(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
