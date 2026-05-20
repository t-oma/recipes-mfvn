import {
  mutationOptions,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { computed } from "vue";
import { getToken, removeToken, setToken } from "@/shared/api/client";
import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
} from "./auth.api";

const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function currentUserOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    enabled: () => !!getToken(),
    retry: false,
  });
}

export function useCurrentUser() {
  return useQuery(currentUserOptions());
}

export function loginOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: loginApi,
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}
export function registerOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: registerApi,
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

/**
 * Logout user.
 *
 * Removes the token from the local storage and clears the query client cache.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    removeToken();
    queryClient.setQueryData(authKeys.me(), null);
    queryClient.clear();
  };
}

/**
 * Check if the user is authenticated.
 *
 * @returns true if the user is authenticated, false otherwise.
 */
export function useIsAuthenticated() {
  return computed(() => !!getToken());
}
