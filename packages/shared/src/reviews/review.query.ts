import { z } from "zod";
import { paginationQuerySchema, sortOrderSchema } from "../query/index.js";

export const reviewQuerySchema = z
  .object({
    sort: z.enum(["createdAt", "rating"]).default("createdAt"),
    order: sortOrderSchema.default("desc"),
    isFeatured: z.coerce.boolean().optional(),
  })
  .extend(paginationQuerySchema.shape);

export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
