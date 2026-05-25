import { z } from "zod";
import { imageSchema } from "../common/image.schema.js";
import { recipeIngredientSchema } from "./ingredient.schema.js";
import {
  difficultySchema,
  mealTypeSchema,
  minutesSchema,
} from "./recipe.primitives.schema.js";

export const createRecipeInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(1000),
  ingredients: z.array(recipeIngredientSchema).min(1),
  instructions: z.array(z.string().trim().min(5)).min(1),
  category: z.string().length(24),
  difficulty: difficultySchema,
  cookingTime: minutesSchema,
  servings: z.number().int().min(1),
  isPublic: z.boolean().default(true),
  mealType: mealTypeSchema,
  image: imageSchema,
});

export const updateRecipeInputSchema = createRecipeInputSchema.partial();

export type CreateRecipeInput = z.infer<typeof createRecipeInputSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeInputSchema>;
