<script setup lang="ts">
import AppLogo from "@/shared/ui/AppLogo.vue";
import FooterSocials from "./ui/FooterSocials.vue";
</script>

<template>
  <footer class="border-t border-stone-200 bg-stone-900 py-8 text-stone-400">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid gap-12 md:grid-cols-3">
        <div class="md:col-span-1">
          <AppLogo theme="dark" />

          <p class="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
            Your trusted companion on culinary adventures. Delicious recipes for
            every day.
          </p>
        </div>

        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-white">Recipes</h4>
          <ul class="grid grid-cols-2 gap-3 text-sm">
            <li>
              <a href="#" class="transition-colors hover:text-white">
                Breakfast
              </a>
            </li>
            <li>
              <a href="#" class="transition-colors hover:text-white"> Lunch </a>
            </li>
            <li>
              <a href="#" class="transition-colors hover:text-white">
                Dinner
              </a>
            </li>
            <li>
              <a href="#" class="transition-colors hover:text-white">
                Desserts
              </a>
            </li>
          </ul>
        </div>

        <FooterSocials />
      </div>

      <div
        class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-800 pt-8 text-sm md:flex-row"
      >
        <p>&copy; 2026 Savory. All rights reserved.</p>
        <div class="flex gap-6">
          <a href="#" class="transition-colors hover:text-white">
            Privacy Policy
          </a>
          <a href="#" class="transition-colors hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
