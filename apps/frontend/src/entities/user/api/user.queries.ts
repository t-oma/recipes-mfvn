import type { CommentQuery, FavoriteQuery } from "@recipes/shared";
import { queryOptions } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getUserComments, getUserFavorites } from "./user.api";

export const queryKeys = {
  all: ["users"] as const,

  details: (user: string) => [...queryKeys.all, user] as const,
  comments: (user: string, filters: Partial<CommentQuery>) =>
    [...queryKeys.details(user), "comments", filters] as const,
  favorites: (user: string, filters: Partial<FavoriteQuery>) =>
    [...queryKeys.details(user), "favorites", filters] as const,
};

export function userFavoriteRecipeListOptions(
  user: string = "me",
  filters: MaybeRef<Partial<FavoriteQuery>>,
) {
  return queryOptions({
    queryKey: queryKeys.favorites(user, toValue(filters)),
    queryFn: () => getUserFavorites(user, toValue(filters)),
  });
}

export function userCommentListOptions(
  user: string = "me",
  filters: MaybeRef<Partial<CommentQuery>>,
) {
  return queryOptions({
    queryKey: queryKeys.comments(user, toValue(filters)),
    queryFn: () => getUserComments(user, toValue(filters)),
  });
}
