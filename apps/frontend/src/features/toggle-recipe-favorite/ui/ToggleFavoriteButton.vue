<script setup lang="ts">
import { computed } from "vue";
import { useAddFavorite } from "../api/useAddFavorite";
import { useRemoveFavorite } from "../api/useRemoveFavorite";

const {
  recipeId,
  isFavorited = false,
  total = 0,
  variant = "default",
  canFavorite = false,
} = defineProps<{
  recipeId: string;
  isFavorited?: boolean;
  total?: number;
  variant?: "default" | "icon";
  canFavorite?: boolean;
}>();

const { mutate: addFavorite, isPending: isAddPending } = useAddFavorite();
const { mutate: removeFavorite, isPending: isRemovePending } =
  useRemoveFavorite();

const isPending = computed(() => isAddPending.value || isRemovePending.value);
const isIconOnly = computed(() => variant === "icon");
const label = computed(() => `${isFavorited ? "Saved" : "Save"} (${total})`);

function handleClick() {
  isFavorited ? removeFavorite(recipeId) : addFavorite(recipeId);
}
</script>

<template>
  <Button
    v-tooltip.top="{
      value:
        '<span class=\'underline\'>Log in</span> or <span class=\'underline\'>sign up</span> to save recipes',
      class: 'text-xs text-pretty text-center',
      showDelay: 300,
      hideDelay: 300,
      disabled: canFavorite,
      escape: false,
    }"
    :label="isIconOnly ? undefined : label"
    :icon="`pi ${isFavorited ? 'pi-bookmark-fill' : 'pi-bookmark'}`"
    :disabled="!canFavorite || isPending"
    :rounded="isIconOnly"
    :aria-label="
      isFavorited ? 'Remove recipe from favorites' : 'Add recipe to favorites'
    "
    @click.stop="handleClick"
  />
</template>
