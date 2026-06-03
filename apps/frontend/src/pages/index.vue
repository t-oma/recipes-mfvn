<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { CategoryCard, categoryListOptions } from "@/entities/category";
import { recipeListOptions } from "@/entities/recipe/api/recipe.queries";
import RecipeCard from "@/entities/recipe/ui/RecipeCard.vue";
import { testimonialsOptions } from "@/entities/review/api/review.queries";
import ReviewCard from "@/entities/review/ui/ReviewCard.vue";
import Section from "@/shared/ui/Section.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import { HomeHero } from "@/widgets/home-hero";
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

const POPULAR_RECIPES_LIMIT = 4;
const {
  data: popularRecipes,
  isLoading: isPopularRecipesLoading,
  error: popularRecipesError,
} = useQuery(
  recipeListOptions({ sort: "-popularity", limit: POPULAR_RECIPES_LIMIT }),
);
</script>

<template>
  <main>
    <HomeHero />

    <Section id="categories" bg="bg-white">
      <SectionHeader
        title="Pick a direction"
        subtitle="Recipe Categories"
        :link="{
          to: '#',
          label: 'All categories',
        }"
      />

      <div
        v-if="isCategoriesLoading"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        <div
          v-for="n in CATEGORIES_LIMIT"
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
          label: 'All recipes',
        }"
      />
      <div
        v-if="isPopularRecipesLoading"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="n in POPULAR_RECIPES_LIMIT"
          :key="n"
          class="aspect-3/4 animate-pulse overflow-hidden rounded-2xl bg-stone-200"
        />
      </div>

      <p
        v-else-if="popularRecipesError"
        class="text-sm font-semibold text-stone-500"
      >
        {{ popularRecipesError.message }}
      </p>

      <div
        v-else-if="popularRecipes"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <RecipeCard
          v-for="recipe in popularRecipes.items"
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
        <Avatar
          icon="pi pi-comment"
          size="xlarge"
          shape="circle"
          class="from-terracotta/20! text-terracotta! mb-4 bg-linear-to-br! to-amber-100! text-2xl"
        />

        <h3 class="text-xl font-semibold text-stone-800">No reviews yet</h3>
        <p class="mt-2 text-stone-500">
          Be the first to share your cooking experience!
        </p>

        <Button
          label="Write a Review"
          icon="pi pi-pen-to-square"
          severity="contrast"
          class="mt-6"
        />
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
