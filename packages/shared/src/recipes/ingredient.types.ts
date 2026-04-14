import type { z } from "zod";
import type { ingredientSchema } from "./ingredient.schema.js";

export type Ingredient = z.infer<typeof ingredientSchema>;
