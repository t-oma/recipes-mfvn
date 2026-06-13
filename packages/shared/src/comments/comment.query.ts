import type { z } from "zod";
import { paginationQuerySchema } from "../query/index.js";

export const commentQuerySchema = paginationQuerySchema;

export type CommentQuery = z.infer<typeof commentQuerySchema>;
