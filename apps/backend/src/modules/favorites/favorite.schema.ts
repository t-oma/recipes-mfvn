import { z } from "zod";

export const favoriteParamsSchema = z.object({
  id: z.string().length(24),
});

export const favoriteQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type FavoriteParams = z.infer<typeof favoriteParamsSchema>;
export type FavoriteQuery = z.infer<typeof favoriteQuerySchema>;
