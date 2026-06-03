<script setup lang="ts">
import type { RecipeIngredient } from "@recipes/shared";

const {
  ingredients,
  servings,
  loading = false,
} = defineProps<{
  ingredients?: RecipeIngredient[];
  servings?: number;
  loading?: boolean;
}>();

const PLACEHOLDERS_COUNT = 6;
</script>

<template>
  <section class="">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-display text-2xl font-bold tracking-tight text-stone-900">
        Ingredients
      </h2>
      <span class="text-sm text-stone-500"> {{ servings ?? 0 }} servings </span>
    </div>

    <ul class="space-y-3">
      <template v-if="loading">
        <li v-for="n in PLACEHOLDERS_COUNT" :key="n">
          <Skeleton height="3rem" />
        </li>
      </template>

      <template v-else>
        <li
          v-for="(ingredient, index) in ingredients"
          :key="index"
          class="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow"
        >
          <i class="pi pi-circle-fill text-terracotta text-xs" />

          <div class="flex-1">
            <span class="font-medium text-stone-800">
              {{ ingredient.name }}
            </span>
            <span class="ml-2 text-stone-500">
              {{ ingredient.quantity }}
              {{ ingredient.unit }}
            </span>
          </div>
        </li>
      </template>
    </ul>
  </section>
</template>
