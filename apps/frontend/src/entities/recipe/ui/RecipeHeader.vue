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
  <header class="grid gap-4 bg-stone-50 py-6 md:grid-cols-5 md:gap-8 lg:py-10">
    <template v-if="loading">
      <Skeleton
        height="100%"
        class="hidden aspect-4/3 md:col-span-3 md:inline"
      />

      <div class="flex flex-col justify-center space-y-2 md:col-span-2">
        <Skeleton width="80%" class="h-14! md:h-26!" />
        <Skeleton height="1.25rem" width="50%" />
        <Skeleton height="1.25rem" width="40%" class="mt-4" />
      </div>

      <Skeleton height="100%" class="aspect-4/3 md:col-span-3 md:hidden" />
    </template>

    <template v-else-if="recipe">
      <Image
        :src="recipe.image.url"
        :alt="recipe.image.alt"
        class="hidden aspect-4/3 overflow-hidden rounded-md object-cover md:col-span-3 md:inline"
        preview
      />

      <div
        class="flex flex-col justify-center space-y-2 md:col-span-2 md:border-b-2 md:border-stone-200"
      >
        <h1
          class="font-display text-4xl leading-tight font-bold tracking-tight text-pretty text-stone-900"
        >
          {{ recipe.title }}
        </h1>

        <p class="text-stone-600">
          {{ formatRecipeDate(recipe.createdAt, recipe.updatedAt) }}
        </p>

        <div class="mt-4 flex items-center gap-3">
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

      <Image
        :src="recipe.image.url"
        :alt="recipe.image.alt"
        class="aspect-4/3 overflow-hidden rounded-md object-cover md:col-span-3 md:hidden"
        preview
      />
    </template>
  </header>
</template>
