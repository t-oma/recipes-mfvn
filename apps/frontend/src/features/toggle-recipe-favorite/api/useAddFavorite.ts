import type { RecipeDetails } from "@recipes/shared";
import { useMutation } from "@tanstack/vue-query";
import { recipeQueryKeys } from "@/entities/recipe";
import { addFavorite } from "./favorites.api";

export function useAddFavorite() {
  return useMutation({
    mutationFn: addFavorite,

    onMutate: async (recipeId, context) => {
      const queryKey = recipeQueryKeys.detail(recipeId);

      await context.client.cancelQueries({ queryKey });

      const previous = context.client.getQueryData<RecipeDetails>(queryKey);

      context.client.setQueryData<RecipeDetails>(queryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          isFavorited: true,
          stats: {
            ...old.stats,
            favoritesCount: old.stats.favoritesCount + 1,
          },
        };
      });

      return { previous };
    },

    onError: (_error, recipeId, onMutateResult, context) => {
      context.client.setQueryData(
        recipeQueryKeys.detail(recipeId),
        onMutateResult?.previous,
      );
    },

    onSettled: (_data, _error, _recipeId, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: recipeQueryKeys.all,
      });
    },
  });
}
