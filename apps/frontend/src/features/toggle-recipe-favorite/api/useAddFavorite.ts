import type { RecipeDetails } from "@recipes/shared";
import { useMutation } from "@tanstack/vue-query";
import { recipeKeys } from "@/entities/recipe/api/recipe.queries";
import { addFavorite } from "./favorites.api";

export function useAddFavorite() {
  return useMutation({
    mutationFn: addFavorite,

    onMutate: async (recipeId, context) => {
      const queryKey = recipeKeys.details(recipeId);

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
        recipeKeys.details(recipeId),
        onMutateResult?.previous,
      );
    },

    onSettled: (_data, _error, _recipeId, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: recipeKeys.all,
      });
    },
  });
}
