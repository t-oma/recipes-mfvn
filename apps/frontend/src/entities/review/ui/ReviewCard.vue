<script setup lang="ts">
const props = defineProps<{
  text: string;
  author: string;
  rating: number;
}>();
</script>

<template>
  <Card>
    <template #content>
      <Rating :defaultValue="rating" class="mb-4" readonly />

      <p class="line-clamp-3 flex-1 leading-relaxed text-stone-700 italic">
        "{{ text }}"
      </p>
    </template>

    <template #footer>
      <div class="mt-2 flex items-center gap-3">
        <Avatar :label="author.charAt(0)" shape="circle" />

        <div class="">
          <p class="text-sm font-semibold text-stone-800">
            {{ author }}
          </p>
          <p class="text-xs text-stone-500">Verified Cook</p>
        </div>
      </div>
    </template>
  </Card>
</template>
