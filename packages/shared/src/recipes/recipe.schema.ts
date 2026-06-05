import { z } from "zod";
import {
  createSortSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "../query.js";
import {
  difficultySchema,
  mealTypeSchema,
  minutesSchema,
} from "./recipe.primitives.schema.js";

export const recipeStatsSchema = z.object({
  favoritesCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
  ratingCount: z.number().int().nonnegative(),
  ratingSum: z.number().int().nonnegative(),
  averageRating: z.number().nullable(),
  popularity: z.number().nonnegative(),
});

export const recipeQuerySchema = z
  .object({
    sort: createSortSchema(["createdAt", "cookingTime", "popularity"]).default(
      "-createdAt",
    ),
    category: z.string().trim().optional(),
    cuisine: z.string().trim().optional(),
    difficulty: difficultySchema.optional(),
    isFavorited: z.stringbool().optional(),
    mealType: mealTypeSchema.optional(),
    minCookingTime: z.coerce.number().pipe(minutesSchema).optional(),
    maxCookingTime: z.coerce.number().pipe(minutesSchema).optional(),
  })
  .extend(paginationQuerySchema.shape)
  .extend(searchQuerySchema.shape);

export type RecipeStats = z.infer<typeof recipeStatsSchema>;
export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
