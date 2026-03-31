import { beforeEach, describe, expect, it, vi } from "vitest";
import { FavoriteService } from "../favorite.service.js";

vi.mock("../favorite.model.js", () => ({
  FavoriteModel: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock("@/modules/recipes/recipe.model.js", () => ({
  RecipeModel: {
    findById: vi.fn(),
  },
}));

const { FavoriteModel } = await import("../favorite.model.js");
const { RecipeModel } = await import("@/modules/recipes/recipe.model.js");

describe("FavoriteService", () => {
  let service: FavoriteService;

  beforeEach(() => {
    service = new FavoriteService();
    vi.clearAllMocks();
  });

  describe("toggle", () => {
    it("should add favorite when not exists", async () => {
      vi.mocked(RecipeModel.findById, { partial: true }).mockResolvedValue({
        _id: "recipe1",
      });
      vi.mocked(FavoriteModel.findOne);
      vi.mocked(FavoriteModel.create);

      const result = await service.toggle("user1", "recipe1");

      expect(result).toEqual({ favorited: true });
      expect(RecipeModel.findById).toHaveBeenCalledWith("recipe1");
      expect(FavoriteModel.findOne).toHaveBeenCalledWith({
        user: "user1",
        recipe: "recipe1",
      });
      expect(FavoriteModel.create).toHaveBeenCalledWith({
        user: "user1",
        recipe: "recipe1",
      });
    });

    it("should remove favorite when exists", async () => {
      const mockFavorite = {
        _id: "fav1",
        deleteOne: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(RecipeModel.findById, { partial: true }).mockResolvedValue({
        _id: "recipe1",
      });
      vi.mocked(FavoriteModel.findOne).mockResolvedValue(mockFavorite as never);

      const result = await service.toggle("user1", "recipe1");

      expect(result).toEqual({ favorited: false });
      expect(mockFavorite.deleteOne).toHaveBeenCalled();
      expect(FavoriteModel.create).not.toHaveBeenCalled();
    });

    it("should throw 404 when recipe not found", async () => {
      vi.mocked(RecipeModel.findById).mockResolvedValue(null);

      await expect(service.toggle("user1", "invalid")).rejects.toMatchObject({
        message: "Recipe not found",
        statusCode: 404,
      });
    });
  });

  describe("isFavorited", () => {
    it("should return true when favorite exists", async () => {
      vi.mocked(FavoriteModel.findOne, { partial: true }).mockResolvedValue({
        _id: "fav1",
      } as never);

      const result = await service.isFavorited("user1", "recipe1");

      expect(result).toBe(true);
      expect(FavoriteModel.findOne).toHaveBeenCalledWith({
        user: "user1",
        recipe: "recipe1",
      });
    });

    it("should return false when favorite not exists", async () => {
      vi.mocked(FavoriteModel.findOne).mockResolvedValue(null);

      const result = await service.isFavorited("user1", "recipe1");

      expect(result).toBe(false);
    });
  });

  describe("findByUser", () => {
    it("should return paginated favorites", async () => {
      const mockDate = new Date("2024-01-01");
      const mockRecipe = {
        _id: "recipe1",
        title: "Test Recipe",
        description: "A test recipe",
        ingredients: [{ name: "Flour", quantity: 1, unit: "cup" }],
        instructions: ["Mix ingredients"],
        category: { _id: "cat1", name: "Desserts", slug: "desserts" },
        author: { _id: "user1", name: "John", email: "john@test.com" },
        difficulty: "easy",
        cookingTime: 30,
        servings: 4,
        isPublic: true,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const mockFavorites = [
        {
          _id: "fav1",
          recipe: mockRecipe,
          createdAt: mockDate,
        },
      ];

      vi.mocked(FavoriteModel.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue(mockFavorites),
              }),
            }),
          }),
        }),
      } as never);

      vi.mocked(FavoriteModel.countDocuments).mockResolvedValue(1);

      const result = await service.findByUser("user1", { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      const item = result.items[0];
      expect(item).toBeDefined();
      expect(item?.id).toBe("recipe1");
      expect(item?.title).toBe("Test Recipe");
      expect(item?.isFavorited).toBe(true);
      expect(result.pagination.total).toBe(1);
    });

    it("should return empty array when no favorites", async () => {
      vi.mocked(FavoriteModel.find).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                lean: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as never);

      vi.mocked(FavoriteModel.countDocuments).mockResolvedValue(0);

      const result = await service.findByUser("user1", { page: 1, limit: 20 });

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
