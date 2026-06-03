<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { recipeDetailsOptions } from "@/entities/recipe/api/recipe.queries";
import IngredientList from "@/entities/recipe/ui/IngredientList.vue";
import InstructionSteps from "@/entities/recipe/ui/InstructionSteps.vue";
import RecipeDescriptionList from "@/entities/recipe/ui/RecipeDescriptionList.vue";
import RecipeHeader from "@/entities/recipe/ui/RecipeHeader.vue";
import { useAuthStore } from "@/features/auth";
import { RateRecipeControl } from "@/features/rate-recipe";
import ToggleFavoriteButton from "@/features/toggle-recipe-favorite/ui/ToggleFavoriteButton.vue";
import WidthContainer from "@/shared/ui/WidthContainer.vue";
import { RecipeComments } from "@/widgets/recipe-comments";

definePage({
  meta: {
    layout: "default",
  },
});

function extractIdFromRef(ref: string): string {
  const idx = ref.indexOf("-");
  return idx === -1 ? ref : ref.slice(0, idx);
}

const route = useRoute();
const recipeId = extractIdFromRef(route.params.ref);

const {
  data: recipe,
  isPending,
  error,
} = useQuery(recipeDetailsOptions(recipeId));
const authStore = useAuthStore();
</script>

<template>
  <WidthContainer as="main">
    <div
      v-if="error"
      class="flex min-h-[calc(100vh-72px)] items-center justify-center"
    >
      <div class="py-10 text-center">
        <div
          class="from-terracotta/20 text-terracotta mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br to-amber-100 text-2xl"
        >
          <i class="pi pi-exclamation-circle" />
        </div>
        <h2 class="text-xl font-semibold text-stone-800">
          Failed to load recipe
        </h2>
        <p class="mt-2 text-stone-500">{{ error?.message }}</p>
        <Button as-child v-slot="slotProps" class="mt-6">
          <RouterLink to="/" :class="slotProps.class">
            Go back home
          </RouterLink>
        </Button>
      </div>
    </div>

    <template v-else>
      <RecipeHeader :recipe="recipe" :loading="isPending" />

      <div class="grid gap-8 pb-6 lg:grid-cols-[360px_1fr] lg:pb-10">
        <div class="space-y-6">
          <RecipeDescriptionList
            :cook-time="recipe?.cookingTime"
            :difficulty="recipe?.difficulty"
            :meal-type="recipe?.mealType"
            :servings="recipe?.servings"
            :cuisine="recipe?.cuisine"
            :loading="isPending"
          >
            <template #rating-control>
              <RateRecipeControl
                :recipe-id="recipeId"
                :average-rating="recipe?.stats.averageRating"
                :ratings-count="recipe?.stats.ratingCount"
                :user-rating="recipe?.userRating"
                :can-rate="authStore.isAuthenticated"
              />
            </template>
          </RecipeDescriptionList>

          <Skeleton v-if="isPending" height="6rem" class="lg:hidden" />
          <p v-else class="text-lg text-pretty lg:hidden">
            {{ recipe?.description }}
          </p>

          <div class="flex items-center gap-4">
            <ToggleFavoriteButton
              :recipe-id="recipeId"
              :is-favorited="recipe?.isFavorited"
              :total="recipe?.stats.favoritesCount"
              :can-favorite="authStore.isAuthenticated"
            />
            <Button as-child v-slot="slotProps" severity="secondary">
              <RouterLink to="#comments" :class="slotProps.class">
                <i class="pi pi-comment"></i>
                Comment ({{ recipe?.stats.commentsCount ?? 0 }})
              </RouterLink>
            </Button>
          </div>
        </div>

        <Skeleton v-if="isPending" height="6rem" class="hidden lg:inline" />
        <p v-else class="hidden text-lg text-pretty lg:inline">
          {{ recipe?.description }}
        </p>
      </div>

      <div class="grid gap-8 pb-6 lg:grid-cols-[360px_1fr] lg:pb-10">
        <IngredientList
          :ingredients="recipe?.ingredients"
          :servings="recipe?.servings"
          :loading="isPending"
        />

        <InstructionSteps
          :instructions="recipe?.instructions"
          :loading="isPending"
        />
      </div>

      <RecipeComments
        id="comments"
        :recipe-id="recipeId"
        :can-comment="authStore.isAuthenticated"
        class="py-6 lg:py-10"
      />
    </template>
  </WidthContainer>
</template>
