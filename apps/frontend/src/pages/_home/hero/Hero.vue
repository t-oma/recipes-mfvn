<script setup lang="ts">
import WavyDivider from "@/common/ui/WavyDivider.vue";
import HeroRecipe from "./HeroRecipe.vue";
import SocialProof from "./SocialProof.vue";

const recipe = {
  title: "Braised Potatoes with Mushrooms",
  image:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&h=800&fit=crop",
  tag: "Recipe of the Day",
  saveCount: 2_847,
  cookingTime: "45",
};
</script>

<template>
  <section class="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <!-- Left: Text -->
        <div>
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"
              />
              <span
                class="relative inline-flex h-2 w-2 rounded-full bg-amber-500"
              />
            </span>
            Over 300+ tested recipes
          </div>

          <h1
            class="font-display text-5xl leading-[1.1] font-bold tracking-tight text-stone-900 lg:text-7xl"
          >
            Cook with
            <span class="relative inline-block">
              <span class="relative z-10">passion</span>
              <span
                class="bg-terracotta/20 absolute -bottom-1 left-0 z-0 h-3 w-full lg:h-4"
              />
            </span>
            <br />
            every day
          </h1>

          <p
            class="mt-6 max-w-lg text-lg leading-relaxed text-stone-600 lg:text-xl"
          >
            Classic dishes and modern twists. Step-by-step recipes, helpful
            tips, and inspiration for your kitchen.
          </p>

          <div class="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="group flex items-center gap-3 rounded-2xl bg-stone-900 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-stone-900/20 transition-all hover:bg-stone-800 hover:shadow-2xl hover:shadow-stone-900/30"
            >
              Start Cooking
              <i
                class="pi pi-arrow-right text-sm transition-transform group-hover:translate-x-1"
              />
            </button>
            <button
              type="button"
              class="flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-7 py-4 text-base font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50"
            >
              <i class="pi pi-play-circle text-terracotta text-lg" />
              Watch Tour
            </button>
          </div>

          <SocialProof />
        </div>

        <HeroRecipe :recipe />
      </div>
    </div>

    <WavyDivider />
  </section>
</template>
