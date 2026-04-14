import type { z } from "zod";
import type {
  categorySchema,
  categorySummarySchema,
  createCategorySchema,
} from "./category.schema.js";

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type Category = z.infer<typeof categorySchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;
