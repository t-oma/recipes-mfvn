import { z } from "zod";
import { createSortSchema, paginationQuerySchema } from "../query/index.js";

export const categoryQuerySchema = z
  .object({
    sort: createSortSchema(["name", "recipeCount"]).default("name"),
  })
  .extend(paginationQuerySchema.shape);

export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
