import { z } from "zod";
import { createSortSchema, paginationQuerySchema } from "../query/index.js";

export const reviewQuerySchema = z
  .object({
    sort: createSortSchema(["createdAt", "rating"]).default("-createdAt"),
    isFeatured: z.coerce.boolean().optional(),
  })
  .extend(paginationQuerySchema.shape);

export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
