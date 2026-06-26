import type { CuisineQuery } from "@recipes/shared/cuisines";
import { hashFilters } from "@/common/utils/cache.js";

export const cuisineCache = {
  keys: {
    list: (query: CuisineQuery) =>
      `list:${hashFilters({
        sort: query.sort,
        order: query.order,
        page: query.page,
        limit: query.limit,
      })}`,
    listPattern: () => "list:*",
  },
  ttl: {
    list: 300,
  },
};
