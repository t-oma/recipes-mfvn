import { z } from "zod";

export { type CreateCommentBody, createCommentSchema } from "@recipes/shared";

export const commentParamsSchema = z.object({
  commentId: z.string().length(24),
});

export const recipeCommentsParamsSchema = z.object({
  recipeId: z.string().length(24),
});

export const commentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CommentParams = z.infer<typeof commentParamsSchema>;
export type RecipeCommentsParams = z.infer<typeof recipeCommentsParamsSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
