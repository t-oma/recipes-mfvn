<script setup lang="ts">
const { instructions, loading = false } = defineProps<{
  instructions?: string[];
  loading?: boolean;
}>();
const PLACEHOLDERS_COUNT = 5;
</script>

<template>
  <section>
    <h2
      class="font-display mb-4 text-2xl font-bold tracking-tight text-stone-900"
    >
      Instructions
    </h2>

    <ol class="space-y-6">
      <template v-if="loading">
        <li v-for="n in PLACEHOLDERS_COUNT" :key="n" class="flex gap-4">
          <Skeleton height="3rem" />
        </li>
      </template>

      <template v-else>
        <li
          v-for="(step, index) in instructions"
          :key="index"
          class="flex gap-4"
        >
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white"
          >
            {{ index + 1 }}
          </div>
          <p class="mt-0.5 leading-relaxed text-stone-700">{{ step }}</p>
        </li>
      </template>
    </ol>
  </section>
</template>
