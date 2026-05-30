<script setup lang="ts">
const { bg = "bg-white" } = defineProps<{
  id?: string;
  bg?: "bg-white" | "bg-stone-50";
}>();
</script>

<template>
  <section :id class="py-16 lg:py-24" :class="bg">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <slot />
    </div>
  </section>
</template>
