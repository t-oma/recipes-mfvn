<script setup lang="ts">
const { as, width = "7xl" } = defineProps<{
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
    v-if="as"
    :is="as"
    class="mx-auto px-6 lg:px-8"
    :class="widthClasses[width]"
  >
    <slot />
  </component>

  <div v-else class="mx-auto px-6 lg:px-8" :class="widthClasses[width]">
    <slot />
  </div>
</template>
