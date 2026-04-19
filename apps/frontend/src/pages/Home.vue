<script setup lang="ts">
import { onMounted, ref } from "vue";
import DefaultLayout from "@/common/ui/DefaultLayout.vue";
import Section from "@/common/ui/Section.vue";
import SectionHeader from "@/common/ui/SectionHeader.vue";
import Testimonial from "@/common/ui/Testimonial.vue";
import { useCategories } from "@/features/categories/categories.queries";
import CategoriesGrid from "@/features/categories/views/CategoriesGrid.vue";
import FeaturedRecipe from "./_home/featured-recipes/FeaturedRecipe.vue";
import Hero from "./_home/hero/Hero.vue";
import NewsletterCTA from "./_home/NewsletterCTA.vue";
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

const featuredRecipes = [
  {
    id: 1,
    title: "Classic Beef Bourguignon",
    time: "2 hr",
    difficulty: "Medium",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&h=400&fit=crop",
    tag: "Classic",
  },
  {
    id: 2,
    title: "Cherry Dumplings",
    time: "1.5 hr",
    difficulty: "Easy",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=400&fit=crop",
    tag: "Popular",
  },
  {
    id: 3,
    title: "Lemon Ricotta Pancakes",
    time: "30 min",
    difficulty: "Easy",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop",
    tag: "Quick",
  },
  {
    id: 4,
    title: "Stuffed Bell Peppers",
    time: "2.5 hr",
    difficulty: "Medium",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
    tag: "Hearty",
  },
];

const testimonials = [
  {
    text: "Best recipe site ever! The beef stew turned out even better than my grandmother's.",
    author: "Elena K.",
    role: "Home Cook",
  },
  {
    text: "So easy to find recipes here. Step-by-step instructions are a real find for beginners.",
    author: "Andrew M.",
    role: "Beginner Chef",
  },
  {
    text: "Dumplings, buns, fritters — everything in one place. Thanks for such a collection!",
    author: "Maria S.",
    role: "Food Enthusiast",
  },
];
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
        <SectionHeader
          title="Popular dishes"
          subtitle="Featured Recipes"
          :link="{
            to: '#',
            text: 'All recipes',
          }"
        />

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeaturedRecipe
            v-for="recipe in featuredRecipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>
      </Section>

      <Section id="todays-pick" bg="bg-white">
        <TodaysPick />
      </Section>

      <Section id="testimonials" bg="bg-stone-50">
        <SectionHeader
          title="Reviews"
          subtitle="What Cooks Say"
          align="center"
        />

        <div class="grid gap-6 md:grid-cols-3">
          <Testimonial
            v-for="(testimonial, index) in testimonials"
            :key="index"
            :text="testimonial.text"
            :author="testimonial.author"
            :role="testimonial.role"
          />
        </div>
      </Section>

      <Section id="newsletter" bg="bg-white">
        <NewsletterCTA />
      </Section>
    </DefaultLayout>
  </div>
</template>
