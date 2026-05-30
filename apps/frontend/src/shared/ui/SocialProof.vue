<script setup lang="ts">
import type { ReviewsStats } from "@recipes/shared";

defineProps<{
  stats?: ReviewsStats;
  loading: boolean;
}>();
</script>

<template>
  <div class="flex items-center gap-6">
    <div v-if="loading" class="flex items-center -space-x-2.5">
      <Skeleton
        v-for="n in 4"
        :key="n"
        class="h-9! w-9! border-2 border-white"
        shape="circle"
      />
    </div>

    <AvatarGroup v-else>
      <Avatar
        v-for="(user, index) in ['EK', 'AM', 'MS', 'JP']"
        :key="index"
        :label="user"
        shape="circle"
        class="h-9! w-9!"
        :pt="{
          label: {
            class: 'text-xs font-semibold',
          },
        }"
      />
    </AvatarGroup>

    <div v-if="loading" class="space-y-2">
      <Skeleton class="h-3 w-24!" />
      <Skeleton class="h-3 w-26!" />
    </div>

    <div v-else-if="stats">
      <Rating :defaultValue="Math.ceil(stats.averageRating)" readonly />

      <p class="text-sm text-stone-500">
        <span class="font-semibold text-stone-700">
          {{ stats.happyCooksCount.toLocaleString() }}+
        </span>
        happy cooks
      </p>
    </div>
  </div>
</template>
