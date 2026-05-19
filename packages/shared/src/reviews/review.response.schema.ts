import { z } from "zod";
import { userSummarySchema } from "../users/user.schema.js";
import { createReviewInputSchema } from "./review.input.schema.js";

export const reviewPersistenceSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const reviewsStatsSchema = z.object({
  totalReviews: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  happyCooksCount: z.number().int().nonnegative(),
});

export const reviewDetailsSchema = createReviewInputSchema
  .extend(reviewPersistenceSchema.shape)
  .extend({
    author: userSummarySchema,
    isFeatured: z.boolean(),
  });

export type ReviewPersistence = z.infer<typeof reviewPersistenceSchema>;
export type ReviewsStats = z.infer<typeof reviewsStatsSchema>;
export type ReviewDetails = z.infer<typeof reviewDetailsSchema>;
