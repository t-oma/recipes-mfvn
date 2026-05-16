import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createObjectId,
  createReviewDoc,
  initiator,
} from "@/__tests__/helpers.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import { createReviewService } from "@/modules/reviews/review.service.js";

describe("reviewService", () => {
  const mockReviewRepository = {
    findFeatured: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    findDocumentById: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    deleteDocument: vi.fn(),
    aggregateStats: vi.fn(),
  };
  const mockUserRepository = {
    exists: vi.fn(),
    modelName: "User",
  };
  const mockCache = {
    getOrSet: vi.fn(),
    deletePattern: vi.fn(),
  };

  const service = createReviewService(
    mockReviewRepository,
    mockUserRepository,
    mockCache,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("create", () => {
    it("should create a review when user has none", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockReviewRepository.findOne.mockResolvedValue(null);

      const authorId = createObjectId();
      const populatedReview = {
        ...createReviewDoc({ author: authorId, text: "Love it!", rating: 5 }),
        author: { _id: authorId, name: "Alice", email: "alice@test.com" },
      };
      mockReviewRepository.create.mockResolvedValue(populatedReview);

      const init = initiator(authorId.toString());
      const result = await service.create({
        data: { text: "Love it!", rating: 5 },
        initiator: init,
      });

      expect(mockReviewRepository.create).toHaveBeenCalledWith({
        author: init.id,
        text: "Love it!",
        rating: 5,
      });
      expect(result.text).toBe("Love it!");
      expect(result.rating).toBe(5);
      expect(mockCache.deletePattern).toHaveBeenCalledWith("*");
    });

    it("should throw ConflictError when user already has a review", async () => {
      mockUserRepository.exists.mockResolvedValue(true);
      mockReviewRepository.findOne.mockResolvedValue(createReviewDoc());

      await expect(
        service.create({
          data: { text: "Another one", rating: 4 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw BadRequestError for invalid user ID", async () => {
      await expect(
        service.create({
          data: { text: "Hi", rating: 3 },
          initiator: { id: "invalid-id", role: "user" },
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when user does not exist", async () => {
      mockUserRepository.exists.mockResolvedValue(false);

      await expect(
        service.create({
          data: { text: "Hi", rating: 3 },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findFeatured", () => {
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

    it("should return featured reviews", async () => {
      const authorId = createObjectId();
      const reviews = [
        {
          ...createReviewDoc({ author: authorId }),
          author: { _id: authorId, name: "Bob", email: "bob@test.com" },
        },
      ];
      mockReviewRepository.findFeatured.mockResolvedValue(reviews);

      const result = await service.findFeatured();

      expect(mockReviewRepository.findFeatured).toHaveBeenCalledWith(6);
      expect(result.value).toHaveLength(1);
      expect(result.value[0]?.author.name).toBe("Bob");
      expect(result.cache.status).toBe("miss");
    });

    it("should return empty array when no featured reviews", async () => {
      mockReviewRepository.findFeatured.mockResolvedValue([]);

      const result = await service.findFeatured();

      expect(result.value).toEqual([]);
      expect(result.cache.status).toBe("miss");
    });

    it("should return cached result on second call", async () => {
      const authorId = createObjectId();
      const reviews = [
        {
          ...createReviewDoc({ author: authorId }),
          author: { _id: authorId, name: "Bob", email: "bob@test.com" },
        },
      ];
      mockReviewRepository.findFeatured.mockResolvedValue(reviews);

      await service.findFeatured();
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        "featured",
        expect.any(Function),
        3600,
      );

      vi.clearAllMocks();
      mockCache.getOrSet.mockResolvedValue({
        value: reviews,
        cache: {
          status: "hit" as const,
          key: "featured",
          ttl: 3600,
        },
      });

      const result = await service.findFeatured();

      expect(mockReviewRepository.findFeatured).not.toHaveBeenCalled();
      expect(result.value).toHaveLength(1);
      expect(result.cache.status).toBe("hit");
    });
  });

  describe("findAll", () => {
    it("should return paginated reviews", async () => {
      const authorId = createObjectId();
      const review = {
        ...createReviewDoc({ author: authorId }),
        author: { _id: authorId, name: "Carol", email: "carol@test.com" },
      };
      mockReviewRepository.findAll.mockResolvedValue([[review], 1]);

      const result = await service.findAll({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: initiator(),
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("update", () => {
    it("should update own review", async () => {
      const authorId = createObjectId();
      const review = createReviewDoc({ author: authorId });
      mockReviewRepository.findDocumentById.mockResolvedValue(review);

      const updated = {
        ...review,
        text: "Updated text",
        author: { _id: authorId, name: "Dave", email: "dave@test.com" },
      };
      mockReviewRepository.save.mockResolvedValue(updated);

      const result = await service.update(review._id.toString(), {
        data: { text: "Updated text" },
        initiator: initiator(authorId.toString()),
      });

      expect(mockReviewRepository.save).toHaveBeenCalledWith(review, {
        text: "Updated text",
      });
      expect(result.text).toBe("Updated text");
      expect(mockCache.deletePattern).toHaveBeenCalledWith("*");
    });

    it("should allow admin to update any review", async () => {
      const review = createReviewDoc();
      mockReviewRepository.findDocumentById.mockResolvedValue(review);

      const updated = {
        ...review,
        text: "Admin update",
        author: { _id: review.author, name: "Eve", email: "eve@test.com" },
      };
      mockReviewRepository.save.mockResolvedValue(updated);

      const result = await service.update(review._id.toString(), {
        data: { text: "Admin update" },
        initiator: initiator(createObjectId().toString(), "admin"),
      });

      expect(result.text).toBe("Admin update");
      expect(mockCache.deletePattern).toHaveBeenCalledWith("*");
    });

    it("should throw BadRequestError for invalid review ID", async () => {
      await expect(
        service.update("invalid-id", {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when review not found", async () => {
      mockReviewRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.update(createObjectId().toString(), {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const review = createReviewDoc();
      mockReviewRepository.findDocumentById.mockResolvedValue(review);

      await expect(
        service.update(review._id.toString(), {
          data: { text: "Hi" },
          initiator: initiator(),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("feature", () => {
    it("should feature a review when admin", async () => {
      const review = createReviewDoc();
      mockReviewRepository.findDocumentById.mockResolvedValue(review);

      const updated = {
        ...review,
        isFeatured: true,
        author: { _id: review.author, name: "Frank", email: "frank@test.com" },
      };
      mockReviewRepository.save.mockResolvedValue(updated);

      const result = await service.feature(
        review._id.toString(),
        { initiator: initiator(createObjectId().toString(), "admin") },
        true,
      );

      expect(mockReviewRepository.save).toHaveBeenCalledWith(review, {
        isFeatured: true,
      });
      expect(result.isFeatured).toBe(true);
      expect(mockCache.deletePattern).toHaveBeenCalledWith("*");
    });

    it("should throw ForbiddenError when not admin", async () => {
      await expect(
        service.feature(
          createObjectId().toString(),
          { initiator: initiator() },
          true,
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw NotFoundError when review not found", async () => {
      mockReviewRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.feature(
          createObjectId().toString(),
          { initiator: initiator(createObjectId().toString(), "admin") },
          true,
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete own review", async () => {
      const authorId = createObjectId();
      const review = createReviewDoc({ author: authorId });
      mockReviewRepository.findDocumentById.mockResolvedValue(review);

      await service.delete(review._id.toString(), {
        initiator: initiator(authorId.toString()),
      });

      expect(mockReviewRepository.deleteDocument).toHaveBeenCalledWith(review);
      expect(mockCache.deletePattern).toHaveBeenCalledWith("*");
    });

    it("should allow admin to delete any review", async () => {
      const review = createReviewDoc();
      mockReviewRepository.findDocumentById.mockResolvedValue(review);

      await service.delete(review._id.toString(), {
        initiator: initiator(createObjectId().toString(), "admin"),
      });

      expect(mockReviewRepository.deleteDocument).toHaveBeenCalledWith(review);
      expect(mockCache.deletePattern).toHaveBeenCalledWith("*");
    });

    it("should throw BadRequestError for invalid review ID", async () => {
      await expect(
        service.delete("invalid-id", { initiator: initiator() }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw NotFoundError when review not found", async () => {
      mockReviewRepository.findDocumentById.mockResolvedValue(null);

      await expect(
        service.delete(createObjectId().toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when not author and not admin", async () => {
      const review = createReviewDoc();
      mockReviewRepository.findDocumentById.mockResolvedValue(review);

      await expect(
        service.delete(review._id.toString(), {
          initiator: initiator(),
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("getStats", () => {
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

    it("should return review statistics", async () => {
      const stats = {
        totalReviews: 42,
        averageRating: 4.5,
        happyCooksCount: 38,
      };
      mockReviewRepository.aggregateStats.mockResolvedValue(stats);

      const result = await service.getStats();

      expect(result.value).toEqual(stats);
      expect(result.cache.status).toBe("miss");
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        "stats",
        expect.any(Function),
        300,
      );
    });

    it("should return cached stats on second call", async () => {
      const stats = {
        totalReviews: 10,
        averageRating: 4.0,
        happyCooksCount: 8,
      };
      mockReviewRepository.aggregateStats.mockResolvedValue(stats);

      await service.getStats();
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        "stats",
        expect.any(Function),
        300,
      );

      vi.clearAllMocks();
      mockCache.getOrSet.mockResolvedValue({
        value: stats,
        cache: {
          status: "hit" as const,
          key: "stats",
          ttl: 300,
        },
      });

      const result = await service.getStats();

      expect(mockReviewRepository.aggregateStats).not.toHaveBeenCalled();
      expect(result.value).toEqual(stats);
      expect(result.cache.status).toBe("hit");
    });
  });
});
