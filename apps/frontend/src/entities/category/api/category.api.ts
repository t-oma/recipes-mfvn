import type {
  CategoryListItem,
  CategoryQuery,
  Paginated,
} from "@recipes/shared";
import { http } from "@/shared";

export function getCategories(filters: Partial<CategoryQuery> = {}) {
  return http.get<Paginated<CategoryListItem>>("/api/categories", {
    query: filters,
  });
}
