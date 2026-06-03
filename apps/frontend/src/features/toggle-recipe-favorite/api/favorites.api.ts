import { http } from "@/shared";

/**
 * Check if recipe with the given id is favorited by the current user.
 *
 * @param id - recipe id.
 * @returns \{favorited: boolean\} if the recipe is favorited.
 */
export function isFavorited(id: string) {
  return http.get<boolean>(`/api/recipes/${id}/favorite`);
}

/**
 * Add a recipe with the given id to the current user's favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: true\} if the recipe was added to the user's favorites.
 */
export function addFavorite(id: string) {
  return http.post<{ favorited: true }>(`/api/recipes/${id}/favorite`);
}

/**
 * Remove a recipe with the given id from the current user's favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: false\} if the recipe was removed from the user's favorites.
 */
export function removeFavorite(id: string) {
  return http.delete<{ favorited: false }>(`/api/recipes/${id}/favorite`);
}
