import { defineStore } from "pinia";
import { computed, ref } from "vue";

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

  function markInitialized() {
    isInitialized.value = true;
  }

  return {
    accessToken,
    isInitialized,
    isAuthenticated,
    setSession,
    clearSession,
    markInitialized,
  };
});
