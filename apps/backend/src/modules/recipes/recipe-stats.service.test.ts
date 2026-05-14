import { beforeEach, describe, expect, it, vi } from "vitest";
import { createObjectId } from "@/__tests__/helpers.js";
import { RECIPE_POPULARITY_WEIGHTS } from "./recipe.repository.js";
import {
  computeAverageRating,
  computePopularity,
  createRecipeStatsService,
  rebuildRecipeStats,
} from "./recipe-stats.service.js";

describe("computeAverageRating", () => {
  it("should return null when ratingCount is 0", () => {
    const result = computeAverageRating({
      ratingCount: 0,
      ratingSum: 0,
    });

    expect(result).toBeNull();
  });

  it("should return null when ratingCount is negative", () => {
    const result = computeAverageRating({
      ratingCount: -1,
      ratingSum: 0,
    });

    expect(result).toBeNull();
  });

  it("should compute average for single rating", () => {
    const result = computeAverageRating({
      ratingCount: 1,
      ratingSum: 4,
    });

    expect(result).toBe(4);
  });

  it("should compute average for multiple ratings", () => {
    const result = computeAverageRating({
      ratingCount: 3,
      ratingSum: 13,
    });

    expect(result).toBe(4.3); // 13/3 = 4.333... rounded to 1 decimal
  });
});

describe("computePopularity", () => {
  it("should return 0 for empty stats", () => {
    const result = computePopularity({
      favoritesCount: 0,
      commentsCount: 0,
      ratingCount: 0,
      ratingSum: 0,
    });

    expect(result).toBe(0);
  });

  it("should compute popularity with all stats present", () => {
    // 5*favorites + 3*comments + 1*ratings + 4.5*avgRating
    // 5*3 + 3*2 + 10*1 + 4.5*5 = 15 + 6 + 10 + 22.5 = 53.5
    const result = computePopularity({
      favoritesCount: 5,
      commentsCount: 3,
      ratingCount: 10,
      ratingSum: 45,
    });

    expect(result).toBe(53.5);
  });

  it("should treat null averageRating as 0", () => {
    // 2*3 + 1*2 + 0*1 + 0*5 = 6 + 2 + 0 + 0 = 8
    const result = computePopularity({
      favoritesCount: 2,
      commentsCount: 1,
      ratingCount: 0,
      ratingSum: 0,
    });

    expect(result).toBe(8);
  });

  it("should use weights from RECIPE_POPULARITY_WEIGHTS", () => {
    const result = computePopularity({
      favoritesCount: 1,
      commentsCount: 1,
      ratingCount: 1,
      ratingSum: 5,
    });

    // avg = 5.0
    // 1*3 + 1*2 + 1*1 + 5.0*5 = 3 + 2 + 1 + 25 = 31
    const expected =
      RECIPE_POPULARITY_WEIGHTS.favorites +
      RECIPE_POPULARITY_WEIGHTS.comments +
      RECIPE_POPULARITY_WEIGHTS.ratings +
      5 * RECIPE_POPULARITY_WEIGHTS.averageRating;

    expect(result).toBe(expected);
    expect(result).toBe(31);
  });
});

describe("createRecipeStatsService", () => {
  const mockRecipeRepository = {
    applyFavoritesDelta: vi.fn(),
    applyCommentsDelta: vi.fn(),
    applyRatingCreated: vi.fn(),
    applyRatingUpdated: vi.fn(),
    applyRatingDeleted: vi.fn(),
  };

  const service = createRecipeStatsService(mockRecipeRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delegate onFavoriteCreated to applyFavoritesDelta with +1", async () => {
    mockRecipeRepository.applyFavoritesDelta.mockResolvedValue(null);

    await service.onFavoriteCreated("recipe123");

    expect(mockRecipeRepository.applyFavoritesDelta).toHaveBeenCalledWith(
      "recipe123",
      1,
    );
  });

  it("should delegate onFavoriteDeleted to applyFavoritesDelta with -1", async () => {
    mockRecipeRepository.applyFavoritesDelta.mockResolvedValue(null);

    await service.onFavoriteDeleted("recipe123");

    expect(mockRecipeRepository.applyFavoritesDelta).toHaveBeenCalledWith(
      "recipe123",
      -1,
    );
  });

  it("should delegate onCommentCreated to applyCommentsDelta with +1", async () => {
    mockRecipeRepository.applyCommentsDelta.mockResolvedValue(null);

    await service.onCommentCreated("recipe123");

    expect(mockRecipeRepository.applyCommentsDelta).toHaveBeenCalledWith(
      "recipe123",
      1,
    );
  });

  it("should delegate onCommentDeleted to applyCommentsDelta with -1", async () => {
    mockRecipeRepository.applyCommentsDelta.mockResolvedValue(null);

    await service.onCommentDeleted("recipe123");

    expect(mockRecipeRepository.applyCommentsDelta).toHaveBeenCalledWith(
      "recipe123",
      -1,
    );
  });

  it("should delegate onRatingCreated to applyRatingCreated", async () => {
    mockRecipeRepository.applyRatingCreated.mockResolvedValue(null);

    await service.onRatingCreated("recipe123", 4);

    expect(mockRecipeRepository.applyRatingCreated).toHaveBeenCalledWith(
      "recipe123",
      4,
    );
  });

  it("should delegate onRatingUpdated with previousValue", async () => {
    mockRecipeRepository.applyRatingUpdated.mockResolvedValue(null);

    await service.onRatingUpdated("recipe123", 3, 5);

    expect(mockRecipeRepository.applyRatingUpdated).toHaveBeenCalledWith(
      "recipe123",
      3,
      5,
    );
  });

  it("should delegate onRatingUpdated with null previousValue as 0", async () => {
    mockRecipeRepository.applyRatingUpdated.mockResolvedValue(null);

    await service.onRatingUpdated("recipe123", null, 5);

    expect(mockRecipeRepository.applyRatingUpdated).toHaveBeenCalledWith(
      "recipe123",
      0,
      5,
    );
  });

  it("should delegate onRatingDeleted to applyRatingDeleted", async () => {
    mockRecipeRepository.applyRatingDeleted.mockResolvedValue(null);

    await service.onRatingDeleted("recipe123", 4);

    expect(mockRecipeRepository.applyRatingDeleted).toHaveBeenCalledWith(
      "recipe123",
      4,
    );
  });
});

