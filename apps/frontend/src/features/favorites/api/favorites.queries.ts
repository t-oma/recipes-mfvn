import type { RecipeDetails } from "@recipes/shared";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { recipeKeys } from "@/entities/recipe/api/recipe.queries";
import { addFavorite, removeFavorite } from "./favorites.api";

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFavorite,

    onSuccess: (_, id) => {
      queryClient.setQueryData<RecipeDetails>(recipeKeys.details(id), (old) =>
        old ? { ...old, isFavorited: true } : old,
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavorite,

    onSuccess: (_, id) => {
      queryClient.setQueryData<RecipeDetails>(recipeKeys.details(id), (old) =>
        old ? { ...old, isFavorited: false } : old,
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
