import { z } from "zod";
import {
  createSortSchema,
  paginationQuerySchema,
  searchQuerySchema,
} from "../query/index.js";
import {
  difficultySchema,
  mealTypeSchema,
  minutesSchema,
} from "./recipe.primitives.schema.js";

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

export type RecipeQuery = z.infer<typeof recipeQuerySchema>;
