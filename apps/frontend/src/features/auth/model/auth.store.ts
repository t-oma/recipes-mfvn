import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { refresh as refreshApi } from "../api/auth.api";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  function setSession(token: string) {
    accessToken.value = token;
  }
  function clearSession() {
    accessToken.value = null;
  }

  async function initialize() {
    try {
      const data = await refreshApi();
      setSession(data.token);
    } catch {
      clearSession();
    } finally {
      isInitialized.value = true;
    }
  }

  async function refresh(): Promise<{ token: string } | null> {
    try {
      const data = await refreshApi();
      setSession(data.token);
      return { token: data.token };
    } catch {
      clearSession();
      return null;
    }
  }

  return {
    accessToken,
    isInitialized,
    isAuthenticated,
    setSession,
    clearSession,
    initialize,
    refresh,
  };
});
