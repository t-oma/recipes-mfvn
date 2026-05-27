import type {
  CreateRecipeInput,
  Paginated,
  RecipeDetails,
  RecipeListItem,
  RecipeQuery,
  UpdateRecipeInput,
} from "@recipes/shared";
import { http } from "@/shared/api/http";

/**
 * Retrieve recipes with the given filters.
 *
 * @param filters - filters for the query.
 * @returns Paginated list of recipes.
 */
export function getRecipes(filters: Partial<RecipeQuery> = {}) {
  return http.get<Paginated<RecipeListItem>>("/api/recipes", {
    query: filters,
  });
}

/**
 * Retrieve a recipe with the given id.
 *
 * @param id - recipe id.
 * @returns Recipe.
 */
export function getRecipeDetails(id: string) {
  return http.get<RecipeDetails>(`/api/recipes/${id}`);
}

/**
 * Create a new recipe.
 *
 * @param body - recipe data.
 * @returns Created recipe.
 */
export function createRecipe(body: CreateRecipeInput) {
  return http.post<RecipeDetails>("/api/recipes", {
    body,
  });
}

/**
 * Update a recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - recipe data.
 * @returns Updated recipe.
 */
export function updateRecipe(id: string, body: UpdateRecipeInput) {
  return http.patch<RecipeDetails>(`/api/recipes/${id}`, {
    body,
  });
}

/**
 * Delete a recipe with the given id.
 *
 * @param id - recipe id.
 */
export function deleteRecipe(id: string) {
  return http.delete(`/api/recipes/${id}`);
}
