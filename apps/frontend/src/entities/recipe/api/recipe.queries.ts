import type { RecipeQuery, UpdateRecipeInput } from "@recipes/shared";
import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import {
  createRecipe,
  deleteRecipe,
  getRecipeDetails,
  getRecipes,
  updateRecipe,
} from "./recipe.api";

export const recipeKeys = {
  all: ["recipes"] as const,

  lists: () => [...recipeKeys.all, "list"] as const,
  list: (query: Partial<RecipeQuery>) =>
    [...recipeKeys.lists(), query] as const,

  details: (id: string) => [...recipeKeys.all, id] as const,
} as const;

export function recipeListOptions(filters: MaybeRef<Partial<RecipeQuery>>) {
  return queryOptions({
    queryKey: recipeKeys.list(toValue(filters)),
    queryFn: () => getRecipes(toValue(filters)),
  });
}

export function recipeDetailsOptions(id: MaybeRef<string>) {
  return queryOptions({
    queryKey: recipeKeys.details(toValue(id)),
    queryFn: () => getRecipeDetails(toValue(id)),
    enabled: () => !!toValue(id),
  });
}

export function recipeCreateOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: createRecipe,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

/**
 * Update a recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - recipe data.
 * @returns Updated recipe.
 */
export function recipeUpdateOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: ({ id, body }: { id: string; body: UpdateRecipeInput }) =>
      updateRecipe(id, body),

    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.details(recipe.id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

/**
 * Delete a recipe with the given id.
 *
 * @param id - recipe id.
 */
export function recipeDeleteOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: deleteRecipe,

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: recipeKeys.details(id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
