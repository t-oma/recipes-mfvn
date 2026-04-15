<script setup lang="ts">
import { onMounted, ref } from "vue";
import DefaultLayout from "@/common/ui/DefaultLayout.vue";
import Categories from "@/features/home/views/categories/Categories.vue";
import FeaturedRecipes from "@/features/home/views/featured-recipes/FeaturedRecipes.vue";
import Hero from "@/features/home/views/hero/Hero.vue";
import NewsletterCTA from "@/features/home/views/newsletter/NewsletterCTA.vue";
import Testimonials from "@/features/home/views/testimonials/Testimonials.vue";
import TodaysPick from "@/features/home/views/todays-pick/TodaysPick.vue";

const isLoaded = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true;
  });
});
</script>

<template>
  <div
    class="font-body relative min-h-screen bg-stone-50 text-stone-800"
    :class="{ 'opacity-0': !isLoaded, 'opacity-100': isLoaded }"
    style="transition: opacity 0.6s ease-out"
  >
    <DefaultLayout>
      <Hero />

      <Categories />

      <FeaturedRecipes />

      <TodaysPick />

      <Testimonials />

      <NewsletterCTA />
    </DefaultLayout>
  </div>
</template>
