import type {
  CommentForRecipe,
  Paginated,
  PaginationQuery,
} from "@recipes/shared";
import { apiClient } from "@/common/api/client";

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
  { page = 1, limit = 20 }: PaginationQuery,
): Promise<Paginated<CommentForRecipe>> {
  return apiClient<Paginated<CommentForRecipe>>("/api/users/me/comments", {
    query: { page, limit },
  });
}
