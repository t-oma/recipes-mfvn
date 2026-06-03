import type { RecipeDetails } from "@recipes/shared";
import { useMutation } from "@tanstack/vue-query";
import { recipeQueryKeys } from "@/entities/recipe";
import { recalculateRating } from "../lib/recalculateRating";
import { removeRecipeRating } from "./rate-recipe.api";

export function useRemoveRecipeRating(recipeId: string) {
  return useMutation({
    mutationFn: () => removeRecipeRating(recipeId),

    onMutate: async (_newRating, context) => {
      const queryKey = recipeQueryKeys.detail(recipeId);

      await context.client.cancelQueries({ queryKey });

      const previousRecipe =
        context.client.getQueryData<RecipeDetails>(queryKey);

      context.client.setQueryData<RecipeDetails>(queryKey, (old) => {
        if (!old) return old;

        const { averageRating, ratingsCount } = recalculateRating(old, null);

        return {
          ...old,
          stats: {
            ...old.stats,
            averageRating,
            ratingCount: ratingsCount,
          },
          userRating: null,
        };
      });

      return { previousRecipe };
    },

    onError: (_error, _rating, onMutateResult, context) => {
      context.client.setQueryData(
        recipeQueryKeys.detail(recipeId),
        onMutateResult?.previousRecipe,
      );
    },

    onSettled: (_data, _error, _rating, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: recipeQueryKeys.detail(recipeId),
      });
    },
  });
}
