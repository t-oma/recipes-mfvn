import type { CommentQuery, FavoriteQuery } from "@recipes/shared";
import { queryOptions } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getUserComments, getUserFavorites } from "./user.api";

const userKeys = {
  all: ["users"] as const,

  details: (user: string) => [...userKeys.all, user] as const,
  comments: (user: string, filters: Partial<CommentQuery>) =>
    [...userKeys.details(user), "comments", filters] as const,
  favorites: (user: string, filters: Partial<FavoriteQuery>) =>
    [...userKeys.details(user), "favorites", filters] as const,
};

export function userFavoriteRecipeListOptions(
  user: string = "me",
  filters: MaybeRef<Partial<FavoriteQuery>>,
) {
  return queryOptions({
    queryKey: userKeys.favorites(user, toValue(filters)),
    queryFn: () => getUserFavorites(user, toValue(filters)),
  });
}

export function userCommentListOptions(
  user: string = "me",
  filters: MaybeRef<Partial<CommentQuery>>,
) {
  return queryOptions({
    queryKey: userKeys.comments(user, toValue(filters)),
    queryFn: () => getUserComments(user, toValue(filters)),
  });
}
