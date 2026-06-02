import type { CreateCommentInput } from "@recipes/shared";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { createRecipeComment } from "@/entities/recipe-comment/api/comment.api";
import { recipeCommentKeys } from "@/entities/recipe-comment/api/comment.queries";

export function useCreateRecipeComment(recipeId: string) {
  const queryClient = useQueryClient();
  const queryKey = recipeCommentKeys.lists(recipeId);

  return useMutation({
    mutationFn: (body: CreateCommentInput) =>
      createRecipeComment(recipeId, body),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}
