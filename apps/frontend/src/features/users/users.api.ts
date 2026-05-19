import type {
  Comment,
  Paginated,
  PaginationQuery,
  RecipeListItem,
} from "@recipes/shared";
import { apiClient } from "@/shared/api/client";

/**
 * Get recipes favorited by the current user.
 *
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of favorites.
 */
export function getCurrentUserFavorites({
  page = 1,
  limit = 20,
}: PaginationQuery): Promise<Paginated<RecipeListItem>> {
  return apiClient<Paginated<RecipeListItem>>("/api/users/me/favorites", {
    query: { page, limit },
  });
}

/**
 * Get comments written by the current user.
 *
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function getCurrentUserComments({
  page = 1,
  limit = 20,
}: PaginationQuery): Promise<Paginated<Comment>> {
  return apiClient<Paginated<Comment>>("/api/users/me/comments", {
    query: { page, limit },
  });
}
