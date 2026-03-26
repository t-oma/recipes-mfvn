import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
});

export const createRecipeSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(z.string().min(5)).min(1),
  category: z.string().length(24),
  cookingTime: z.number().int().min(1),
  servings: z.number().int().min(1),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export type CreateRecipeBody = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeBody = z.infer<typeof updateRecipeSchema>;
