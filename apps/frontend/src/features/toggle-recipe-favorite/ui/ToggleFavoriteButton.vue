<script setup lang="ts">
import { useAddFavorite } from "../api/useAddFavorite";
import { useRemoveFavorite } from "../api/useRemoveFavorite";

const {
  recipeId,
  isFavorited: active = false,
  total = 0,
  canFavorite = false,
} = defineProps<{
  recipeId: string;
  isFavorited?: boolean;
  total?: number;
  canFavorite?: boolean;
}>();

const { mutate: addFavorite, isPending: isAddPending } = useAddFavorite();
const { mutate: removeFavorite, isPending: isRemovePending } =
  useRemoveFavorite();

function handleClick() {
  active ? removeFavorite(recipeId) : addFavorite(recipeId);
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
    :label="`${active ? 'Saved' : 'Save'} (${total})`"
    :icon="`pi ${active ? 'pi-bookmark-fill' : 'pi-bookmark'}`"
    :disabled="!canFavorite || isAddPending || isRemovePending"
    @click="handleClick"
  />
</template>
