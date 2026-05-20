import type {
  CategoryListItem,
  CategoryQuery,
  Paginated,
} from "@recipes/shared";
import { apiClient } from "@/shared/api/client";

export function getCategories(filters: Partial<CategoryQuery> = {}) {
  return apiClient<Paginated<CategoryListItem>>("/api/categories", {
    method: "GET",
    query: filters,
  });
}
