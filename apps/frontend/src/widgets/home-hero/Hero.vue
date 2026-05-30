<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { reviewStatsOptions } from "@/entities/review/api/review.queries";
import SocialProof from "@/shared/ui/SocialProof.vue";
import WavyDivider from "@/shared/ui/WavyDivider.vue";
import HeroRecipe from "./HeroRecipe.vue";

const recipe = {
  title: "Braised Potatoes with Mushrooms",
  image:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&h=800&fit=crop",
  tag: "Recipe of the Day",
  saveCount: 2_847,
  cookingTime: "45",
};

const { data: reviewsStats, isPending: isReviewsStatsPending } =
  useQuery(reviewStatsOptions());
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
            <Button
              label="Start Cooking"
              icon="pi pi-arrow-right"
              iconPos="right"
              severity="contrast"
              size="large"
              class="*:data-[pc-section='icon']:transition-transform hover:*:data-[pc-section='icon']:translate-x-1"
            />
            <Button
              label="Watch Tour"
              icon="pi pi-play-circle"
              severity="secondary"
              size="large"
              outlined
            />
          </div>

          <SocialProof
            :stats="reviewsStats"
            :loading="isReviewsStatsPending"
            class="mt-12"
          />
        </div>

        <HeroRecipe :recipe />
      </div>
    </div>

    <WavyDivider />
  </section>
</template>
