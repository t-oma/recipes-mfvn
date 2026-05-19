import { z } from "zod";
import {
  createSortSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "../query.js";
import { difficultySchema } from "./recipe.primitives.schema.js";

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
    categoryId: z.string().optional(),
    difficulty: difficultySchema.optional(),
    isFavorited: z.stringbool().optional(),
  })
  .extend(paginationQuerySchema.shape)
  .extend(searchQuerySchema.shape);

export type RecipeStats = z.infer<typeof recipeStatsSchema>;
export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
