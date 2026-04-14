import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().trim().min(1),
});
