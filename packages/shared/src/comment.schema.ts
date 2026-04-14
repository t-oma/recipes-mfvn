import { z } from "zod";
import { recipeSummarySchema } from "./recipe.schema.js";
import { userSummarySchema } from "./user.schema.js";

export const createCommentSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export const commentSchema = z.object({
  id: z.string(),
  text: z.string(),
  recipe: recipeSummarySchema,
  author: userSummarySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const commentForRecipeSchema = commentSchema.omit({ recipe: true });
