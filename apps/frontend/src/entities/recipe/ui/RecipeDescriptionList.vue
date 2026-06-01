<script setup lang="ts">
import AppLink from "@/shared/ui/AppLink.vue";

const { allowRating = false, loading = false } = defineProps<{
  cookTime?: number | null;
  difficulty?: string | null;
  mealType?: string | null;
  servings?: number | null;
  cuisine?: {
    name: string;
    slug: string;
  } | null;
  averageRating?: number | null;
  allowRating?: boolean;
  loading?: boolean;
}>();
</script>

<template>
  <dl class="grid grid-cols-[120px_1fr] gap-3 pl-0.5">
    <!-- Loading -->
    <template v-if="loading">
      <template
        v-for="label in [
          'Cook Time',
          'Difficulty',
          'Meal Type',
          'Servings',
          'Cuisine',
          'Rating',
        ]"
        :key="label"
      >
        <dt class="font-semibold">{{ label }}</dt>
        <dd class=""><Skeleton width="70%" /></dd>
      </template>
    </template>

    <template v-else>
      <dt class="font-semibold">Cook Time</dt>
      <dd class="">
        <template v-if="cookTime != null"> {{ cookTime }} minutes </template>

        <span v-else class="text-stone-500"> Unknown </span>
      </dd>

      <dt class="font-semibold">Difficulty</dt>
      <dd class="">
        <AppLink
          v-if="difficulty"
          :to="`/recipes?difficulty=${difficulty}`"
          class="hover:text-terracotta capitalize underline transition-colors"
        >
          {{ difficulty }}
        </AppLink>

        <span v-else class="text-stone-500"> Unknown </span>
      </dd>

      <dt class="font-semibold">Meal Type</dt>
      <dd class="">
        <AppLink
          v-if="mealType"
          :to="`/recipes?mealType=${mealType}`"
          class="hover:text-terracotta capitalize underline transition-colors"
        >
          {{ mealType }}
        </AppLink>

        <span v-else class="text-stone-500"> Unknown </span>
      </dd>

      <dt class="font-semibold">Servings</dt>
      <dd class="">
        <template v-if="servings != null"> {{ servings }} portions </template>

        <span v-else class="text-stone-500"> Unknown </span>
      </dd>

      <dt class="font-semibold">Cuisine</dt>
      <dd class="">
        <AppLink
          v-if="cuisine"
          :to="`/recipes?cuisine=${cuisine.slug}`"
          class="hover:text-terracotta underline transition-colors"
        >
          {{ cuisine.name }}
        </AppLink>

        <span v-else class="text-stone-500"> Unknown </span>
      </dd>

      <dt class="font-semibold">Rating</dt>
      <dd class="flex items-center gap-2">
        <span class="font-medium">{{ averageRating ?? 0 }}</span>
        <Rating
          v-tooltip.top="{
            value:
              '<span class=\'underline\'>Log in</span> or <span class=\'underline\'>sign up</span> to rate recipes',
            class: 'text-xs text-pretty text-center',
            showDelay: 300,
            hideDelay: 300,
            disabled: allowRating,
            escape: false,
          }"
          :defaultValue="averageRating ?? 0"
          :readonly="!allowRating"
          class="text-amber-400"
        />
      </dd>
    </template>
  </dl>
</template>
