import { useMutation } from "@tanstack/vue-query";
import { useAuthStore } from "../model/auth.store";
import { login } from "./auth.api";
import { queryKeys } from "./auth.queries";

export function useLoginMutation() {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }, _body, _onMutateResult, context) => {
      authStore.setSession(token);
      context.client.setQueryData(queryKeys.me(), user);
    },
  });
}
