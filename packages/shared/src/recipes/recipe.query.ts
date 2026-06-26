import { z } from "zod";
import {
  paginationQuerySchema,
  searchQuerySchema,
  sortOrderSchema,
} from "../query/index.js";
import {
  difficultySchema,
  mealTypeSchema,
  minutesSchema,
} from "./recipe.primitives.js";

export const recipeQuerySchema = z
  .object({
    sort: z
      .enum(["createdAt", "cookingTime", "popularity"])
      .default("createdAt"),
    order: sortOrderSchema.default("desc"),
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
