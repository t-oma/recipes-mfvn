import { useQuery } from "@tanstack/vue-query";
import { getCategories } from "./categories.api";

const categoryKeys = {
  all: ["categories"] as const,
};

/**
 * Get all categories.
 *
 * @returns Paginated list of categories.
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
