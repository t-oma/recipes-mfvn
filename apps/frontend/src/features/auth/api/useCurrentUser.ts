import { queryOptions, useQuery } from "@tanstack/vue-query";
import { useAuthStore } from "../model/auth.store";
import { getCurrentUser } from "./auth.api";
import { queryKeys } from "./auth.queries";

export function currentUserOptions(enabled: () => boolean = () => true) {
  return queryOptions({
    queryKey: queryKeys.me(),
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
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
