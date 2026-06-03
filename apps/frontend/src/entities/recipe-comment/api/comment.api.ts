import type {
  CommentDetails,
  CommentQuery,
  CreateCommentInput,
  Paginated,
} from "@recipes/shared";
import { http } from "@/shared";

/**
 * Get comments for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param query.page - page number.
 * @param query.limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function getRecipeComments(id: string, query: Partial<CommentQuery>) {
  return http.get<Paginated<CommentDetails>>(`/api/recipes/${id}/comments`, {
    query,
  });
}

/**
 * Create a new comment for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - comment data.
 * @returns Created comment.
 */
export function createRecipeComment(id: string, body: CreateCommentInput) {
  return http.post<CommentDetails>(`/api/recipes/${id}/comments`, {
    body,
  });
}

/**
 * Delete a comment with the given id.
 *
 * @param id - comment id.
 */
export function deleteRecipeComment(commentId: string) {
  return http.delete(`/api/recipes/comments/${commentId}`);
}
