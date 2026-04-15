import type { CreateCommentBody, PaginationQuery } from "@recipes/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import { recipeKeys } from "@/features/recipes/recipes.queries";
import {
  createRecipeComment,
  deleteRecipeComment,
  getRecipeComments,
  getUserComments,
} from "./comments.api";

const commentKeys = {
  all: ["comments"] as const,
  byAuthor: (author: string, query: PaginationQuery) =>
    [...recipeKeys.all, ...commentKeys.all, author, query] as const,
  lists: (id: string) =>
    [...recipeKeys.detail(id), ...commentKeys.all] as const,
  list: (id: string, query: PaginationQuery) =>
    [...commentKeys.lists(id), query] as const,
};

/**
 * Get comments for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function useRecipeComments(
  id: MaybeRef<string>,
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const recipeId = toValue(id);
  const query = { page: toValue(page), limit };

  return useQuery({
    queryKey: commentKeys.list(recipeId, query),
    queryFn: () => getRecipeComments(recipeId, query),
    enabled: () => !!recipeId,
  });
}

/**
 * Create a new comment for the recipe with the given id.
 *
 * @param id - recipe id.
 * @param body - comment data.
 * @returns Created comment.
 */
export function useCreateRecipeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipeId,
      body,
    }: {
      recipeId: string;
      body: CreateCommentBody;
    }) => createRecipeComment(recipeId, body),

    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.lists(recipeId),
      });
    },
  });
}

/**
 * Delete a comment with the given id.
 *
 * @param id - comment id.
 */
export function useDeleteRecipeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipeComment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...recipeKeys.all, ...commentKeys.all],
      });
    },
  });
}

/**
 * @todo Implement retriving comments for the user other than the current one.
 *
 * Get comments written by the user.
 *
 * @param user - user id. NOTE: This paramater is ignored for now.
 * @param page - page number.
 * @param limit - number of items per page.
 * @returns Paginated list of comments.
 */
export function useUserComments(
  user: string = "me",
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const query = { page: toValue(page), limit };
  user = "me";

  return useQuery({
    queryKey: commentKeys.byAuthor(user, query),
    queryFn: () => getUserComments(user, query),
  });
}
