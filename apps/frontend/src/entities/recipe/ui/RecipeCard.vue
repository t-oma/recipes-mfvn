<script setup lang="ts">
import type { RecipeListItem } from "@recipes/shared";
import { buildRecipeRef } from "@recipes/shared";
import AppLink from "@/shared/ui/AppLink.vue";

type Props = {
  recipe: Pick<
    RecipeListItem,
    "id" | "title" | "slug" | "cookingTime" | "difficulty" | "stats" | "image"
  >;
};

const props = defineProps<Props>();
</script>

<template>
  <Card
    class="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/8"
    :pt="{
      header: {
        class: 'relative',
      },
      body: {
        class: 'flex-1',
      },
      footer: {
        class:
          'mt-auto flex items-center justify-between border-t border-stone-100 pt-4',
      },
    }"
  >
    <template #header>
      <Image
        :src="recipe.image.url"
        :alt="recipe.image.alt"
        class="h-full transition-transform duration-500 group-hover:scale-105"
      />

      <div class="absolute top-3 right-3 left-3">
        <slot name="header-actions" />
      </div>
    </template>

    <template #content>
      <div class="flex flex-1 flex-col">
        <AppLink :to="`/recipes/${buildRecipeRef(recipe)}`">
          <h3
            class="font-display group-hover:text-terracotta text-lg font-bold text-stone-900 transition-colors"
          >
            {{ recipe.title }}
          </h3>
        </AppLink>

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
      </div>
    </template>

    <template #footer>
      <div class="flex items-center gap-1">
        <i class="pi pi-star-fill text-xs text-amber-400" />
        <span class="text-sm font-semibold text-stone-700">
          {{ recipe.stats.averageRating }}
        </span>
      </div>

      <AppLink
        :to="`/recipes/${buildRecipeRef(recipe)}`"
        class="text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
        icon="pi pi-arrow-right text-[0.75rem]"
        iconPos="right"
      >
        View
      </AppLink>
    </template>
  </Card>
</template>
