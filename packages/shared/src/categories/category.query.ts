import { z } from "zod";
import { paginationQuerySchema, sortOrderSchema } from "../query/index.js";

export const categoryQuerySchema = z
  .object({
    sort: z.enum(["name", "recipeCount"]).default("name"),
    order: sortOrderSchema.default("asc"),
  })
  .extend(paginationQuerySchema.shape);

export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
