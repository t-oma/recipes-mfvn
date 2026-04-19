<script setup lang="ts">
import { onMounted, ref } from "vue";
import DefaultLayout from "@/common/ui/DefaultLayout.vue";
import Section from "@/common/ui/section/Section.vue";
import SectionHeader from "@/common/ui/section/SectionHeader.vue";
import { useCategories } from "@/features/categories/categories.queries";
import CategoriesGrid from "@/features/categories/views/CategoriesGrid.vue";
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

const {
  data: categories,
  isLoading,
  error,
} = useCategories({ sort: "-recipeCount" });
</script>

<template>
  <div
    class="font-body relative min-h-screen bg-stone-50 text-stone-800"
    :class="{ 'opacity-0': !isLoaded, 'opacity-100': isLoaded }"
    style="transition: opacity 0.6s ease-out"
  >
    <DefaultLayout>
      <Hero />

      <Section id="categories" bg="bg-white">
        <SectionHeader
          title="Pick a direction"
          subtitle="Recipe Categories"
          :link="{
            to: '#',
            text: 'All categories',
          }"
        />

        <CategoriesGrid :categories :isLoading :error />
      </Section>

      <Section id="featured-recipes" bg="bg-stone-50">
        <FeaturedRecipes />
      </Section>

      <Section id="todays-pick" bg="bg-white">
        <TodaysPick />
      </Section>

      <Section id="testimonials" bg="bg-stone-50">
        <Testimonials />
      </Section>

      <Section id="newsletter" bg="bg-white">
        <NewsletterCTA />
      </Section>
    </DefaultLayout>
  </div>
</template>
