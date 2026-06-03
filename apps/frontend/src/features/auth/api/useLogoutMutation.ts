import { useMutation } from "@tanstack/vue-query";
import { useAuthStore } from "../model/auth.store";
import { logout } from "./auth.api";

export function useLogoutMutation() {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: logout,
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      authStore.clearSession();
      context.client.clear();
    },
  });
}
