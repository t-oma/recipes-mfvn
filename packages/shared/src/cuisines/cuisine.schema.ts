import { z } from "zod";
import { createSortSchema, paginationQuerySchema } from "../query.js";

export const cuisineQuerySchema = z
  .object({
    sort: createSortSchema(["name", "recipeCount"]).default("name"),
  })
  .extend(paginationQuerySchema.shape);

export type CuisineQuery = z.infer<typeof cuisineQuerySchema>;
