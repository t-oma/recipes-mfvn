import { z } from "zod";
import { categorySummarySchema } from "../categories/category.response.js";
import { persistenceFieldsSchema } from "../common/persistence.js";
import { cuisineSummarySchema } from "../cuisines/cuisine.response.js";
import { userSummarySchema } from "../users/user.response.js";
import { createRecipeInputSchema } from "./recipe.input.js";
import { recipeStatsSchema } from "./recipe.stats.js";

export const recipeComputedSchema = z.object({
  isFavorited: z.boolean(),
  userRating: z.number().int().min(1).max(5).nullable(),
});

export const recipeSummarySchema = createRecipeInputSchema
  .pick({ title: true })
  .extend(persistenceFieldsSchema.pick({ id: true }).shape)
  .extend({ slug: z.string() });

export const recipeListItemSchema = createRecipeInputSchema
  .pick({
    title: true,
    image: true,
    cookingTime: true,
    servings: true,
    difficulty: true,
    mealType: true,
  })
  .extend(persistenceFieldsSchema.pick({ id: true }).shape)
  .extend(recipeComputedSchema.shape)
  .extend({ stats: recipeStatsSchema })
  .extend({ category: categorySummarySchema })
  .extend({ cuisine: cuisineSummarySchema.nullable() })
  .extend({ author: userSummarySchema })
  .extend({ slug: z.string() });

export const recipeDetailsSchema = createRecipeInputSchema
  .extend(persistenceFieldsSchema.shape)
  .extend(recipeComputedSchema.shape)
  .extend({ stats: recipeStatsSchema })
  .extend({ category: categorySummarySchema })
  .extend({ cuisine: cuisineSummarySchema.nullable() })
  .extend({ author: userSummarySchema })
  .extend({ slug: z.string() });

export type RecipeComputed = z.infer<typeof recipeComputedSchema>;
export type RecipeSummary = z.infer<typeof recipeSummarySchema>;
export type RecipeListItem = z.infer<typeof recipeListItemSchema>;
export type RecipeDetails = z.infer<typeof recipeDetailsSchema>;
