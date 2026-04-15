import type { PaginationQuery } from "@recipes/shared";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getUserFavorites } from "./favorites.api";

const favoritesKeys = {
  all: ["favorites"] as const,
  byUser: (user: string, query: PaginationQuery) =>
    [...favoritesKeys.all, user, query] as const,
};
/**
 * @todo Implement retriving favorites for the user other than the current one.
 *
 * Get recipes favorited by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of favorites.
 */
export function useUserFavorites(
  user: string = "me",
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const query = { page: toValue(page), limit };

  return {
    queryKey: favoritesKeys.byUser(user, query),
    queryFn: () => getUserFavorites(user, query),
  };
}
