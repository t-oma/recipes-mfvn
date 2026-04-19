<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useCategories } from "@/features/categories/categories.queries";
import CategoriesGrid from "@/features/categories/views/CategoriesGrid.vue";

const {
  data: categories,
  isLoading,
  error,
} = useCategories({ sort: "-recipeCount" });
</script>

<template>
  <div class="mb-14 flex items-end justify-between">
    <div>
      <p
        class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
      >
        Pick a direction
      </p>
      <h2
        class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
      >
        Recipe Categories
      </h2>
    </div>
    <RouterLink
      to="#"
      class="text-terracotta hover:text-terracotta-dark hidden items-center gap-2 text-sm font-semibold transition-colors sm:flex"
    >
      All categories
      <i class="pi pi-arrow-right text-xs" />
    </RouterLink>
  </div>

  <CategoriesGrid :categories :isLoading :error />
</template>
