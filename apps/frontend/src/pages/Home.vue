<script setup lang="ts">
import { onMounted, ref } from "vue";
import DefaultLayout from "@/common/ui/DefaultLayout.vue";
import Section from "@/common/ui/Section.vue";
import SectionHeader from "@/common/ui/SectionHeader.vue";
import { useCategories } from "@/features/categories/categories.queries";
import CategoriesGrid from "@/features/categories/views/CategoriesGrid.vue";
import FeaturedRecipes from "./_home/featured-recipes/FeaturedRecipes.vue";
import Hero from "./_home/hero/Hero.vue";
import NewsletterCTA from "./_home/NewsletterCTA.vue";
import Testimonials from "./_home/Testimonials.vue";
import TodaysPick from "./_home/TodaysPick.vue";

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
