import { withPagination } from "@recipes/shared/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCuisineDoc,
  createObjectId,
  initiator,
  noInitiator,
} from "@/__tests__/helpers.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import { cuisineCache } from "./cuisine.cache.js";
import { createCuisineService } from "./cuisine.service.js";

describe("cuisineService", () => {
  const mockCuisineRepository = {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };
  const mockRecipeRepository = {
    count: vi.fn(),
  };
  const mockCache = {
    getOrSet: vi.fn(),
    deletePattern: vi.fn(),
  };
  const mockBus = {
    emit: vi.fn(),
  };
  const service = createCuisineService(
    mockCuisineRepository,
    mockRecipeRepository,
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

    it("should return paginated cuisines sorted by name with recipe count", async () => {
      const docs = [
        {
          ...createCuisineDoc({ name: "Italian", slug: "italian" }),
          recipeCount: 5,
        },
        {
          ...createCuisineDoc({ name: "Mexican", slug: "mexican" }),
          recipeCount: 0,
        },
      ];
      mockCuisineRepository.findMany.mockResolvedValue([docs, 2]);

      const query = {
        sort: "name" as const,
        order: "asc" as const,
        page: 1,
        limit: 10,
      };
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(mockCuisineRepository.findMany).toHaveBeenCalledWith(query);
      expect(result.value.items).toHaveLength(2);
      expect(result.value.items[0]?.name).toBe("Italian");
      expect(result.value.items[0]?.recipeCount).toBe(5);
      expect(result.value.items[1]?.recipeCount).toBe(0);
      expect(result.value.pagination.total).toBe(2);
      expect(result.cache.status).toBe("miss");
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        cuisineCache.keys.list(query),
        expect.any(Function),
        cuisineCache.ttl.list,
      );
    });

    it("should return empty paginated result when no cuisines exist", async () => {
      mockCuisineRepository.findMany.mockResolvedValue([[], 0]);

      const query = {
        sort: "name" as const,
        order: "asc" as const,
        page: 1,
        limit: 10,
      };
      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(result.value.items).toEqual([]);
      expect(result.value.pagination.total).toBe(0);
      expect(result.cache.status).toBe("miss");
    });

    it("should return cached result on second call", async () => {
      const docs = [
        {
          ...createCuisineDoc({ name: "Italian", slug: "italian" }),
          recipeCount: 3,
        },
      ];
      mockCuisineRepository.findMany.mockResolvedValue([docs, 1]);

      const query = {
        sort: "name" as const,
        order: "asc" as const,
        page: 1,
        limit: 10,
      };
      await service.findAll({
        query,
        initiator: noInitiator(),
      });
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        cuisineCache.keys.list(query),
        expect.any(Function),
        cuisineCache.ttl.list,
      );

      vi.clearAllMocks();
      mockCache.getOrSet.mockResolvedValue({
        value: withPagination(docs, 1, 1, 10),
        cache: {
          status: "hit",
          key: cuisineCache.keys.list(query),
          ttl: cuisineCache.ttl.list,
        },
      });

      const result = await service.findAll({
        query,
        initiator: noInitiator(),
      });

      expect(mockCuisineRepository.findMany).not.toHaveBeenCalled();
      expect(result.value.items).toHaveLength(1);
      expect(result.value.pagination.total).toBe(1);
      expect(result.cache.status).toBe("hit");
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        cuisineCache.keys.list(query),
        expect.any(Function),
        cuisineCache.ttl.list,
      );
    });
  });

  describe("create", () => {
    it("should create and return a cuisine", async () => {
      const doc = createCuisineDoc({
        name: "New Cuisine",
        slug: "new-cuisine",
      });
      mockCuisineRepository.create.mockResolvedValue(doc);

      const result = await service.create({
        data: {
          name: "New Cuisine",
          image: { url: "https://example.com/cuisine.jpg" },
        },
        initiator: initiator(),
      });

      expect(mockCuisineRepository.create).toHaveBeenCalledWith({
        name: "New Cuisine",
        image: { url: "https://example.com/cuisine.jpg" },
      });
      expect(result.name).toBe("New Cuisine");
      expect(result.slug).toBe("new-cuisine");
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        cuisineCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("cuisine:created", {
        cuisineId: doc._id.toHexString(),
      });
    });
  });

  describe("deleteById", () => {
    it("should delete cuisine when no recipes exist", async () => {
      mockRecipeRepository.count.mockResolvedValue(0);
      mockCuisineRepository.delete.mockResolvedValue(createCuisineDoc());

      const id = createObjectId().toString();
      await service.deleteById(id, { initiator: initiator() });

      expect(mockRecipeRepository.count).toHaveBeenCalledWith({
        cuisine: id,
      });
      expect(mockCuisineRepository.delete).toHaveBeenCalledWith(id);
      expect(mockCache.deletePattern).toHaveBeenCalledWith(
        cuisineCache.keys.listPattern(),
      );
      expect(mockBus.emit).toHaveBeenCalledWith("cuisine:deleted", {
        cuisineId: id,
      });
    });

    it("should throw ConflictError when recipes exist", async () => {
      mockRecipeRepository.count.mockResolvedValue(3);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError when cuisine not found", async () => {
      mockRecipeRepository.count.mockResolvedValue(0);
      mockCuisineRepository.delete.mockResolvedValue(null);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
