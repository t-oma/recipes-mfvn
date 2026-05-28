import "@/assets/main.css";

import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { ToastService } from "primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import { createAuthSession } from "@/features/auth/model/auth.session";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { http } from "@/shared/api/http";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const queryClient = new QueryClient();

const preset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "0.125rem",
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
    },
  },
  semantic: {
    primary: {
      0: "#ffffff",
      50: "var(--color-terracotta-50)",
      100: "var(--color-terracotta-100)",
      200: "var(--color-terracotta-200)",
      300: "var(--color-terracotta-300)",
      400: "var(--color-terracotta-400)",
      500: "var(--color-terracotta-500)",
      600: "var(--color-terracotta-600)",
      700: "var(--color-terracotta-700)",
      800: "var(--color-terracotta-800)",
      900: "var(--color-terracotta-900)",
      950: "var(--color-terracotta-950)",
    },
    formField: {
      borderRadius: "{borderRadius.xl}",
      paddingY: "0.50rem",
      focusRing: {
        width: "2px",
        style: "solid",
        color:
          "color-mix(in oklab, var(--color-terracotta) /* #c27a54 */ 20%, transparent)",
      },
    },
    colorScheme: {
      light: {
        primary: {
          color: "var(--color-terracotta-500)",
          hoverColor: "var(--color-terracotta-600)",
          activeColor: "var(--color-terracotta-700)",
        },
        formField: {
          background: "#ffffff",
          borderColor: "{stone.200}",
          hoverBorderColor: "var(--color-terracotta-light)",
          focusBorderColor: "var(--color-terracotta)",
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: "{borderRadius.2xl}",
        paddingX: "1rem",
        paddingY: "0.75rem",
        sm: {
          paddingX: "0.75rem",
          paddingY: "0.5rem",
        },
      },
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset,
    options: {
      darkModeSelector: "html.dark",
    },
  },
});
app.use(ToastService);
app.use(VueQueryPlugin, { queryClient });

app.use(createPinia());

const authStore = useAuthStore();
const authSession = createAuthSession({ queryClient, authStore });

http.setAuthBridge({
  getAccessToken: () => authStore.accessToken,
  refresh: () => authSession.restoreSession(),
  clearSession: () => authStore.clearSession(),
});

await authSession.restoreSession({ markInitialized: true });

app.use(router);
app.mount("#app");
