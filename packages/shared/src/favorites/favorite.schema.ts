import type { z } from "zod";
import { paginationQuerySchema } from "../query.js";

export const favoriteQuerySchema = paginationQuerySchema;

export type FavoriteQuery = z.infer<typeof favoriteQuerySchema>;
