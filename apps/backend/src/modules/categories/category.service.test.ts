import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createCategoryDoc,
  createMockCache,
  createMockCategoryModel,
  createMockRecipeModel,
  createObjectId,
  initiator,
} from "@/__tests__/helpers.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import type { CategoryModelType } from "@/modules/categories/category.model.js";
import { createCategoryService } from "@/modules/categories/category.service.js";
import type { RecipeModelType } from "@/modules/recipes/index.js";

describe("categoryService", () => {
  const categoryModel = createMockCategoryModel();
  const recipeModel = createMockRecipeModel();
  const cache = createMockCache();
  const service = createCategoryService(
    categoryModel as unknown as CategoryModelType,
    recipeModel as unknown as RecipeModelType,
    cache,
  );

  beforeEach(async () => {
    vi.clearAllMocks();
    await cache.flush();
  });

  describe("findAll", () => {
    it("should return all categories sorted by name", async () => {
      const docs = [
        createCategoryDoc({ name: "Desserts", slug: "desserts" }),
        createCategoryDoc({ name: "Soups", slug: "soups" }),
      ];
      categoryModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(docs),
        }),
      });

      const result = await service.findAll();

      expect(categoryModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe("Desserts");
    });

    it("should return empty array when no categories exist", async () => {
      categoryModel.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create and return a category", async () => {
      const doc = createCategoryDoc({
        name: "New Category",
        slug: "new-category",
      });
      categoryModel.create.mockResolvedValue({ toObject: () => doc });

      const result = await service.create({
        data: { name: "New Category" },
        initiator: initiator(),
      });

      expect(categoryModel.create).toHaveBeenCalledWith({
        name: "New Category",
      });
      expect(result.name).toBe("New Category");
      expect(result.slug).toBe("new-category");
    });
  });

  describe("deleteById", () => {
    it("should delete category when no recipes exist", async () => {
      recipeModel.countDocuments.mockResolvedValue(0);
      categoryModel.findByIdAndDelete.mockResolvedValue(createCategoryDoc());

      const id = createObjectId().toString();
      await service.deleteById(id, { initiator: initiator() });

      expect(recipeModel.countDocuments).toHaveBeenCalledWith({ category: id });
      expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it("should throw ConflictError when recipes exist", async () => {
      recipeModel.countDocuments.mockResolvedValue(3);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError when category not found", async () => {
      recipeModel.countDocuments.mockResolvedValue(0);
      categoryModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(
        service.deleteById(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
