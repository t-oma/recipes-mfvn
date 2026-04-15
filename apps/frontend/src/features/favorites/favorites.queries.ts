import type { PaginationQuery, Recipe } from "@recipes/shared";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { recipeKeys } from "@/features/recipes/recipes.queries";
import { addFavorite, getUserFavorites, removeFavorite } from "./favorites.api";

const favoritesKeys = {
  all: ["favorites"] as const,
  byUser: (user: string, query: PaginationQuery) =>
    [...favoritesKeys.all, user, query] as const,
};

export type ToggleFavoriteParams = {
  id: string;
  favorited: boolean;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      favorited,
    }: ToggleFavoriteParams): Promise<{ favorited: boolean }> =>
      favorited ? removeFavorite(id) : addFavorite(id),

    onSuccess: (_, { id, favorited }) => {
      queryClient.setQueryData<Recipe>(recipeKeys.detail(id), (old) =>
        old ? { ...old, isFavorited: !favorited } : old,
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

/**
 * @todo Implement retriving favorites for the user other than the current one.
 *
 * Get recipes favorited by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of favorites.
 */
export function useUserFavorites(
  user: string = "me",
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const query = { page: toValue(page), limit };

  return {
    queryKey: favoritesKeys.byUser(user, query),
    queryFn: () => getUserFavorites(user, query),
  };
}
