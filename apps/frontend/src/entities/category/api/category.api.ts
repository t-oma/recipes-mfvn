import type {
  CategoryListItem,
  CategoryQuery,
} from "@recipes/shared/categories";
import type { Paginated } from "@recipes/shared/core";
import { http } from "@/shared";

export function getCategories(filters: Partial<CategoryQuery> = {}) {
  return http.get<Paginated<CategoryListItem>>("/api/categories", {
    query: filters,
  });
}
