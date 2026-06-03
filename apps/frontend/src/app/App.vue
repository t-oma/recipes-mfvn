<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import { DefaultLayout, NoLayout } from "@/layouts";

const route = useRoute();

const layouts = {
  default: DefaultLayout,
  "no-layout": NoLayout,
} as const;

const layout = computed(() => layouts[route.meta.layout ?? "no-layout"]);
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
</template>
