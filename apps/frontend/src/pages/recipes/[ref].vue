<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { recipeDetailsOptions } from "@/entities/recipe/api/recipe.queries";
import IngredientList from "@/entities/recipe/ui/IngredientList.vue";
import InstructionSteps from "@/entities/recipe/ui/InstructionSteps.vue";
import RecipeDescriptionList from "@/entities/recipe/ui/RecipeDescriptionList.vue";
import RecipeHeader from "@/entities/recipe/ui/RecipeHeader.vue";
import { useAuthStore } from "@/features/auth/model/auth.store";
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
const recipeRef = route.params.ref;
const recipeId = extractIdFromRef(recipeRef);

const {
  data: recipe,
  isLoading,
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
        <p class="mt-2 text-stone-500">{{ error.message }}</p>
        <Button label="Go back home" class="mt-6" as="RouterLink" to="/" />
      </div>
    </div>

    <template v-else>
      <RecipeHeader :recipe="recipe" :loading="isLoading" />

      <div class="grid gap-8 pb-6 lg:grid-cols-[320px_1fr] lg:pb-10">
        <div class="space-y-6">
          <RecipeDescriptionList
            :cook-time="recipe?.cookingTime"
            :difficulty="recipe?.difficulty"
            :meal-type="recipe?.mealType"
            :servings="recipe?.servings"
            :cuisine="recipe?.cuisine"
            :average-rating="recipe?.stats.averageRating"
            :can-rate="authStore.isAuthenticated"
            :loading="isPending"
          />

          <Skeleton v-if="isPending" class="h-20! lg:hidden!" />
          <p v-else class="text-lg text-pretty lg:hidden">
            {{ recipe?.description }}
          </p>

          <div class="flex items-center gap-4">
            <Button
              v-tooltip.top="{
                value:
                  '<span class=\'underline\'>Log in</span> or <span class=\'underline\'>sign up</span> to save recipes',
                class: 'text-xs text-pretty text-center',
                showDelay: 300,
                hideDelay: 300,
                disabled: authStore.isAuthenticated,
                escape: false,
              }"
              :label="`${recipe?.isFavorited ? 'Saved' : 'Save'} (${recipe?.stats.favoritesCount ?? 0})`"
              :icon="`pi ${recipe?.isFavorited ? 'pi-bookmark-fill' : 'pi-bookmark'}`"
              :disabled="!authStore.isAuthenticated"
            />
            <Button
              v-tooltip.top="{
                value:
                  '<span class=\'underline\'>Log in</span> or <span class=\'underline\'>sign up</span> to comment on recipes',
                class: 'text-xs text-pretty text-center',
                showDelay: 300,
                hideDelay: 300,
                disabled: authStore.isAuthenticated,
                escape: false,
              }"
              :label="`Comment (${recipe?.stats.commentsCount ?? 0})`"
              icon="pi pi-comment"
              severity="secondary"
              :disabled="!authStore.isAuthenticated"
            />
          </div>
        </div>

        <Skeleton v-if="isPending" class="hidden! h-20! lg:block!" />
        <p v-else class="hidden text-lg text-pretty lg:block">
          {{ recipe?.description }}
        </p>
      </div>

      <div class="grid gap-8 pb-6 lg:grid-cols-[320px_1fr] lg:pb-10">
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
        :recipe-id="recipeId"
        :can-comment="authStore.isAuthenticated"
        class="py-6 lg:py-10"
      />
    </template>
  </WidthContainer>
</template>
