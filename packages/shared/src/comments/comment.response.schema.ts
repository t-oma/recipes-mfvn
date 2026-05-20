import { z } from "zod";
import { recipeSummarySchema } from "../recipes/recipe.response.schema.js";
import { userSummarySchema } from "../users/user.response.schema.js";
import { createCommentInputSchema } from "./comment.input.schema.js";

export const commentDetailsSchema = createCommentInputSchema.extend({
  id: z.string(),
  recipe: recipeSummarySchema,
  author: userSummarySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CommentDetails = z.infer<typeof commentDetailsSchema>;
