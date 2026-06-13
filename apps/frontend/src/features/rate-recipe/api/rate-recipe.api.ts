import type { RecipeRatingInput } from "@recipes/shared/recipe-rating";
import { http } from "@/shared";

export function rateRecipe(ref: string, body: RecipeRatingInput) {
  return http.put<void>(`/api/recipes/${ref}/rating`, { body });
}

export function removeRecipeRating(ref: string) {
  return http.delete<void>(`/api/recipes/${ref}/rating`);
}
