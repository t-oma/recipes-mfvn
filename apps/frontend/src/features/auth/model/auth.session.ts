import type { QueryClient } from "@tanstack/vue-query";
import { refresh as refreshApi } from "../api/auth.api";
import { queryKeys } from "../api/auth.queries";
import type { useAuthStore } from "./auth.store";

export function createAuthSession(params: {
  queryClient: QueryClient;
  authStore: ReturnType<typeof useAuthStore>;
}) {
  const { queryClient, authStore } = params;

  async function restoreSession(options?: { markInitialized?: boolean }) {
    try {
      const data = await refreshApi();

      authStore.setSession(data.token);
      queryClient.setQueryData(queryKeys.me(), data.user);

      return { token: data.token };
    } catch {
      authStore.clearSession();
      queryClient.removeQueries({ queryKey: queryKeys.me() });
      return null;
    } finally {
      if (options?.markInitialized) {
        authStore.markInitialized();
      }
    }
  }
  return {
    restoreSession,
  };
}
