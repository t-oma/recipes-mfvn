<script setup lang="ts">
import PrimaryLink from "./PrimaryLink.vue";

type Props = {
  title: string;
  subtitle: string;
  link?: {
    label: string;
    to: string;
  };
  align?: "left" | "center";
};

const { align = "left" } = defineProps<Props>();
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

    <PrimaryLink
      v-if="link"
      :to="link.to"
      class="font-medium"
      icon="pi pi-arrow-right text-xs"
      iconPos="right"
    >
      {{ link.label }}
    </PrimaryLink>
  </div>
</template>
