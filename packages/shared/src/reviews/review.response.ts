import { z } from "zod";
import { persistenceFieldsSchema } from "../common/persistence.js";
import { userSummarySchema } from "../users/user.response.js";
import { createReviewInputSchema } from "./review.input.js";

export const reviewsStatsSchema = z.object({
  totalReviews: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  happyCooksCount: z.number().int().nonnegative(),
});

export const reviewDetailsSchema = createReviewInputSchema
  .extend(persistenceFieldsSchema.shape)
  .extend({
    author: userSummarySchema,
    isFeatured: z.boolean(),
  });

export type ReviewsStats = z.infer<typeof reviewsStatsSchema>;
export type ReviewDetails = z.infer<typeof reviewDetailsSchema>;
