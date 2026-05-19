<script setup lang="ts">
import { AppFooter } from "@/widgets/footer";
import { AppHeader } from "@/widgets/header";
</script>

<template>
  <AppHeader />

  <slot />

  <AppFooter />
</template>
