import { z } from "zod";
import { categorySummarySchema } from "../categories/category.schema.js";
import { persistenceFieldsSchema } from "../common/persistence.schema.js";
import { userSummarySchema } from "../users/user.schema.js";
import { createRecipeInputSchema } from "./recipe.input.schema.js";
import { recipeStatsSchema } from "./recipe.schema.js";

export const recipeComputedSchema = z.object({
  isFavorited: z.boolean(),
  userRating: z.number().int().min(1).max(5).nullable(),
});

export const recipeSummarySchema = createRecipeInputSchema
  .extend(persistenceFieldsSchema.shape)
  .pick({
    id: true,
    title: true,
  });

export const recipeListItemSchema = createRecipeInputSchema
  .pick({
    title: true,
    image: true,
    cookingTime: true,
    servings: true,
    difficulty: true,
  })
  .extend(persistenceFieldsSchema.pick({ id: true }).shape)
  .extend(recipeComputedSchema.shape)
  .extend({ stats: recipeStatsSchema })
  .extend({ category: categorySummarySchema })
  .extend({ author: userSummarySchema });

export const recipeDetailsSchema = createRecipeInputSchema
  .extend(persistenceFieldsSchema.shape)
  .extend(recipeComputedSchema.shape)
  .extend({ stats: recipeStatsSchema })
  .extend({ category: categorySummarySchema })
  .extend({ author: userSummarySchema });

export type RecipeComputed = z.infer<typeof recipeComputedSchema>;
export type RecipeSummary = z.infer<typeof recipeSummarySchema>;
export type RecipeListItem = z.infer<typeof recipeListItemSchema>;
export type RecipeDetails = z.infer<typeof recipeDetailsSchema>;
