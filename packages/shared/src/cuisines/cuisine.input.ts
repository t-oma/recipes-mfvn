import { z } from "zod";
import { imageSchema } from "../common/image.js";

export const createCuisineInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  image: imageSchema,
});

export type CreateCuisineInput = z.infer<typeof createCuisineInputSchema>;
