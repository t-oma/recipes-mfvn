<script setup lang="ts">
import type { AppLinkProps } from "./AppLink.vue";
import AppLink from "./AppLink.vue";

const { icon, iconPos = "right" } = defineProps<
  AppLinkProps & {
    icon?: string | null;
    iconPos?: "left" | "right";
  }
>();
</script>

<template>
  <AppLink
    v-bind="$props"
    class="text-terracotta hover:text-terracotta-dark inline-flex items-center gap-2 text-sm transition-colors"
  >
    <template v-if="icon != null && iconPos === 'left'">
      <i :class="icon" />
    </template>

    <slot />

    <template v-if="icon != null && iconPos === 'right'">
      <i :class="icon" />
    </template>
  </AppLink>
</template>
