import type { CommentQuery } from "@recipes/shared";
import { queryOptions } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getUserComments } from "./user.api";

const userKeys = {
  all: ["users"] as const,

  details: (user: string) => [...userKeys.all, user] as const,
  comments: (user: string, filters: Partial<CommentQuery>) =>
    [...userKeys.details(user), "comments", filters] as const,
};

export function userCommentListOptions(
  user: string = "me",
  filters: MaybeRef<Partial<CommentQuery>>,
) {
  return queryOptions({
    queryKey: userKeys.comments(user, toValue(filters)),
    queryFn: () => getUserComments(user, toValue(filters)),
  });
}
