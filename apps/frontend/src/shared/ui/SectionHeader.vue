<script setup lang="ts">
import { RouterLink } from "vue-router";

const { align = "left" } = defineProps<{
  title: string;
  subtitle: string;
  link?: {
    text: string;
    to: string;
  };
  align?: "left" | "center";
}>();
</script>

<template>
  <div
    class="mb-14 flex items-end"
    :class="{
      'justify-center text-center': align === 'center',
      'justify-between': align === 'left',
    }"
  >
    <div>
      <p
        class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
      >
        {{ title }}
      </p>
      <h2
        class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
      >
        {{ subtitle }}
      </h2>
    </div>

    <RouterLink
      v-if="link"
      :to="link.to"
      class="text-terracotta hover:text-terracotta-dark hidden items-center gap-2 text-sm font-semibold transition-colors sm:flex"
    >
      {{ link.text }}
      <i class="pi pi-arrow-right text-xs" />
    </RouterLink>
  </div>
</template>
