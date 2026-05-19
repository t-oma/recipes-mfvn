import { z } from "zod";
import { persistenceFieldsSchema } from "../common/persistence.schema.js";
import { createCategoryInputSchema } from "./category.input.schema.js";

export const categoryComputedSchema = z.object({
  recipeCount: z.number().int().nonnegative(),
});

export const categorySummarySchema = createCategoryInputSchema
  .pick({
    name: true,
    slug: true,
    image: true,
  })
  .extend(persistenceFieldsSchema.pick({ id: true }).shape)
  .required({ slug: true });

export const categoryListItemSchema = createCategoryInputSchema
  .pick({
    name: true,
    image: true,
    slug: true,
  })
  .extend(persistenceFieldsSchema.pick({ id: true }).shape)
  .extend(categoryComputedSchema.shape)
  .required({ slug: true });

export const categoryDetailsSchema = createCategoryInputSchema
  .extend(persistenceFieldsSchema.shape)
  .extend(categoryComputedSchema.shape)
  .required({
    slug: true,
  });

export type CategoryComputed = z.infer<typeof categoryComputedSchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;
export type CategoryListItem = z.infer<typeof categoryListItemSchema>;
export type CategoryDetails = z.infer<typeof categoryDetailsSchema>;
