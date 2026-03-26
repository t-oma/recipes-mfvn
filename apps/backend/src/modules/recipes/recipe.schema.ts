import { z } from "zod";

export {
  type CreateRecipeBody,
  createRecipeSchema,
  type UpdateRecipeBody,
  updateRecipeSchema,
} from "@recipes/shared";

export const recipeParamsSchema = z.object({
  id: z.string().length(24),
});

export const recipeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().default("-createdAt"),
  category: z.string().length(24).optional(),
  search: z.string().optional(),
});

export type SearchRecipeQuery = z.infer<typeof recipeQuerySchema>;
