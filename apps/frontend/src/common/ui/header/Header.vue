<script setup lang="ts">
import HeaderNav from "./HeaderNav.vue";
import HeaderUser from "./HeaderUser.vue";
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl"
  >
    <div class="mx-auto max-w-7xl px-6 py-4 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="from-terracotta to-terracotta-dark shadow-terracotta/20 flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br shadow-lg"
          >
            <span class="text-lg text-white">🍳</span>
          </div>
          <span
            class="font-display text-2xl font-semibold tracking-tight text-stone-900"
          >
            Savory
          </span>
        </div>

        <HeaderNav />

        <HeaderUser />
      </div>
    </div>
  </header>
</template>
