<script setup lang="ts">
import HeaderNav from "./_header/HeaderNav.vue";
import HeaderUser from "./_header/HeaderUser.vue";
import AppLogo from "./AppLogo.vue";
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl"
  >
    <div class="mx-auto max-w-7xl px-6 py-4 lg:px-8">
      <div class="flex items-center justify-between">
        <AppLogo />

        <HeaderNav />

        <HeaderUser />
      </div>
    </div>
  </header>
</template>
