import type { QueryFilter } from "mongoose";
import type {
  RecipeDocument,
  SearchRecipeQuery,
} from "@/modules/recipes/index.js";

export function buildRecipeFilter(
  query: SearchRecipeQuery,
): QueryFilter<RecipeDocument> {
  const { categoryId, difficulty, search } = query;
  const filter: QueryFilter<RecipeDocument> = {};

  if (categoryId) {
    filter.category = categoryId;
  }
  if (difficulty) {
    filter.difficulty = difficulty;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
}

export function withVisibilityFilter(
  filter: QueryFilter<RecipeDocument>,
  userId?: string,
): QueryFilter<RecipeDocument> {
  if (!userId) {
    filter.isPublic = true;
  } else {
    filter.$or = [{ isPublic: true }, { author: userId }];
  }

  return filter;
}
