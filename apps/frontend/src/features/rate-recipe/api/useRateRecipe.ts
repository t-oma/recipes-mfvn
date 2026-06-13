import type { RecipeRatingInput } from "@recipes/shared/recipe-rating";
import type { RecipeDetails } from "@recipes/shared/recipes";
import { useMutation } from "@tanstack/vue-query";
import { recipeQueryKeys } from "@/entities/recipe";
import { recalculateRating } from "../lib/recalculateRating";
import { rateRecipe } from "./rate-recipe.api";

export function useRateRecipe(recipeId: string) {
  return useMutation({
    mutationFn: ({ value }: RecipeRatingInput) =>
      rateRecipe(recipeId, { value }),

    onMutate: async (newRating, context) => {
      const queryKey = recipeQueryKeys.detail(recipeId);

      await context.client.cancelQueries({ queryKey });

      const previousRecipe =
        context.client.getQueryData<RecipeDetails>(queryKey);

      context.client.setQueryData<RecipeDetails>(queryKey, (old) => {
        if (!old) return old;

        const { averageRating, ratingsCount } = recalculateRating(
          old,
          newRating.value,
        );

        return {
          ...old,
          stats: {
            ...old.stats,
            averageRating,
            ratingCount: ratingsCount,
          },
          userRating: newRating.value,
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
