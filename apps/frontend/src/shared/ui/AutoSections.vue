<script setup lang="ts">
import WidthContainer from "./WidthContainer.vue";

type SectionConfig = { name: string; id?: string };
type Props = {
  sections: SectionConfig[];
  backgrounds?: string[];
};

const { sections, backgrounds = ["bg-white", "bg-stone-50"] } =
  defineProps<Props>();

function getBackground(index: number) {
  return backgrounds[index % backgrounds.length];
}
</script>

<template>
  <WidthContainer
    v-for="(section, index) in sections"
    :key="section.name"
    :id="section.id"
    class="py-12 lg:py-20"
    :class="getBackground(index)"
    as="section"
  >
    <slot v-if="!sections.length" />

    <slot v-else :name="section.name" />
  </WidthContainer>
</template>
