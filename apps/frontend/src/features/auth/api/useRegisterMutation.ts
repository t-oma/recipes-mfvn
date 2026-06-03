import { useMutation } from "@tanstack/vue-query";
import { useAuthStore } from "../model/auth.store";
import { register } from "./auth.api";
import { queryKeys } from "./auth.queries";

export function useRegisterMutation() {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: register,
    onSuccess: ({ token, user }, _body, _onMutateResult, context) => {
      authStore.setSession(token);
      context.client.setQueryData(queryKeys.me(), user);
    },
  });
}
