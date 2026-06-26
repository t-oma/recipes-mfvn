import { z } from "zod";
import { paginationQuerySchema, sortOrderSchema } from "../query/index.js";

export const cuisineQuerySchema = z
  .object({
    sort: z.enum(["name", "recipeCount"]).default("name"),
    order: sortOrderSchema.default("asc"),
  })
  .extend(paginationQuerySchema.shape);

export type CuisineQuery = z.infer<typeof cuisineQuerySchema>;
