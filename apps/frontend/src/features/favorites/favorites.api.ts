import type { Paginated, Recipe } from "@recipes/shared";
import { apiClient } from "@/common/api/client";

/**
 * @todo Implement retriving favorites for the user other than the current one.
 *
 * Get recipes favorited by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of favorites.
 */
export function getUserFavorites(
  _user: string,
  { page = 1, limit = 20 },
): Promise<Paginated<Recipe>> {
  return apiClient<Paginated<Recipe>>("/api/users/me/favorites", {
    query: { page, limit },
  });
}
