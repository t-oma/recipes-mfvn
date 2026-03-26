import { z } from "zod";

export { type CreateCategoryBody, createCategorySchema } from "@recipes/shared";

export const categoryParamsSchema = z.object({
  id: z.string().length(24),
});
