<script setup lang="ts">
import type { RecipeListItem } from "@recipes/shared";

const props = defineProps<{
  recipe: Pick<
    RecipeListItem,
    "title" | "cookingTime" | "difficulty" | "stats" | "image"
  >;
}>();
</script>

<template>
  <div
    class="group flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-900/8"
  >
    <div class="relative shrink-0 overflow-hidden">
      <img
        :src="recipe.image.url"
        :alt="recipe.image.alt"
        class="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <button
        type="button"
        class="absolute top-3 right-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-stone-400 backdrop-blur-md transition-colors hover:text-rose-500"
      >
        <i class="pi pi-heart-fill text-sm" />
      </button>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <h3
        class="font-display group-hover:text-terracotta text-lg font-bold text-stone-900 transition-colors"
      >
        {{ recipe.title }}
      </h3>

      <div class="mt-3 mb-4 flex items-center gap-4 text-sm text-stone-500">
        <span class="flex items-center gap-1.5">
          <i class="pi pi-clock text-xs" />
          {{ recipe.cookingTime }}m
        </span>
        <span class="flex items-center gap-1.5">
          <i class="pi pi-chart-bar text-xs" />
          {{ recipe.difficulty }}
        </span>
      </div>

      <div
        class="mt-auto flex items-center justify-between border-t border-stone-100 pt-4"
      >
        <div class="flex items-center gap-1">
          <i class="pi pi-star-fill text-xs text-amber-400" />
          <span class="text-sm font-semibold text-stone-700">
            {{ recipe.stats.averageRating }}
          </span>
        </div>
        <RouterLink
          to="#/recipes"
          class="text-terracotta flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
        >
          View
          <i class="pi pi-arrow-right text-[10px]" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>
