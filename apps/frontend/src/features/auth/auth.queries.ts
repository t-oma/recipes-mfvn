import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import { getToken, removeToken, setToken } from "@/common/api/client";
import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
} from "./auth.api";

const authQueryKeys = {
  all: ["auth"] as const,
  me: () => [...authQueryKeys.all, "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: getCurrentUser,
    enabled: () => !!getToken(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authQueryKeys.all, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: ({ token, user }) => {
      setToken(token);
      queryClient.setQueryData(authQueryKeys.all, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    removeToken();
    queryClient.setQueryData(authQueryKeys.all, null);
    queryClient.clear();
  };
}

export function useIsAuthenticated() {
  return computed(() => !!getToken());
}
