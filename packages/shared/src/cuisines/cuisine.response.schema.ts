import { z } from "zod";
import { imageSchema } from "../common/image.schema.js";
import { persistenceFieldsSchema } from "../common/persistence.schema.js";
import { createCuisineInputSchema } from "./cuisine.input.schema.js";

export const cuisineSummarySchema = createCuisineInputSchema
  .extend({ image: imageSchema.required({ alt: true }) })
  .pick({
    name: true,
    slug: true,
    image: true,
  })
  .extend(persistenceFieldsSchema.pick({ id: true }).shape)
  .required({ slug: true });

export const cuisineListItemSchema = cuisineSummarySchema.extend({
  recipeCount: z.number().int().nonnegative(),
});

export const cuisineDetailsSchema = createCuisineInputSchema
  .extend({ image: imageSchema.required({ alt: true }) })
  .extend(persistenceFieldsSchema.shape)
  .extend({
    recipeCount: z.number().int().nonnegative(),
  })
  .required({ slug: true });

export type CuisineSummary = z.infer<typeof cuisineSummarySchema>;
export type CuisineListItem = z.infer<typeof cuisineListItemSchema>;
export type CuisineDetails = z.infer<typeof cuisineDetailsSchema>;
