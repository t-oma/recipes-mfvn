import type { SearchCategoryQuery } from "@recipes/shared";
import { hashFilters } from "@/common/utils/cache.js";

export const categoryCache = {
  keys: {
    all: () => "categories:all",
    list: (filters: SearchCategoryQuery) =>
      `categories:list:${hashFilters({
        sort: filters.sort,
      })}`,
    allPattern: () => "categories:*",
  },
  ttl: {
    all: 3600,
    list: 3600,
  },
} as const;
