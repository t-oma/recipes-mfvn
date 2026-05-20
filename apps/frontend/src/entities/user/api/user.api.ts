import type {
  CommentDetails,
  CommentQuery,
  FavoriteQuery,
  Paginated,
  RecipeListItem,
} from "@recipes/shared";
import { apiClient } from "@/shared/api/client";

/**
 * @todo Implement retriving favorite recipes for the user other than the current one.
 *
 * Get recipes favorited by the current user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of favorite recipes.
 */
export function getUserFavorites(
  _user: string,
  { page = 1, limit = 20 }: Partial<FavoriteQuery>,
) {
  return apiClient<Paginated<RecipeListItem>>("/api/users/me/favorites", {
    query: { page, limit },
  });
}

/**
 * @todo Implement retriving comments for the user other than the current one.
 *
 * Get comments written by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function getUserComments(
  _user: string,
  { page = 1, limit = 20 }: Partial<CommentQuery>,
): Promise<Paginated<CommentDetails>> {
  return apiClient<Paginated<CommentDetails>>("/api/users/me/comments", {
    query: { page, limit },
  });
}
