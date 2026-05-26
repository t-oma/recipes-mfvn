import type { MealType, Minutes, RecipeQuery } from "@recipes/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createObjectId,
  createRecipeDoc,
  initiator,
  noInitiator,
  populateRecipeDoc,
} from "@/__tests__/helpers.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import { recipeCache } from "@/modules/recipes/recipe.cache.js";
import { createRecipeService } from "@/modules/recipes/recipe.service.js";

describe("recipeService", () => {
  const mockRecipeRepository = {
    findDocumentById: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    deleteDocument: vi.fn(),
    aggregateSearch: vi.fn(),
    aggregateById: vi.fn(),
  };
  const mockUserRepository = {
    exists: vi.fn(),
    modelName: "User",
  };
  const mockFavoriteRepository = {
    exists: vi.fn(),
    findByUser: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    isFavorited: vi.fn(),
  };
  const mockCategoryRepository = {
    exists: vi.fn(),
    modelName: "Category",
  };
  const mockCuisineRepository = {
    exists: vi.fn(),
    findOne: vi.fn(),
    modelName: "Cuisine",
  };
  const mockCache = {
    getOrSet: vi.fn(),
    delete: vi.fn(),
    deletePattern: vi.fn(),
  };
  const mockBus = {
    emit: vi.fn(),
  };

  const service = createRecipeService(
    mockRecipeRepository,
    mockUserRepository,
    mockFavoriteRepository,
    mockCategoryRepository,
    mockCuisineRepository,
    mockCache,
    mockBus,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    beforeEach(() => {
      mockCache.getOrSet.mockImplementation(async (key, factory, ttl) => ({
        value: await factory(),
        cache: {
          status: "miss" as const,
          key,
          ttl: ttl ?? 0,
        },
      }));
    });

    it("should return paginated recipes", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[populated], 1]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0]?.title).toBe("Test Recipe");
      expect(result.value.pagination.total).toBe(1);
      expect(result.cache.status).toBe("miss");
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        recipeCache.keys.list(query),
        expect.any(Function),
        recipeCache.ttl.list,
      );
    });

    it("should return empty when aggregate returns empty result", async () => {
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[], 0]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.value.items).toEqual([]);
      expect(result.value.pagination.total).toBe(0);
      expect(result.cache.status).toBe("miss");
    });

    it("should return empty when isFavorited filter is set but no initiator", async () => {
      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
        isFavorited: true,
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.value.items).toEqual([]);
      expect(result.cache.status).toBe("bypass");
      if (result.cache.status === "bypass") {
        expect(result.cache.reason).toBe("not-applicable");
      }
      expect(mockRecipeRepository.aggregateSearch).not.toHaveBeenCalled();
      expect(mockCache.getOrSet).not.toHaveBeenCalled();
    });

    it("should return rating data from aggregation", async () => {
      const populated = populateRecipeDoc(createRecipeDoc(), {
        userRating: 4,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 15,
          ratingSum: 63,
          averageRating: 4.2,
          popularity: 0,
        },
      });
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[populated], 1]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.value.items[0]?.userRating).toBe(4);
      expect(result.value.items[0]?.stats.averageRating).toBe(4.2);
      expect(result.value.items[0]?.stats.ratingCount).toBe(15);
    });

    it("should return null ratings when recipe has no ratings", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateSearch.mockResolvedValue([[populated], 1]);

      const query = {
        page: 1,
        limit: 10,
        sort: "-createdAt",
      } satisfies RecipeQuery;
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.value.items[0]?.userRating).toBeNull();
      expect(result.value.items[0]?.stats.averageRating).toBeNull();
      expect(result.value.items[0]?.stats.ratingCount).toBe(0);
    });
  });

  describe("findById", () => {
    beforeEach(() => {
      mockCache.getOrSet.mockImplementation(async (key, factory, ttl) => ({
        value: await factory(),
        cache: {
          status: "miss" as const,
          key,
          ttl: ttl ?? 0,
        },
      }));
    });

    it("should return recipe by ID", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateById.mockResolvedValue(populated);

      const id = createObjectId().toString();
      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(result.value.title).toBe("Test Recipe");
      expect(result.cache.status).toBe("miss");
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        recipeCache.keys.byId(id),
        expect.any(Function),
        recipeCache.ttl.byId,
      );
    });

    it("should return cached recipe on second call for unauthenticated user", async () => {
      const populated = populateRecipeDoc(createRecipeDoc());
      mockRecipeRepository.aggregateById.mockResolvedValue(populated);

      const id = createObjectId().toString();
      await service.findById(id, { initiator: noInitiator() });
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        recipeCache.keys.byId(id),
        expect.any(Function),
        recipeCache.ttl.byId,
      );

      vi.clearAllMocks();
      mockCache.getOrSet.mockResolvedValue({
        value: populated,
        cache: {
          status: "hit" as const,
          key: recipeCache.keys.byId(id),
          ttl: recipeCache.ttl.byId,
        },
      });

      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(mockRecipeRepository.aggregateById).not.toHaveBeenCalled();
      expect(result.value.title).toBe("Test Recipe");
      expect(result.cache.status).toBe("hit");
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        recipeCache.keys.byId(id),
        expect.any(Function),
        recipeCache.ttl.byId,
      );
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.findById("invalid-id", {
          initiator: noInitiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      mockRecipeRepository.aggregateById.mockResolvedValue(undefined);

      const id = createObjectId().toString();
      await expect(
        service.findById(id, {
          initiator: noInitiator(),
        }),
      ).rejects.toThrow(NotFoundError);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        recipeCache.keys.byId(id),
        expect.any(Function),
        recipeCache.ttl.byId,
      );
    });

    it("should return rating data from aggregation", async () => {
      const populated = populateRecipeDoc(createRecipeDoc(), {
        userRating: 5,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 42,
          ratingSum: 160,
          averageRating: 3.8,
          popularity: 0,
        },
      });
      mockRecipeRepository.aggregateById.mockResolvedValue(populated);

      const id = createObjectId().toString();
      const result = await service.findById(id, {
        initiator: noInitiator(),
      });

      expect(result.value.userRating).toBe(5);
      expect(result.value.stats.averageRating).toBe(3.8);
      expect(result.value.stats.ratingCount).toBe(42);
    });
  });

  describe("create", () => {
    const createData = {
      title: "New Recipe",
      description: "A new recipe",
      ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
      instructions: ["Mix"],
      difficulty: "easy" as const,
      cookingTime: 20 as Minutes,
      servings: 2,
      isPublic: true,
      image: { url: "https://example.com/image.jpg" },
    };

    it("should create and return a recipe", async () => {
      mockCategoryRepository.exists.mockResolvedValue(true);
      mockUserRepository.exists.mockResolvedValue(true);

      const authorId = createObjectId();
      const categoryId = createObjectId();
      const mealType: MealType = "breakfast";
      const populated = populateRecipeDoc(
        createRecipeDoc({ title: "New Recipe" }),
        {
          author: { _id: authorId, name: "Chef", email: "chef@test.com" },
          category: {
            _id: categoryId,
            name: "Italian",
            slug: "italian",
            image: { url: "https://example.com/italian.jpg" },
          },
          mealType,
        },
      );

      mockRecipeRepository.create.mockResolvedValue(populated);

      const result = await service.create({
        data: { ...createData, category: categoryId.toString(), mealType },
        initiator: initiator(authorId.toString()),
      });

      expect(mockRecipeRepository.create).toHaveBeenCalledWith({
        ...createData,
        category: categoryId.toString(),
        author: authorId.toString(),
        mealType,
      });
      expect(result.title).toBe("New Recipe");
      expect(result.userRating).toBeNull();
      expect(result.stats.averageRating).toBeNull();
      expect(result.stats.ratingCount).toBe(0);
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:created", {
        recipeId: populated._id.toHexString(),
      });
    });

    it("should throw BadRequestError for invalid author ID", async () => {
      await expect(
        service.create({
          data: {
            ...createData,
            category: createObjectId().toString(),
            mealType: "breakfast",
          },
          initiator: { id: "invalid", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw BadRequestError for invalid category ID", async () => {
      await expect(
        service.create({
          data: { ...createData, category: "invalid", mealType: "breakfast" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when category not found", async () => {
      mockCategoryRepository.exists.mockResolvedValue(null);

      await expect(
        service.create({
          data: {
            ...createData,
            category: createObjectId().toString(),
            mealType: "breakfast",
          },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when author not found", async () => {
      mockCategoryRepository.exists.mockResolvedValue(true);
      mockUserRepository.exists.mockResolvedValue(null);

      await expect(
        service.create({
          data: {
            ...createData,
            category: createObjectId().toString(),
            mealType: "breakfast",
          },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should return recipe with default stats when created", async () => {
      mockCategoryRepository.exists.mockResolvedValue(true);
      mockUserRepository.exists.mockResolvedValue(true);

      const authorId = createObjectId();
      const categoryId = createObjectId();
      const mealType: MealType = "breakfast";
      const populated = populateRecipeDoc(
        createRecipeDoc({ title: "New Recipe" }),
        {
          author: { _id: authorId, name: "Chef", email: "chef@test.com" },
          category: {
            _id: categoryId,
            name: "Italian",
            slug: "italian",
            image: { url: "https://example.com/italian.jpg" },
          },
          mealType,
        },
      );

      mockRecipeRepository.create.mockResolvedValue(populated);

      const result = await service.create({
        data: { ...createData, category: categoryId.toString(), mealType },
        initiator: initiator(authorId.toString()),
      });

      expect(result.stats).toEqual({
        favoritesCount: 0,
        commentsCount: 0,
        ratingCount: 0,
        ratingSum: 0,
        averageRating: null,
        popularity: 0,
      });
    });
  });

  describe("update", () => {
    it("should update recipe when author matches", async () => {
      const authorId = createObjectId();
      const recipe = createRecipeDoc({
        author: authorId,
        mealType: "breakfast",
      });
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);
      mockFavoriteRepository.exists.mockResolvedValue(false);
      mockRecipeRepository.save.mockResolvedValue(
        populateRecipeDoc(recipe, {
          title: "Updated",
          mealType: "lunch",
        }),
      );

      const id = createObjectId().toString();
      const result = await service.update(id, {
        data: { title: "Updated", mealType: "lunch" },
        initiator: initiator(authorId.toString()),
      });

      expect(mockRecipeRepository.findDocumentById).toHaveBeenCalledWith(id, {
        populate: false,
      });
      expect(mockRecipeRepository.save).toHaveBeenCalledWith(recipe, {
        title: "Updated",
        mealType: "lunch",
      });
      expect(result.title).toBe("Updated");
      expect(result.mealType).toBe("lunch");
      expect(result.userRating).toBeNull();
      expect(result.stats.averageRating).toBeNull();
      expect(result.stats.ratingCount).toBe(0);
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:updated", {
        recipeId: id,
      });
    });

    it("should update recipe when user is admin", async () => {
      const authorId = createObjectId();
      const recipe = createRecipeDoc({ author: authorId });
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);
      mockFavoriteRepository.exists.mockResolvedValue(false);
      mockRecipeRepository.save.mockResolvedValue(
        populateRecipeDoc(createRecipeDoc({ author: authorId }), {
          title: "Updated",
        }),
      );

      const id = createObjectId().toString();
      await expect(
        service.update(id, {
          data: { title: "Updated" },
          initiator: initiator(createObjectId().toString(), "admin"),
        }),
      ).resolves.toBeDefined();
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:updated", {
        recipeId: id,
      });
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.update("invalid-id", {
          data: {},
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      mockRecipeRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.update(createObjectId().toString(), {
          data: {},
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const recipe = createRecipeDoc();
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      await expect(
        service.update(recipe._id.toString(), {
          data: {},
          initiator: initiator(createObjectId().toString()),
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should preserve existing stats when updating only title", async () => {
      const authorId = createObjectId();
      const recipe = createRecipeDoc({ author: authorId });
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);
      mockFavoriteRepository.exists.mockResolvedValue(false);
      mockRecipeRepository.save.mockResolvedValue(
        populateRecipeDoc(createRecipeDoc({ author: authorId }), {
          title: "Updated",
          stats: {
            favoritesCount: 5,
            commentsCount: 3,
            ratingCount: 10,
            ratingSum: 45,
            averageRating: 4.5,
            popularity: 42,
          },
        }),
      );

      const id = createObjectId().toString();
      const result = await service.update(id, {
        data: { title: "Updated" },
        initiator: initiator(authorId.toString()),
      });

      expect(result.title).toBe("Updated");
      expect(result.stats).toEqual({
        favoritesCount: 5,
        commentsCount: 3,
        ratingCount: 10,
        ratingSum: 45,
        averageRating: 4.5,
        popularity: 42,
      });
    });
  });

  describe("delete", () => {
    it("should delete recipe when author matches", async () => {
      const authorId = createObjectId();
      const recipe = createRecipeDoc({ author: authorId });
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      const id = createObjectId().toString();
      await expect(
        service.delete(id, {
          initiator: initiator(authorId.toString()),
        }),
      ).resolves.toBeUndefined();
      expect(mockRecipeRepository.deleteDocument).toHaveBeenCalledWith(recipe);
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:deleted", {
        recipeId: id,
      });
    });

    it("should delete recipe when user is admin", async () => {
      const recipe = createRecipeDoc();
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      const id = createObjectId().toString();
      await expect(
        service.delete(id, {
          initiator: initiator(createObjectId().toString(), "admin"),
        }),
      ).resolves.toBeUndefined();
      expect(mockRecipeRepository.deleteDocument).toHaveBeenCalledWith(recipe);
      expect(mockCache.delete).toHaveBeenCalledWith(recipeCache.keys.byId(id));
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        recipeCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("recipe:deleted", {
        recipeId: id,
      });
    });

    it("should throw BadRequestError for invalid ID", async () => {
      await expect(
        service.delete("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when recipe not found", async () => {
      mockRecipeRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const recipe = createRecipeDoc();
      mockRecipeRepository.findDocumentById.mockResolvedValue(recipe);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(createObjectId().toString(), "user"),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
