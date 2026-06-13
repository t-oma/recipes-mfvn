import type { RecipeQuery } from "@recipes/shared/recipes";
import { hashFilters } from "@/common/utils/cache.js";

export const recipeCache = {
  keys: {
    byId: (id: string) => `id:${id}`,
    list: (filters: RecipeQuery) =>
      `list:${filters.page}:${filters.limit}:${hashFilters({
        category: filters.category,
        difficulty: filters.difficulty,
        sort: filters.sort,
        minCookingTime: filters.minCookingTime,
        maxCookingTime: filters.maxCookingTime,
      })}`,
    listPattern: () => "list:*",
    allPattern: () => "*",
  },
  ttl: {
    byId: 600,
    list: 120,
  },
} as const;
