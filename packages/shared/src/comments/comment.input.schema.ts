import { z } from "zod";

export const createCommentInputSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
