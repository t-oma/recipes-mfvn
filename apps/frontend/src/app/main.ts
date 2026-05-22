import "@/assets/main.css";

import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import { ToastService } from "primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

const preset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "0.125rem",
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
    },
  },
  semantic: {
    formField: {
      borderRadius: "{borderRadius.xl}",
      paddingY: "0.50rem",
      focusRing: {
        width: "2px",
        style: "solid",
        color:
          "color-mix(in oklab, var(--color-terracotta) /* #c27a54 */ 20%, transparent);",
      },
    },
    colorScheme: {
      light: {
        formField: {
          background: "#ffffff",
          borderColor: "{stone.200}",
          hoverBorderColor: "var(--color-terracotta-light)",
          focusBorderColor: "var(--color-terracotta)",
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
app.use(VueQueryPlugin);
app.use(createPinia());
app.use(router);

app.mount("#app");
