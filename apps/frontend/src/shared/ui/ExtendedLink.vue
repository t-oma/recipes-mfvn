<script setup lang="ts">
import { computed } from "vue";
import type { RouterLinkProps } from "vue-router";

export type ExtendedLinkProps = RouterLinkProps;
const props = defineProps<ExtendedLinkProps>();

const isExternal = computed(() => {
  return typeof props.to === "string" && props.to.startsWith("http");
});
</script>

<template>
  <RouterLink v-if="!isExternal" v-bind="$props">
    <slot />
  </RouterLink>

  <!-- biome-ignore lint/a11y/useAnchorContent: accesibile content provided by slot or attributes -->
  <a v-else :href="to.toString()" target="_blank" rel="noopener noreferrer">
    <slot />
  </a>
</template>
