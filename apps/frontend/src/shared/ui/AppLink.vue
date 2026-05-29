<script setup lang="ts">
import { computed } from "vue";
import type { RouterLinkProps } from "vue-router";

const props = defineProps<RouterLinkProps>();

const isExternal = computed(() => {
  return typeof props.to === "string" && props.to.startsWith("http");
});
</script>

<template>
  <RouterLink
    v-if="!isExternal"
    :to="to"
    class="hover:text-terracotta-500 inline-flex items-center justify-center gap-2 text-sm font-medium text-stone-600 transition-colors"
  >
    <slot />
  </RouterLink>

  <!-- biome-ignore lint/a11y/useAnchorContent: accesibile content provided by slot or attributes -->
  <a
    v-else
    :href="to.toString()"
    target="_blank"
    rel="noopener noreferrer"
    class="hover:text-terracotta-500 inline-flex items-center justify-center gap-2 text-sm font-medium text-stone-600 transition-colors"
  >
    <slot />
  </a>
</template>
