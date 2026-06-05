import type { Paginated, RecipeDetails, RecipeListItem } from "@recipes/shared";
import { useMutation } from "@tanstack/vue-query";
import { recipeQueryKeys } from "@/entities/recipe";
import { favoriteRecipe, unfavoriteRecipe } from "./favorites.api";

export function useToggleRecipeFavorite(recipeId: string) {
  return useMutation({
    mutationFn: async (wasFavorited: boolean) => {
      if (wasFavorited) {
        return unfavoriteRecipe(recipeId);
      }

      return favoriteRecipe(recipeId);
    },

    onMutate: async (wasFavorited, context) => {
      await context.client.cancelQueries({ queryKey: recipeQueryKeys.lists() });
      await context.client.cancelQueries({
        queryKey: recipeQueryKeys.detail(recipeId),
      });

      const previousLists = context.client.getQueriesData<
        Paginated<RecipeListItem>
      >({
        queryKey: recipeQueryKeys.lists(),
      });
      const previous = context.client.getQueryData<RecipeDetails>(
        recipeQueryKeys.detail(recipeId),
      );

      context.client.setQueriesData<Paginated<RecipeListItem>>(
        { queryKey: recipeQueryKeys.lists() },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old?.items.map((recipe) =>
              recipe.id === recipeId
                ? {
                    ...recipe,
                    isFavorited: !wasFavorited,
                    stats: {
                      ...recipe.stats,
                      favoritesCount:
                        recipe.stats.favoritesCount + (wasFavorited ? -1 : 1),
                    },
                  }
                : recipe,
            ),
          };
        },
      );
      context.client.setQueryData<RecipeDetails>(
        recipeQueryKeys.detail(recipeId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            isFavorited: !wasFavorited,
            stats: {
              ...old.stats,
              favoritesCount:
                old.stats.favoritesCount + (wasFavorited ? -1 : 1),
            },
          };
        },
      );
      return { previousLists, previous };
    },

    onError: (_error, _wasFavorite, onMutateResult, context) => {
      for (const [queryKey, data] of onMutateResult?.previousLists ?? []) {
        context.client.setQueryData(queryKey, data);
      }

      context.client.setQueryData(
        recipeQueryKeys.detail(recipeId),
        onMutateResult?.previous,
      );
    },

    onSettled: (_data, _error, _wasFavorite, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: recipeQueryKeys.all,
      });
    },
  });
}
