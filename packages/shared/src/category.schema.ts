import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(200).optional(),
});

export const categorySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type CategorySummary = z.infer<typeof categorySummarySchema>;
