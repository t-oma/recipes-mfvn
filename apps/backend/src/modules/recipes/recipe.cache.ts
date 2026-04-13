import crypto from "node:crypto";
import type { SearchRecipeQuery } from "./recipe.schema.js";

function hashFilters(query: SearchRecipeQuery): string {
  const stable = {
    categoryId: query.categoryId,
    difficulty: query.difficulty,
    sort: query.sort,
  };
  return crypto
    .createHash("md5")
    .update(JSON.stringify(stable))
    .digest("hex")
    .slice(0, 8);
}

export const recipeCache = {
  keys: {
    byId: (id: string) => `recipes:id:${id}`,
    list: (filters: SearchRecipeQuery) =>
      `recipes:list:${filters.page}:${filters.limit}:${hashFilters(filters)}`,
    allPattern: () => "recipes:*",
  },
  ttl: {
    byId: 600,
    list: 120,
  },
} as const;
