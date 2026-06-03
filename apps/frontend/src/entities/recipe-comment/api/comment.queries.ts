import type { CommentQuery } from "@recipes/shared";
import { queryOptions } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { recipeQueryKeys } from "@/entities/recipe";
import { getRecipeComments } from "./comment.api";

export const queryKeys = {
  all: ["comments"] as const,

  lists: (id: string) =>
    [...recipeQueryKeys.detail(id), ...queryKeys.all] as const,
  list: (id: string, filters: Partial<CommentQuery>) =>
    [...queryKeys.lists(id), filters] as const,
};

export function recipeCommentListOptions(
  id: MaybeRef<string>,
  filters: MaybeRef<Partial<CommentQuery>>,
) {
  return queryOptions({
    queryKey: queryKeys.list(toValue(id), toValue(filters)),
    queryFn: () => getRecipeComments(toValue(id), toValue(filters)),
    enabled: () => !!toValue(id),
  });
}
