import type {
  CreateCommentBody,
  CreateRecipeBody,
  PaginationQuery,
  Recipe,
  UpdateRecipeBody,
} from "@recipes/shared";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import type { MaybeRef } from "vue";
import { toValue } from "vue";
import type { RecipeFilters } from "./recipes.api";
import {
  addFavorite,
  createRecipe,
  createRecipeComment,
  deleteComment,
  deleteRecipe,
  getRecipe,
  getRecipeComments,
  getRecipes,
  removeFavorite,
  updateRecipe,
} from "./recipes.api";

const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (query: RecipeFilters) => [...recipeKeys.lists(), query] as const,
  detail: (id: string) => [...recipeKeys.all, id] as const,
  infinite: (query: RecipeFilters) =>
    [...recipeKeys.list(query), "infinite"] as const,

  comments: {
    all: ["comments"] as const,
    lists: (id: string) =>
      [...recipeKeys.detail(id), ...recipeKeys.comments.all] as const,
    list: (id: string, query: PaginationQuery) =>
      [...recipeKeys.comments.lists(id), query] as const,
  },
};

export function useRecipes(filters: MaybeRef<RecipeFilters>) {
  return useQuery({
    queryKey: recipeKeys.list(toValue(filters)),
    queryFn: () => getRecipes(toValue(filters)),
  });
}

export function useInfiniteRecipes(
  filters: MaybeRef<Omit<RecipeFilters, "page">>,
) {
  return useInfiniteQuery({
    queryKey: recipeKeys.infinite(toValue(filters)),
    queryFn: ({ pageParam }) =>
      getRecipes({ ...toValue(filters), page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
}

export function useRecipe(id: MaybeRef<string>) {
  return useQuery({
    queryKey: recipeKeys.detail(toValue(id)),
    queryFn: () => getRecipe(toValue(id)),
    enabled: () => !!toValue(id),
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRecipeBody) => createRecipe(body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRecipeBody }) =>
      updateRecipe(id, body),

    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipe.id), recipe);
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,

    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

export type ToggleFavoriteParams = {
  id: string;
  favorited: boolean;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      favorited,
    }: ToggleFavoriteParams): Promise<{ favorited: boolean }> =>
      favorited ? removeFavorite(id) : addFavorite(id),

    onSuccess: (_, { id, favorited }) => {
      queryClient.setQueryData<Recipe>(recipeKeys.detail(id), (old) =>
        old ? { ...old, isFavorited: !favorited } : old,
      );
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

export function useRecipeComments(
  id: MaybeRef<string>,
  page: MaybeRef<number> = 1,
  limit = 20,
) {
  const recipeId = toValue(id);
  const query = { page: toValue(page), limit };

  return useQuery({
    queryKey: recipeKeys.comments.list(recipeId, query),
    queryFn: () => getRecipeComments(recipeId, query),
    enabled: () => !!recipeId,
  });
}

export function useCreateComment() {
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
        queryKey: recipeKeys.comments.lists(recipeId),
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.comments.all });
    },
  });
}
