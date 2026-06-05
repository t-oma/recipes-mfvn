<script setup lang="ts">
import type { ExtendedLinkProps } from "./ExtendedLink.vue";
import ExtendedLink from "./ExtendedLink.vue";

const variantClasses = {
  primary: "text-terracotta hover:text-terracotta-dark",
  secondary: "text-stone-600 hover:text-terracotta-500 font-medium",
};

const {
  variant = "primary",
  icon,
  iconPos = "right",
} = defineProps<
  ExtendedLinkProps & {
    variant?: keyof typeof variantClasses;
    icon?: string | null;
    iconPos?: "left" | "right";
  }
>();
</script>

<template>
  <ExtendedLink
    v-bind="$props"
    class="inline-flex items-center gap-2 text-sm transition-colors"
    :class="variantClasses[variant]"
  >
    <template v-if="icon != null && iconPos === 'left'">
      <i :class="icon" />
    </template>

    <slot />

    <template v-if="icon != null && iconPos === 'right'">
      <i :class="icon" />
    </template>
  </ExtendedLink>
</template>
