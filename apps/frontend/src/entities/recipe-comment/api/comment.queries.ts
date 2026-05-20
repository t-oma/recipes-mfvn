import type { CommentQuery, CreateCommentInput } from "@recipes/shared";
import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { recipeKeys } from "@/entities/recipe/api/recipe.queries";
import {
  createRecipeComment,
  deleteRecipeComment,
  getRecipeComments,
} from "./comment.api";

export const recipeCommentKeys = {
  all: ["comments"] as const,

  lists: (id: string) =>
    [...recipeKeys.details(id), ...recipeCommentKeys.all] as const,
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

export function recipeCommentCreateOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: ({
      recipeId,
      body,
    }: {
      recipeId: string;
      body: CreateCommentInput;
    }) => createRecipeComment(recipeId, body),

    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({
        queryKey: recipeCommentKeys.lists(recipeId),
      });
    },
  });
}

export function recipeCommentDeleteOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: ({ commentId }: { recipeId: string; commentId: string }) =>
      deleteRecipeComment(commentId),

    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({
        queryKey: recipeCommentKeys.lists(recipeId),
      });
    },
  });
}
