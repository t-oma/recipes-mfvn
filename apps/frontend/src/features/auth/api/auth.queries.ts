import {
  mutationOptions,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refresh as refreshApi,
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
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function registerOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: registerApi,
    onSuccess: ({ token, user }) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function refreshSessionOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: refreshApi,
    onSuccess: ({ token, user }) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function logoutOptions() {
  const queryClient = useQueryClient();

  return mutationOptions({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
