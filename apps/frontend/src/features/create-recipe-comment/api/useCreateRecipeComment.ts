import type { CreateCommentInput } from "@recipes/shared/comments";
import { useMutation } from "@tanstack/vue-query";
import {
  createRecipeComment,
  recipeCommentQueryKeys,
} from "@/entities/recipe-comment";

export function useCreateRecipeComment(recipeId: string) {
  const queryKey = recipeCommentQueryKeys.lists(recipeId);

  return useMutation({
    mutationFn: (body: CreateCommentInput) =>
      createRecipeComment(recipeId, body),

    onSuccess: (_data, _body, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey,
      });
    },
  });
}
