<script setup lang="ts">
import {
  useCurrentUser,
  useLogoutMutation,
} from "@/features/auth/api/auth.queries";
import SignedIn from "@/features/auth/ui/SignedIn.vue";
import SignedOut from "@/features/auth/ui/SignedOut.vue";
import AppLogo from "@/shared/ui/AppLogo.vue";

const { data: user } = useCurrentUser();
const { mutate: logout } = useLogoutMutation();
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl"
  >
    <div class="mx-auto max-w-7xl px-6 py-4 lg:px-8">
      <div class="flex items-center justify-between">
        <AppLogo />

        <nav class="hidden md:block">
          <ul class="flex items-center gap-8">
            <li>
              <a
                href="#recipes"
                class="hover:text-terracotta text-sm font-medium text-stone-600 transition-colors"
              >
                Recipes
              </a>
            </li>
            <li>
              <a
                href="#categories"
                class="hover:text-terracotta text-sm font-medium text-stone-600 transition-colors"
              >
                Categories
              </a>
            </li>
            <li>
              <a
                href="#about"
                class="hover:text-terracotta text-sm font-medium text-stone-600 transition-colors"
              >
                About
              </a>
            </li>
          </ul>
        </nav>

        <div class="flex items-center gap-3">
          <SignedIn>
            <span class="text-sm font-medium text-stone-700">
              {{ user?.name }}
            </span>
            <button
              type="button"
              class="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:shadow-md"
              @click="() => logout()"
            >
              Log out
            </button>
          </SignedIn>

          <SignedOut>
            <RouterLink
              to="/login"
              class="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:shadow-md"
            >
              Sign In
            </RouterLink>
          </SignedOut>

          <button
            type="button"
            class="bg-terracotta shadow-terracotta/25 hover:bg-terracotta-dark hover:shadow-terracotta/30 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl"
          >
            Add Recipe
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
