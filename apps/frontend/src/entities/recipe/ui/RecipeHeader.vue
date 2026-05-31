<script setup lang="ts">
import type { RecipeDetails } from "@recipes/shared";
import AppLink from "@/shared/ui/AppLink.vue";
import { formatRecipeDate } from "../lib/format";

const { loading = false } = defineProps<{
  recipe?: Pick<
    RecipeDetails,
    "title" | "createdAt" | "updatedAt" | "author" | "image"
  >;
  loading?: boolean;
}>();
</script>

<template>
  <header class="grid grid-cols-5 gap-8 bg-stone-50 py-6 lg:py-10">
    <template v-if="loading">
      <Skeleton v-if="loading" height="100%" class="col-span-3 aspect-4/3" />

      <div class="col-span-2 flex flex-col justify-center space-y-2">
        <Skeleton height="6.5rem" width="80%" />
        <Skeleton height="1.25rem" width="50%" />
        <Skeleton height="1.25rem" width="40%" class="mt-6" />
      </div>
    </template>

    <template v-else-if="recipe">
      <Image
        :src="recipe.image.url"
        :alt="recipe.image.alt"
        class="col-span-3 overflow-hidden rounded-md object-cover"
        preview
      />

      <div
        class="col-span-2 flex flex-col justify-center space-y-2 border-b-2 border-stone-200"
      >
        <h1
          class="font-display text-4xl leading-tight font-bold tracking-tight text-pretty text-stone-900 lg:text-5xl"
        >
          {{ recipe.title }}
        </h1>

        <p class="text-stone-600">
          {{ formatRecipeDate(recipe.createdAt, recipe.updatedAt) }}
        </p>

        <div class="mt-6 flex items-center gap-3">
          <AppLink
            :to="`#/authors/${recipe.author.id}`"
            class="inline-flex items-center justify-center gap-1 font-medium text-stone-600"
          >
            By
            <span class="hover:text-terracotta-500 underline transition-colors">
              {{ recipe.author.name }}
            </span>
          </AppLink>
        </div>
      </div>
    </template>
  </header>
</template>
