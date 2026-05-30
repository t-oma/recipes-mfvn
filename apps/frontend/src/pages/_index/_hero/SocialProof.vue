<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { reviewStatsOptions } from "@/entities/review/api/review.queries";

const { data: stats, isLoading } = useQuery(reviewStatsOptions());
</script>

<template>
  <div class="mt-12 flex items-center gap-6">
    <AvatarGroup>
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

    <div>
      <div
        v-if="isLoading"
        class="h-3.5 w-24 animate-pulse rounded bg-stone-200"
      />
      <Rating
        v-else
        :defaultValue="Math.ceil(stats?.averageRating ?? 0)"
        readonly
      />

      <p class="mt-0.5 text-sm text-stone-500">
        <span
          v-if="isLoading"
          class="inline-block h-4 w-16 animate-pulse rounded bg-stone-200"
        />

        <template v-else>
          <span class="font-semibold text-stone-700">
            {{ stats?.happyCooksCount.toLocaleString() }}+
          </span>
          happy cooks
        </template>
      </p>
    </div>
  </div>
</template>
