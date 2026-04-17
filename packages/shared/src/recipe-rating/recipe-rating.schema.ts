import { z } from "zod";

export const recipeRatingBodySchema = z.object({
  value: z.number().int().min(1).max(5),
});
