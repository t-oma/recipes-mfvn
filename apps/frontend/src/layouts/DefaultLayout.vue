<script setup lang="ts">
import Footer from "@/shared/ui/Footer.vue";
import Header from "@/shared/ui/Header.vue";
</script>

<template>
  <Header />

  <slot />

  <Footer />
</template>
