import "@/assets/main.css";

import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { ToastService } from "primevue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { createApp } from "vue";
import { createAuthSession, useAuthStore } from "@/features/auth";
import { http } from "@/shared";
import App from "./App.vue";
import { primeVueOptions } from "./primevue-options";
import router from "./router";

const app = createApp(App);
const queryClient = new QueryClient();

app.directive("tooltip", Tooltip);

app.use(PrimeVue, primeVueOptions);
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
