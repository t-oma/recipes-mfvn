<script setup lang="ts">
import type { FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { createCommentInputSchema, MAX_COMMENT_LENGTH } from "@recipes/shared";
import { reactive, ref } from "vue";

const { loading = false, canComment = false } = defineProps<{
  loading?: boolean;
  canComment?: boolean;
}>();

const resolver = zodResolver(createCommentInputSchema);
const initialValues = reactive({ text: "" });

const comment = ref("");

function onSubmit({ valid, values }: FormSubmitEvent) {}

function onReset() {
  comment.value = "";
}
</script>

<template>
  <Form
    :resolver
    :initial-values
    class="rounded-xl bg-white p-4 shadow"
    @submit="onSubmit"
    @reset="onReset"
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
          v-model="comment"
          id="comment-text"
          rows="2"
          auto-resize
          :disabled="loading || !canComment"
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
          {{ comment.trim().length }}/{{ MAX_COMMENT_LENGTH }}
        </span>
      </div>

      <div class="flex items-center justify-end gap-3">
        <Button
          type="reset"
          label="Clear"
          severity="secondary"
          :disabled="!comment.length || loading"
        />

        <Button
          type="submit"
          label="Post comment"
          :loading="loading"
          :disabled="loading || !canComment"
        />
      </div>

      <p v-if="!canComment" class="text-sm text-stone-500">
        Log in to post a comment.
      </p>
    </div>
  </Form>
</template>
