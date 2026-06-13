import type { CategoryQuery } from "@recipes/shared/categories";
import { queryOptions } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getCategories } from "./category.api";

export const queryKeys = {
  all: ["categories"] as const,

  lists: () => [...queryKeys.all, "list"] as const,
  list: (query: Partial<CategoryQuery>) =>
    [...queryKeys.lists(), query] as const,
};

export function categoryListOptions(
  filters: MaybeRef<Partial<CategoryQuery>> = {},
) {
  return queryOptions({
    queryKey: queryKeys.list(toValue(filters)),
    queryFn: () => getCategories(toValue(filters)),
    staleTime: 5 * 60 * 1000,
  });
}
