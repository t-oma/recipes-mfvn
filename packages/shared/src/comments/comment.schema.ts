import { z } from "zod";
import { paginationQuerySchema } from "../query.js";
import { recipeSummarySchema } from "../recipes/recipe.response.schema.js";
import { userSummarySchema } from "../users/user.response.schema.js";
import { createCommentInputSchema } from "./comment.input.schema.js";

export const commentSchema = createCommentInputSchema.extend({
  id: z.string(),
  recipe: recipeSummarySchema,
  author: userSummarySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const commentQuerySchema = paginationQuerySchema;

export type Comment = z.infer<typeof commentSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
