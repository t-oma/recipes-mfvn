import { z } from "zod";
import { imageSchema } from "../common/image.schema.js";

export const createCategoryInputSchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(200).optional(),
  image: imageSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
