import type {
  CategoryDetails,
  CategoryQuery,
  Paginated,
} from "@recipes/shared";
import { apiClient } from "@/shared/api/client";

export function getCategories(filters: Partial<CategoryQuery> = {}) {
  return apiClient<Paginated<CategoryDetails>>("/api/categories", {
    method: "GET",
    query: filters,
  });
}
