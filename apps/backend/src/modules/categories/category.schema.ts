import { createSortSchema } from "@recipes/shared";
import { z } from "zod";
import { idParamSchema } from "@/common/schemas.js";

export { type CreateCategoryBody, createCategorySchema } from "@recipes/shared";

export const categoryParamsSchema = z.object({
  id: idParamSchema,
});

export const categorySortSchema = createSortSchema(["name", "recipeCount"]);

export type CategorySort = z.infer<typeof categorySortSchema>;

export const categoryQuerySchema = z.object({
  sort: categorySortSchema.default("name"),
});
export type SearchCategoryQuery = z.infer<typeof categoryQuerySchema>;
