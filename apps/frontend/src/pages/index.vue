<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { CategoryCard, categoryListOptions } from "@/entities/category";
import { RecipeCard, recipeListOptions } from "@/entities/recipe";
import { ReviewCard, testimonialsOptions } from "@/entities/review";
import { useAuthStore } from "@/features/auth";
import { ToggleFavoriteButton } from "@/features/toggle-recipe-favorite";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import WidthContainer from "@/shared/ui/WidthContainer.vue";
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

const authStore = useAuthStore();
</script>

<template>
  <main>
    <HomeHero />

    <WidthContainer id="categories" class="bg-white py-12 lg:py-20">
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
    </WidthContainer>

    <WidthContainer id="featured-recipes" class="bg-stone-50 py-12 lg:py-20">
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
        >
          <template #header-actions>
            <div class="flex items-center justify-end gap-2">
              <ToggleFavoriteButton
                :recipe-id="recipe.id"
                :is-favorited="recipe.isFavorited"
                :total="recipe.stats.favoritesCount"
                :can-favorite="authStore.isAuthenticated"
                variant="icon"
              />
            </div>
          </template>
        </RecipeCard>
      </div>
    </WidthContainer>

    <WidthContainer id="todays-pick" class="bg-white py-12 lg:py-20">
      <TodaysPick />
    </WidthContainer>

    <WidthContainer id="testimonials" class="bg-stone-50 py-12 lg:py-20">
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
    </WidthContainer>

    <WidthContainer id="newsletter" class="bg-white py-12 lg:py-20">
      <NewsletterCTA />
    </WidthContainer>
  </main>
</template>
