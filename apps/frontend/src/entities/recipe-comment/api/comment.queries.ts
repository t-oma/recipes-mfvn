import type { CommentQuery } from "@recipes/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { recipeQueryKeys } from "@/entities/recipe";
import { deleteRecipeComment, getRecipeComments } from "./comment.api";

export const recipeCommentKeys = {
  all: ["comments"] as const,

  lists: (id: string) =>
    [...recipeQueryKeys.detail(id), ...recipeCommentKeys.all] as const,
  list: (id: string, filters: Partial<CommentQuery>) =>
    [...recipeCommentKeys.lists(id), filters] as const,
};

export function recipeCommentListOptions(
  id: MaybeRef<string>,
  filters: MaybeRef<Partial<CommentQuery>>,
) {
  return queryOptions({
    queryKey: recipeCommentKeys.list(toValue(id), toValue(filters)),
    queryFn: () => getRecipeComments(toValue(id), toValue(filters)),
    enabled: () => !!toValue(id),
  });
}

export function useDeleteRecipeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { recipeId: string; commentId: string }) =>
      deleteRecipeComment(commentId),

    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({
        queryKey: recipeCommentKeys.lists(recipeId),
      });
    },
  });
}