describe("rebuildRecipeStats", () => {
  it("should rebuild stats for all recipes from aggregated data", async () => {
    const recipeId1 = createObjectId().toHexString();
    const recipeId2 = createObjectId().toHexString();

    const mockRecipeModel = {
      find: vi.fn().mockReturnValue({
        lean: vi
          .fn()
          .mockResolvedValue([
            { _id: { toString: () => recipeId1 } },
            { _id: { toString: () => recipeId2 } },
          ]),
      }),
      bulkWrite: vi.fn().mockResolvedValue({ modifiedCount: 2 }),
    };

    const mockFavoriteModel = {
      aggregate: vi.fn().mockResolvedValue([
        { _id: { toString: () => recipeId1 }, count: 5 },
        { _id: { toString: () => recipeId2 }, count: 2 },
      ]),
    };

    const mockCommentModel = {
      aggregate: vi
        .fn()
        .mockResolvedValue([{ _id: { toString: () => recipeId1 }, count: 3 }]),
    };

    const mockRecipeRatingModel = {
      aggregate: vi.fn().mockResolvedValue([
        {
          _id: { toString: () => recipeId1 },
          ratingCount: 10,
          ratingSum: 45,
          averageRating: 4.5,
        },
      ]),
    };

    await rebuildRecipeStats(
      mockRecipeModel,
      mockFavoriteModel,
      mockCommentModel,
      mockRecipeRatingModel,
    );

    expect(mockRecipeModel.find).toHaveBeenCalledWith({}, { _id: 1 });
    expect(mockFavoriteModel.aggregate).toHaveBeenCalled();
    expect(mockCommentModel.aggregate).toHaveBeenCalled();
    expect(mockRecipeRatingModel.aggregate).toHaveBeenCalled();

    expect(mockRecipeModel.bulkWrite).toHaveBeenCalledTimes(1);
    const ops = mockRecipeModel.bulkWrite.mock.calls[0]?.[0];

    expect(ops).toHaveLength(2);

    // Recipe 1: has favorites, comments, ratings
    const op1 = ops[0];
    expect(op1.updateOne.filter).toEqual({
      _id: expect.any(Object),
    });
    expect(op1.updateOne.update.$set.stats).toEqual({
      favoritesCount: 5,
      commentsCount: 3,
      ratingCount: 10,
      ratingSum: 45,
      averageRating: 4.5,
      popularity: 53.5, // 5*3 + 3*2 + 10*1 + 4.5*5
    });

    // Recipe 2: has only favorites, no comments or ratings
    const op2 = ops[1];
    expect(op2.updateOne.update.$set.stats).toEqual({
      favoritesCount: 2,
      commentsCount: 0,
      ratingCount: 0,
      ratingSum: 0,
      averageRating: null,
      popularity: 6, // 2*3 + 0*2 + 0*1 + 0*5
    });
  });

  it("should not call bulkWrite when no recipes exist", async () => {
    const mockRecipeModel = {
      find: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
      bulkWrite: vi.fn(),
    };

    const mockFavoriteModel = { aggregate: vi.fn().mockResolvedValue([]) };
    const mockCommentModel = { aggregate: vi.fn().mockResolvedValue([]) };
    const mockRecipeRatingModel = { aggregate: vi.fn().mockResolvedValue([]) };

    await rebuildRecipeStats(
      mockRecipeModel,
      mockFavoriteModel,
      mockCommentModel,
      mockRecipeRatingModel,
    );

    expect(mockRecipeModel.bulkWrite).not.toHaveBeenCalled();
  });
});
