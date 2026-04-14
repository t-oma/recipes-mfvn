import "@/assets/main.css";

import Aura from "@primeuix/themes/aura";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: "html.dark",
    },
  },
});
app.use(VueQueryPlugin);
app.use(createPinia());
app.use(router);

app.mount("#app");
