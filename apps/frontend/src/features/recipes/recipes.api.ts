import type {
  CommentForRecipe,
  CreateCommentBody,
  CreateRecipeBody,
  Difficulty,
  Paginated,
  PaginationQuery,
  Recipe,
  UpdateRecipeBody,
} from "@recipes/shared";
import { apiClient } from "@/common/api/client";

export interface RecipeFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  difficulty?: Difficulty;
  isFavorited?: boolean;
  sort?: string;
}

/**
 * Retrieve recipes with the given filters.
 *
 * @param filters - filters for the query.
 * @returns Paginated list of recipes.
 */
export function getRecipes(
  filters: RecipeFilters = {},
): Promise<Paginated<Recipe>> {
  return apiClient<Paginated<Recipe>>("/api/recipes", {
    query: {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      categoryId: filters.categoryId,
      difficulty: filters.difficulty,
      isFavorited: filters.isFavorited,
      sort: filters.sort,
    },
  });
}

/**
 * Retrieve a recipe with the given id.
 *
 * @param id - recipe id.
 * @returns Recipe.
 */
export function getRecipe(id: string): Promise<Recipe> {
  return apiClient<Recipe>(`/api/recipes/${id}`);
}

/**
 * Create a new recipe.
 *
 * @param body - recipe data.
 * @returns Created recipe.
 */
export function createRecipe(body: CreateRecipeBody): Promise<Recipe> {
  return apiClient<Recipe>("/api/recipes", {
    method: "POST",
    body,
  });
}

/**
 * Update a recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - recipe data.
 * @returns Updated recipe.
 */
export function updateRecipe(
  id: string,
  body: UpdateRecipeBody,
): Promise<Recipe> {
  return apiClient<Recipe>(`/api/recipes/${id}`, {
    method: "PATCH",
    body,
  });
}

/**
 * Delete a recipe with the given id.
 *
 * @param id - recipe id.
 */
export function deleteRecipe(id: string): Promise<void> {
  return apiClient<void>(`/api/recipes/${id}`, {
    method: "DELETE",
  });
}

/**
 * Add a recipe with the given id to the current user's favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: true\} if the recipe was added to the user's favorites.
 */
export function addFavorite(id: string): Promise<{ favorited: true }> {
  return apiClient<{ favorited: true }>(`/api/recipes/${id}/favorite`, {
    method: "POST",
  });
}

/**
 * Remove a recipe with the given id from the current user's favorites.
 *
 * @param id - recipe id.
 * @returns \{favorited: false\} if the recipe was removed from the user's favorites.
 */
export function removeFavorite(id: string): Promise<{ favorited: false }> {
  return apiClient<{ favorited: false }>(`/api/recipes/${id}/favorite`, {
    method: "DELETE",
  });
}

/**
 * Get comments for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function getRecipeComments(
  id: string,
  { page = 1, limit = 20 }: PaginationQuery,
): Promise<Paginated<CommentForRecipe>> {
  return apiClient<Paginated<CommentForRecipe>>(`/api/recipes/${id}/comments`, {
    query: { page, limit },
  });
}

/**
 * Create a new comment for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - comment data.
 * @returns Created comment.
 */
export function createRecipeComment(
  id: string,
  body: CreateCommentBody,
): Promise<CommentForRecipe> {
  return apiClient<CommentForRecipe>(`/api/recipes/${id}/comments`, {
    method: "POST",
    body,
  });
}

/**
 * Delete a comment with the given id.
 *
 * @param id - comment id.
 */
export function deleteComment(commentId: string): Promise<void> {
  return apiClient<void>(`/api/recipes/comments/${commentId}`, {
    method: "DELETE",
  });
}
