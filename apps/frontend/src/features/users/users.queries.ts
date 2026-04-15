import type { PaginationQuery } from "@recipes/shared";
import { useQuery } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getCurrentUserComments, getCurrentUserFavorites } from "./users.api";

const userKeys = {
  all: ["users"] as const,
  favorites: (query: PaginationQuery) =>
    [userKeys.all, "favorites", query] as const,
  comments: (query: PaginationQuery) =>
    [userKeys.all, "comments", query] as const,
};

/**
 * Get recipes favorited by the current user.
 *
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of favorites.
 */
export function useCurrentUserFavorites(
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const query = { page: toValue(page), limit };

  return useQuery({
    queryKey: userKeys.favorites(query),
    queryFn: () => getCurrentUserFavorites(query),
  });
}

/**
 * Get comments written by the current user.
 *
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function useCurrentUserComments(page: MaybeRef<number> = 1, limit = 20) {
  const query = { page: toValue(page), limit };

  return useQuery({
    queryKey: userKeys.comments(query),
    queryFn: () => getCurrentUserComments(query),
  });
}
