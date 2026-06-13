import { z } from "zod";

export const searchQuerySchema = z.object({
  search: z.string().trim().optional(),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
