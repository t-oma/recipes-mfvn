<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { categoryListOptions } from "@/entities/category/api/category.queries";
import CategoryCard from "@/entities/category/ui/CategoryCard.vue";
import { testimonialsOptions } from "@/entities/review/api/review.queries";
import ReviewCard from "@/entities/review/ui/ReviewCard.vue";
import Section from "@/shared/ui/Section.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import FeaturedRecipe from "./_index/featured-recipes/FeaturedRecipe.vue";
import Hero from "./_index/Hero.vue";
import NewsletterCTA from "./_index/NewsletterCTA.vue";
import TodaysPick from "./_index/TodaysPick.vue";

definePage({
  meta: {
    layout: "default",
  },
});

const CATEGORIES_LIMIT = 6;
const {
  data: categories,
  isLoading: isCategoriesLoading,
  error: categoriesError,
} = useQuery(
  categoryListOptions({ sort: "-recipeCount", limit: CATEGORIES_LIMIT }),
);

const { data: testimonials, isLoading: isTestimonialsLoading } = useQuery(
  testimonialsOptions(),
);

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
</script>

<template>
  <main>
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

      <div
        v-if="isCategoriesLoading"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="aspect-3/4 animate-pulse overflow-hidden rounded-2xl bg-stone-200"
        />
      </div>

      <p
        v-else-if="categoriesError"
        class="text-sm font-semibold text-stone-500"
      >
        {{ categoriesError.message }}
      </p>

      <div
        v-else-if="categories"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        <CategoryCard
          v-for="category in categories.items"
          :key="category.id"
          :category
        />
      </div>
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
      <SectionHeader title="Reviews" subtitle="What Cooks Say" align="center" />

      <div v-if="isTestimonialsLoading" class="grid gap-6 md:grid-cols-3">
        <div
          v-for="n in 3"
          :key="n"
          class="h-64 animate-pulse rounded-2xl bg-stone-200"
        />
      </div>

      <div
        v-else-if="!testimonials?.length"
        class="rounded-2xl border border-stone-100 bg-white p-12 text-center shadow-sm"
      >
        <div
          class="from-terracotta/20 text-terracotta mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br to-amber-100 text-2xl"
        >
          <i class="pi pi-comment" />
        </div>
        <h3 class="text-xl font-semibold text-stone-800">No reviews yet</h3>
        <p class="mt-2 text-stone-500">
          Be the first to share your cooking experience!
        </p>
        <button
          type="button"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-stone-800"
        >
          <i class="pi pi-pen-to-square" />
          Write a Review
        </button>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-3">
        <ReviewCard
          v-for="review in testimonials"
          :key="review.id"
          :text="review.text"
          :author="review.author.name"
          :rating="review.rating"
        />
      </div>
    </Section>

    <Section id="newsletter" bg="bg-white">
      <NewsletterCTA />
    </Section>
  </main>
</template>
