import { z } from "zod";

export const recipeStatsSchema = z.object({
  favoritesCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
  ratingCount: z.number().int().nonnegative(),
  ratingSum: z.number().int().nonnegative(),
  averageRating: z.number().nullable(),
  popularity: z.number().nonnegative(),
});

export type RecipeStats = z.infer<typeof recipeStatsSchema>;
