import type { CategoryQuery } from "@recipes/shared";
import { queryOptions } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { getCategories } from "./category.api";

const categoryKeys = {
  all: ["categories"] as const,

  lists: () => [...categoryKeys.all, "list"] as const,
  list: (query: Partial<CategoryQuery>) =>
    [...categoryKeys.lists(), query] as const,
};

export function categoryListOptions(
  filters: MaybeRef<Partial<CategoryQuery>> = {},
) {
  return queryOptions({
    queryKey: categoryKeys.list(toValue(filters)),
    queryFn: () => getCategories(toValue(filters)),
    staleTime: 5 * 60 * 1000,
  });
}
