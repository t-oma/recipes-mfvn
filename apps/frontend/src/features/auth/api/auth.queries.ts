import {
  mutationOptions,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { useAuthStore } from "@/features/auth/model/auth.store";
import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refresh as refreshApi,
  register as registerApi,
} from "./auth.api";

export const authKeys = {
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
  const authStore = useAuthStore();

  return mutationOptions({
    mutationFn: loginApi,
    onSuccess: ({ token, user }) => {
      authStore.setSession({ token, user });
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function registerOptions() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return mutationOptions({
    mutationFn: registerApi,
    onSuccess: ({ token, user }) => {
      authStore.setSession({ token, user });
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function refreshSessionOptions() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return mutationOptions({
    mutationFn: refreshApi,
    onSuccess: ({ token, user }) => {
      authStore.setSession({ token, user });
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function logoutOptions() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return mutationOptions({
    mutationFn: logoutApi,
    onSuccess: () => {
      authStore.clearSession();
      queryClient.clear();
    },
  });
}
