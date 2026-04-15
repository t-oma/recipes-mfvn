<script setup lang="ts">
import Copyright from "./Copyright.vue";
import FooterNav from "./FooterNav.vue";
import Socials from "./Socials.vue";
</script>

<template>
  <footer class="border-t border-stone-200 bg-stone-900 py-8 text-stone-400">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid gap-12 md:grid-cols-3">
        <div class="md:col-span-1">
          <div class="flex items-center gap-2">
            <div
              class="bg-terracotta flex h-10 w-10 items-center justify-center rounded-xl"
            >
              <span class="text-lg text-white">🍳</span>
            </div>
            <span class="font-display text-2xl font-semibold text-white">
              Savory
            </span>
          </div>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
            Your trusted companion on culinary adventures. Delicious recipes for
            every day.
          </p>
        </div>

        <FooterNav />
        <Socials />
      </div>

      <Copyright />
    </div>
  </footer>
</template>
