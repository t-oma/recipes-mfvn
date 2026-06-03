import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";
import type { PrimeVueConfiguration } from "primevue";

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
        surface: {
          0: "var(--color-white)",
          50: "var(--color-stone-50)",
          100: "var(--color-stone-100)",
          200: "var(--color-stone-200)",
          300: "var(--color-stone-300)",
          400: "var(--color-stone-400)",
          500: "var(--color-stone-500)",
          600: "var(--color-stone-600)",
          700: "var(--color-stone-700)",
          800: "var(--color-stone-800)",
          900: "var(--color-stone-900)",
          950: "var(--color-stone-950)",
        },
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
        borderRadius: "{borderRadius.xl}",
        paddingX: "1rem",
        sm: {
          paddingX: "0.75rem",
        },
        lg: {
          paddingX: "1.25rem",
        },
      },
      colorScheme: {
        light: {
          root: {
            secondary: {
              background: "#ffffff",
            },
            contrast: {
              background: "var(--color-stone-900)",
              hoverBackground: "var(--color-stone-800)",
              activeBackground: "var(--color-stone-700)",
            },
          },
          outlined: {
            secondary: {
              borderColor: "{stone.200}",
              color: "{stone.700}",
              hoverBackground: "{stone.100}",
              activeBackground: "{stone.200}",
            },
          },
        },
      },
    },
    rating: {
      icon: {
        activeColor: "var(--color-amber-400)",
        hoverColor: "var(--color-amber-500)",
      },
    },
  },
});

export const primeVueOptions: PrimeVueConfiguration = {
  theme: {
    preset,
    options: {
      darkModeSelector: "html.dark",
      cssLayer: {
        name: "primevue",
        order:
          "properties, keyframes, theme, base, primevue, components, utilities",
      },
    },
  },
};
