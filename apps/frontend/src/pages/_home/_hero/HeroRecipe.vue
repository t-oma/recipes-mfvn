<script setup lang="ts">
const props = defineProps<{
  recipe: {
    title: string;
    image: string;
    tag: string;
    saveCount: number;
    cookingTime: string;
  };
}>();
</script>

<template>
  <div class="relative mx-auto max-w-lg lg:max-w-none">
    <!-- Main image -->
    <div
      class="relative overflow-hidden rounded-3xl shadow-2xl shadow-stone-900/15"
    >
      <img
        :src="recipe.image"
        :alt="recipe.title"
        class="h-105 w-full object-cover lg:h-130"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-stone-900/30 to-transparent"
      />
      <div class="absolute right-6 bottom-6 left-6">
        <div
          class="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 backdrop-blur-md"
        >
          <i class="pi pi-star-fill text-sm text-amber-400" />
          <span class="text-sm font-semibold text-stone-800">
            Recipe of the Day
          </span>
        </div>
        <h3
          class="font-display mt-2 text-2xl font-bold text-white drop-shadow-lg"
        >
          {{ recipe.title }}
        </h3>
      </div>
    </div>

    <!-- Floating card 1 -->
    <div
      class="absolute top-8 -left-6 hidden w-48 rounded-2xl border border-stone-100 bg-white p-4 shadow-xl shadow-stone-900/8 lg:block"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50"
        >
          <i class="pi pi-clock text-emerald-600" />
        </div>
        <div>
          <p class="text-xs text-stone-500">Cook Time</p>
          <p class="text-sm font-bold text-stone-800">
            {{ recipe.cookingTime }} minutes
          </p>
        </div>
      </div>
    </div>

    <!-- Floating card 2 -->
    <div
      class="absolute -right-4 bottom-16 hidden w-52 rounded-2xl border border-stone-100 bg-white p-4 shadow-xl shadow-stone-900/8 lg:block"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50"
        >
          <i class="pi pi-heart-fill text-rose-500" />
        </div>
        <div>
          <p class="text-xs text-stone-500">Saved by</p>
          <p class="text-sm font-bold text-stone-800">
            {{ recipe.saveCount.toLocaleString() }} people
          </p>
        </div>
      </div>
    </div>

    <!-- Decorative elements -->
    <div
      class="bg-terracotta/8 absolute -top-8 -right-8 -z-10 h-72 w-72 rounded-full blur-3xl"
    />
    <div
      class="absolute -bottom-8 -left-8 -z-10 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl"
    />
  </div>
</template>
