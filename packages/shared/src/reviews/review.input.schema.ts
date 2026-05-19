import { z } from "zod";

export const createReviewInputSchema = z.object({
  text: z.string().trim().min(2).max(500),
  rating: z.number().int().min(1).max(5),
});

export const updateReviewInputSchema = createReviewInputSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewInputSchema>;
