import type { PaginationQuery } from "@recipes/shared";
import { useQuery } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getUserComments } from "./comments.api";

const commentKeys = {
  all: ["comments"] as const,
  byAuthor: (author: string, query: PaginationQuery) =>
    [commentKeys.all, author, query] as const,
};

/**
 * @todo Implement retriving comments for the user other than the current one.
 *
 * Get comments written by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function useUserComments(
  user: string = "me",
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const query = { page: toValue(page), limit };
  user = "me";

  return useQuery({
    queryKey: commentKeys.byAuthor(user, query),
    queryFn: () => getUserComments(user, query),
  });
}
