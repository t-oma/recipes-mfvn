<script setup lang="ts">
import type { CommentDetails } from "@recipes/shared/comments";

const props = defineProps<{
  comment: Omit<CommentDetails, "recipe">;
}>();
</script>

<template>
  <Card :pt="{ header: { class: 'p-3 pb-0' } }">
    <template #header>
      <div class="flex items-center gap-3">
        <Avatar
          :label="comment.author.name.charAt(0)"
          size="small"
          shape="circle"
          class="bg-stone-200 text-stone-700"
        />
        <div>
          <p class="text-sm font-semibold text-stone-800">
            {{ comment.author.name }}
          </p>
          <p class="text-xs text-stone-400">
            {{ new Date(comment.createdAt).toLocaleDateString() }}
          </p>
        </div>
      </div>
    </template>

    <template #content>
      <p class="pl-10 text-sm leading-relaxed text-stone-600">
        {{ comment.text }}
      </p>
    </template>
  </Card>
</template>
