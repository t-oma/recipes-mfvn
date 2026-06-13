import { z } from "zod";

export const MIN_COMMENT_LENGTH = 3;
export const MAX_COMMENT_LENGTH = 500;
export const createCommentInputSchema = z.object({
  text: z
    .string()
    .trim()
    .min(MIN_COMMENT_LENGTH, {
      message: "Comment must be at least 3 characters",
    })
    .max(MAX_COMMENT_LENGTH, {
      message: `Comment must be under ${MAX_COMMENT_LENGTH} characters`,
    }),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
