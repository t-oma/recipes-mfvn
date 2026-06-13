import { z } from "zod";

export const recipeRatingInputSchema = z.object({
  value: z.number().int().min(1).max(5),
});

export type RecipeRatingInput = z.infer<typeof recipeRatingInputSchema>;
