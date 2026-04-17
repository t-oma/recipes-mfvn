import type { z } from "zod";
import type { recipeRatingBodySchema } from "./recipe-rating.schema.js";

export type RecipeRatingBody = z.infer<typeof recipeRatingBodySchema>;
