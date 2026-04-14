import type { z } from "zod";
import type {
  createRecipeSchema,
  difficultySchema,
  minutesSchema,
  recipeSchema,
  recipeSummarySchema,
  secondsSchema,
  updateRecipeSchema,
} from "./recipe.schema.js";

export type Minutes = z.infer<typeof minutesSchema>;
export type Seconds = z.infer<typeof secondsSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;

export type CreateRecipeBody = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeBody = z.infer<typeof updateRecipeSchema>;
export type RecipeSummary = z.infer<typeof recipeSummarySchema>;
export type Recipe = z.infer<typeof recipeSchema>;
