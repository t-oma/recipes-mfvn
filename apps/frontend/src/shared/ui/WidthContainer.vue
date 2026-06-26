<script setup lang="ts">
const { as = "div", width = "7xl" } = defineProps<{
  as?: string;
  width?: "7xl";
}>();

const widthClasses = {
  "7xl": "max-w-7xl",
};
</script>

<template>
  <!-- Container -->
  <component
    :is="as"
    class="relative mx-auto px-6 lg:px-8"
    :class="widthClasses[width]"
  >
    <slot />
  </component>
</template>
