<script setup lang="ts">
import { recipeRatingInputSchema } from "@recipes/shared/recipe-rating";
import { computed } from "vue";
import { useRateRecipe } from "../api/useRateRecipe";
import { useRemoveRecipeRating } from "../api/useRemoveRecipeRating";

const {
  recipeId,
  userRating,
  averageRating,
  canRate = false,
} = defineProps<{
  recipeId: string;
  averageRating?: number | null;
  ratingsCount?: number | null;
  userRating?: number | null;
  canRate?: boolean;
}>();

const defaultRating = computed(() =>
  userRating != null ? userRating : (averageRating ?? 0),
);

const { mutate: rateRecipe, isPending: isRatePending } =
  useRateRecipe(recipeId);
const { mutate: removeRecipeRating, isPending: isRemovePending } =
  useRemoveRecipeRating(recipeId);

function handleRateRecipe(value: number) {
  if (!canRate || userRating === value) return;

  const result = recipeRatingInputSchema.safeParse({ value });
  if (!result.success) return;

  rateRecipe({ value });
}

function handleRemoveRecipeRating() {
  removeRecipeRating();
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="font-medium">
      {{ averageRating?.toFixed(1) ?? "0.0" }}
    </span>
    <Rating
      v-tooltip.top="{
        value:
          '<span class=\'underline\'>Log in</span> or <span class=\'underline\'>sign up</span> to rate recipes',
        class: 'text-xs text-pretty text-center',
        showDelay: 300,
        hideDelay: 300,
        disabled: canRate,
        escape: false,
      }"
      :defaultValue="defaultRating"
      :readonly="!canRate || isRatePending || isRemovePending"
      class="text-amber-400"
      @value-change="handleRateRecipe"
    />
    <span class="text-sm text-stone-500"> ({{ ratingsCount ?? 0 }}) </span>

    <Button
      v-if="userRating != null"
      icon="pi pi-times"
      severity="danger"
      variant="outlined"
      size="small"
      aria-label="Remove rating"
      :disabled="!canRate || isRatePending || isRemovePending"
      @click="handleRemoveRecipeRating"
      class="size-8"
    />
  </div>
</template>
