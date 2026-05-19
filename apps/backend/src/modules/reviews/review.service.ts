import type {
  CreateReviewInput,
  Paginated,
  ReviewDetails,
  ReviewQuery,
  ReviewsStats,
  UpdateReviewInput,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { EmptyObject } from "@/common/base.repository.js";
import type {
  CachedGetResult,
  CacheService,
} from "@/common/cache/cache.service.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/common/errors.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  InitiatedMethodParams,
  QueryMethodParams,
  UpdateMethodParams,
} from "@/common/types/methods.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { UserRepository } from "@/modules/users/user.repository.js";
import { reviewCache } from "./review.cache.js";
import { toReviewDetails } from "./review.mapper.js";
import type { ReviewRepository } from "./review.repository.js";

export interface ReviewService {
  create(params: CreateMethodParams<CreateReviewInput>): Promise<ReviewDetails>;
  findFeatured(): Promise<CachedGetResult<ReviewDetails[]>>;
  findAll(
    params: QueryMethodParams<ReviewQuery>,
  ): Promise<Paginated<ReviewDetails>>;
  update(
    id: string,
    params: UpdateMethodParams<UpdateReviewInput>,
  ): Promise<ReviewDetails>;
  feature(
    id: string,
    params: InitiatedMethodParams,
    isFeatured: boolean,
  ): Promise<ReviewDetails>;
  delete(id: string, params: DeleteMethodParams): Promise<void>;
  getStats(): Promise<CachedGetResult<ReviewsStats>>;
}

type ReviewRepositoryPort = Pick<
  ReviewRepository,
  | "findFeatured"
  | "findAll"
  | "findOne"
  | "findDocumentById"
  | "create"
  | "save"
  | "deleteDocument"
  | "aggregateStats"
>;
type UserRepositoryPort = Pick<UserRepository, "exists" | "modelName">;
type CacheServicePort = Pick<CacheService, "getOrSet" | "deletePattern">;

export function createReviewService(
  repository: ReviewRepositoryPort,
  userRepository: UserRepositoryPort,
  cache: CacheServicePort,
): ReviewService {
  return {
    create: async ({ data, initiator }) => {
      assertValidId(initiator.id, "Author");
      await assertExists(userRepository, initiator.id);

      const existing = await repository.findOne({
        author: initiator.id,
      });
      if (existing) {
        throw new ConflictError("You have already submitted a review");
      }

      const review = await repository.create({
        author: initiator.id,
        text: data.text,
        rating: data.rating,
      });

      await cache.deletePattern(reviewCache.keys.allPattern());

      return toReviewDetails(review);
    },

    findFeatured: async () => {
      return cache.getOrSet<ReviewDetails[]>(
        reviewCache.keys.featured(),
        async () => {
          const reviews = await repository.findFeatured(6);
          return reviews.map(toReviewDetails);
        },
        reviewCache.ttl.featured,
      );
    },

    findAll: async ({ query, initiator }) => {
      const [reviews, total] = await repository.findAll({
        query,
        initiator,
      });

      return withPagination(
        reviews.map(toReviewDetails),
        total,
        query.page,
        query.limit,
      );
    },

    update: async (id, { data, initiator }) => {
      assertValidId(id, "Review");

      const review = await repository.findDocumentById<EmptyObject>(id, {
        populate: false,
      });
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      if (!review.author.equals(initiator.id) && initiator.role !== "admin") {
        throw new ForbiddenError("Not authorized to update this review");
      }

      const updated = await repository.save(review, data);
      await cache.deletePattern(reviewCache.keys.allPattern());
      return toReviewDetails(updated);
    },

    feature: async (id, { initiator }, isFeatured) => {
      assertValidId(id, "Review");

      if (initiator.role !== "admin") {
        throw new ForbiddenError("Only admins can feature reviews");
      }

      const review = await repository.findDocumentById<EmptyObject>(id, {
        populate: false,
      });
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      const updated = await repository.save(review, { isFeatured });
      await cache.deletePattern(reviewCache.keys.allPattern());
      return toReviewDetails(updated);
    },

    delete: async (id, { initiator }) => {
      assertValidId(id, "Review");

      const review = await repository.findDocumentById<EmptyObject>(id, {
        populate: false,
      });
      if (!review) {
        throw new NotFoundError("Review not found");
      }

      if (!review.author.equals(initiator.id) && initiator.role !== "admin") {
        throw new ForbiddenError("Not authorized to delete this review");
      }

      await repository.deleteDocument(review);
      await cache.deletePattern(reviewCache.keys.allPattern());
    },

    getStats: async () => {
      return cache.getOrSet<ReviewsStats>(
        reviewCache.keys.stats(),
        async () => repository.aggregateStats(),
        reviewCache.ttl.stats,
      );
    },
  };
}
