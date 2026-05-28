import {
  queryOptions,
  useMutation,
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

export function currentUserOptions(enabled: () => boolean = () => true) {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    retry: false,
    enabled,
  });
}

export function useCurrentUser() {
  const authStore = useAuthStore();

  return useQuery(
    currentUserOptions(
      () => authStore.isInitialized && authStore.isAuthenticated,
    ),
  );
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ token, user }) => {
      authStore.setSession({ token, user });
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: ({ token, user }) => {
      authStore.setSession({ token, user });
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useRefreshSessionMutation() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: refreshApi,
    onSuccess: ({ token, user }) => {
      authStore.setSession({ token, user });
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      authStore.clearSession();
      queryClient.clear();
    },
  });
}
