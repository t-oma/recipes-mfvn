<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { recipeCommentListOptions } from "@/entities/recipe-comment/api/comment.queries";
import CommentCard from "@/entities/recipe-comment/ui/CommentCard.vue";

const props = defineProps<{
  recipeId: string;
  canComment?: boolean;
}>();

const {
  data: comments,
  isPending,
  error,
} = useQuery(recipeCommentListOptions(props.recipeId, { limit: 10 }));
</script>

<template>
  <section class="space-y-4 border-t border-stone-200">
    <div class="flex items-center gap-4">
      <h2 class="font-display text-2xl font-bold tracking-tight text-stone-900">
        Comments
      </h2>
      <span class="text-sm text-stone-500">
        ({{ comments?.items.length ?? 0 }})
      </span>
    </div>

    <div v-if="isPending" class="space-y-4">
      <div
        v-for="n in 3"
        :key="n"
        class="rounded-2xl border border-stone-200 p-4"
      >
        <div class="mb-3 flex items-center gap-3">
          <Skeleton shape="circle" class="h-10! w-10!" />
          <div class="space-y-2">
            <Skeleton class="h-3 w-28!" />
            <Skeleton class="h-3 w-20!" />
          </div>
        </div>

        <div class="space-y-2">
          <Skeleton class="h-3 w-full!" />
          <Skeleton class="h-3 w-11/12!" />
          <Skeleton class="h-3 w-8/12!" />
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      Failed to load comments
    </div>

    <div
      v-else-if="!comments?.items.length"
      class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 text-center"
    >
      <p class="font-medium text-stone-700">No comments yet</p>
      <p class="mt-1 text-sm text-stone-500">
        Be the first to share your thoughts about this recipe.
      </p>
    </div>

    <div v-else class="space-y-4">
      <CommentCard
        v-for="comment in comments.items"
        :key="comment.id"
        :comment="comment"
      />
    </div>
  </section>
</template>
