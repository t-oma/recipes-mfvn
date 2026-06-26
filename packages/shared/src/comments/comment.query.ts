import { z } from "zod";
import { paginationQuerySchema, sortOrderSchema } from "../query/index.js";

export const commentQuerySchema = z
  .object({
    sort: z.enum(["createdAt"]).default("createdAt"),
    order: sortOrderSchema.default("desc"),
  })
  .extend(paginationQuerySchema.shape);

export type CommentQuery = z.infer<typeof commentQuerySchema>;
