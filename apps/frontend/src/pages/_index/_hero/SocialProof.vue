<script setup lang="ts">
import type { ReviewsStats } from "@recipes/shared";

defineProps<{
  stats: ReviewsStats;
}>();
</script>

<template>
  <div>
    <Rating :defaultValue="Math.ceil(stats.averageRating)" readonly />

    <p class="mt-0.5 text-sm text-stone-500">
      <span class="font-semibold text-stone-700">
        {{ stats.happyCooksCount.toLocaleString() }}+
      </span>
      happy cooks
    </p>
  </div>
</template>
