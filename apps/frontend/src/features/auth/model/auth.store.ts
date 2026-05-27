import type { AuthResponse, UserDetails } from "@recipes/shared";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { refresh as refreshApi } from "../api/auth.api";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const user = ref<UserDetails | null>(null);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  function setSession(response: AuthResponse) {
    accessToken.value = response.token;
    user.value = response.user;
  }

  function clearSession() {
    accessToken.value = null;
    user.value = null;
  }

  async function initialize() {
    try {
      const data = await refreshApi();
      setSession(data);
    } catch {
      clearSession();
    } finally {
      isInitialized.value = true;
    }
  }

  async function refresh(): Promise<{ token: string } | null> {
    try {
      const data = await refreshApi();
      setSession(data);
      return { token: data.token };
    } catch {
      clearSession();
      return null;
    }
  }

  return {
    accessToken,
    user,
    isInitialized,
    isAuthenticated,
    setSession,
    clearSession,
    initialize,
    refresh,
  };
});
