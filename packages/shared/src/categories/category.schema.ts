import { z } from "zod";
import { persistenceFieldsSchema } from "../common/persistence.schema.js";
import { createSortSchema, paginationQuerySchema } from "../query.js";
import type { Prettify } from "../utils.js";
import { createCategoryInputSchema } from "./category.input.schema.js";

export const categorySchema = createCategoryInputSchema
  .extend(persistenceFieldsSchema.shape)
  .required({
    slug: true,
  });

export const categoryComputedSchema = z.object({
  recipeCount: z.number().int().nonnegative(),
});

export const categorySummarySchema = categorySchema.pick({
  id: true,
  name: true,
  slug: true,
  image: true,
});

export const categoryQuerySchema = z
  .object({
    sort: createSortSchema(["name", "recipeCount"]).default("name"),
  })
  .extend(paginationQuerySchema.shape);

export type Category = z.infer<typeof categorySchema>;
export type CategoryComputed = z.infer<typeof categoryComputedSchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;

export type CategoryWithComputed = Prettify<Category & CategoryComputed>;

export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
