import type { RecipeQuery } from "@recipes/shared";
import { queryOptions } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getRecipeDetails, getRecipes } from "./recipe.api";

export const queryKeys = {
  all: ["recipes"] as const,

  lists: () => [...queryKeys.all, "list"] as const,
  list: (query: Partial<RecipeQuery>) => [...queryKeys.lists(), query] as const,

  detail: (id: string) => [...queryKeys.all, id] as const,
} as const;

export function recipeListOptions(filters: MaybeRef<Partial<RecipeQuery>>) {
  return queryOptions({
    queryKey: queryKeys.list(toValue(filters)),
    queryFn: () => getRecipes(toValue(filters)),
  });
}

export function recipeDetailsOptions(id: MaybeRef<string>) {
  return queryOptions({
    queryKey: queryKeys.detail(toValue(id)),
    queryFn: () => getRecipeDetails(toValue(id)),
    enabled: () => !!toValue(id),
  });
}
