import { z } from "zod";

export const createRecipeIngredientInputSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1),
});

export const recipeIngredientSchema = createRecipeIngredientInputSchema;

export type CreateRecipeIngredientInput = z.infer<
  typeof createRecipeIngredientInputSchema
>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
