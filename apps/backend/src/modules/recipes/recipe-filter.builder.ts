import type { QueryFilter } from "mongoose";
import { Types } from "mongoose";
import type {
  RecipeDocument,
  SearchRecipeQuery,
} from "@/modules/recipes/index.js";

export function buildRecipeFilter(
  query: SearchRecipeQuery,
  userId: string | undefined,
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

  applyVisibilityFilter(filter, userId);

  return filter;
}

export function applyVisibilityFilter(
  filter: QueryFilter<RecipeDocument>,
  userId: string | undefined,
) {
  if (userId) {
    filter.$or = [
      { isPublic: true },
      { author: Types.ObjectId.createFromHexString(userId) },
    ];
  } else {
    filter.isPublic = true;
  }
}
