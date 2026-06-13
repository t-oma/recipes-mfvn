<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { CreateCommentInput } from "@recipes/shared/comments";
import {
  createCommentInputSchema,
  MAX_COMMENT_LENGTH,
} from "@recipes/shared/comments";
import { reactive } from "vue";
import { useCreateRecipeComment } from "../api/useCreateRecipeComment";

const { recipeId, canComment = false } = defineProps<{
  recipeId: string;
  canComment?: boolean;
}>();

const resolver = zodResolver(createCommentInputSchema);
const initialValues = reactive({ text: "" });

const {
  mutate: createComment,
  isPending,
  isError,
} = useCreateRecipeComment(recipeId);

function onSubmit({ valid, values, reset }: FormSubmitEvent) {
  if (!valid || !canComment) return;

  createComment(
    {
      text: (values as CreateCommentInput).text.trim(),
    },
    {
      onSuccess: () => {
        reset();
      },
    },
  );
}
</script>

<template>
  <Form
    v-slot="$form"
    :resolver
    :initial-values
    class="rounded-xl bg-white p-4 shadow"
    @submit="onSubmit"
  >
    <div class="space-y-3">
      <FormField v-slot="$field" name="text" class="flex flex-col">
        <label
          for="comment-text"
          class="mb-1.5 block text-sm font-medium text-stone-800"
        >
          Add a comment
        </label>

        <Textarea
          id="comment-text"
          rows="2"
          auto-resize
          :disabled="isPending || !canComment"
          placeholder="Share what you liked, what you changed, or a helpful tip"
        />

        <Message
          v-if="$field?.invalid"
          severity="error"
          size="small"
          variant="simple"
          class="pt-1"
        >
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <div class="flex items-start justify-between gap-3">
        <p class="text-xs text-stone-500">
          Be kind and keep it useful for other cooks.
        </p>

        <span class="shrink-0 text-xs text-stone-400">
          {{ $form.text?.value?.trim?.().length ?? 0 }}/{{ MAX_COMMENT_LENGTH }}
        </span>
      </div>

      <div class="flex items-center justify-end gap-3">
        <Button
          type="reset"
          label="Clear"
          severity="secondary"
          :disabled="!($form.text?.value?.trim?.().length ?? 0) || isPending"
        />

        <Button
          type="submit"
          label="Post comment"
          :loading="isPending"
          :disabled="isPending || !canComment"
        />
      </div>

      <Message v-if="isError" severity="error" size="small">
        Failed to post comment. Please try again.
      </Message>

      <p v-if="!canComment" class="text-sm text-stone-500">
        Log in to post a comment.
      </p>
    </div>
  </Form>
</template>
