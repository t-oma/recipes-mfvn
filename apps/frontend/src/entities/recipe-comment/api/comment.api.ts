import type {
  CommentDetails,
  CommentQuery,
  CreateCommentInput,
  Paginated,
} from "@recipes/shared";
import { apiClient } from "@/shared/api/client";

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
  { page = 1, limit = 20 }: Partial<CommentQuery>,
): Promise<Paginated<CommentDetails>> {
  return apiClient<Paginated<CommentDetails>>(`/api/recipes/${id}/comments`, {
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
  body: CreateCommentInput,
): Promise<CommentDetails> {
  return apiClient<CommentDetails>(`/api/recipes/${id}/comments`, {
    method: "POST",
    body,
  });
}

/**
 * Delete a comment with the given id.
 *
 * @param id - comment id.
 */
export function deleteRecipeComment(commentId: string): Promise<void> {
  return apiClient<void>(`/api/recipes/comments/${commentId}`, {
    method: "DELETE",
  });
}
