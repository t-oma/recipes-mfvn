<script setup lang="ts">
import type { ReviewsStats } from "@recipes/shared";

const { stats, loading = false } = defineProps<{
  stats?: ReviewsStats;
  loading?: boolean;
}>();
</script>

<template>
  <div class="flex items-center gap-6">
    <template v-if="loading">
      <div class="flex items-center -space-x-2.5">
        <Skeleton
          v-for="n in 4"
          :key="n"
          height="2.25rem"
          width="2.25rem"
          class="border-2 border-white"
          shape="circle"
        />
      </div>
      <div class="space-y-2">
        <Skeleton height="0.75rem" width="6rem" />
        <Skeleton height="0.75rem" width="6.5rem" />
      </div>
    </template>

    <template v-else-if="stats">
      <AvatarGroup>
        <Avatar
          v-for="(user, index) in ['EK', 'AM', 'MS', 'JP']"
          :key="index"
          :label="user"
          shape="circle"
          class="h-9 w-9"
          :pt="{
            label: {
              class: 'text-xs font-semibold',
            },
          }"
        />
      </AvatarGroup>

      <div>
        <Rating :defaultValue="Math.ceil(stats.averageRating)" readonly />

        <p class="text-sm text-stone-500">
          <span class="font-semibold text-stone-700">
            {{ stats.happyCooksCount.toLocaleString() }}+
          </span>
          happy cooks
        </p>
      </div>
    </template>
  </div>
</template>
