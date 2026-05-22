<script setup lang="ts">
import { ref } from "vue";
import AuthPageShell from "@/features/auth/ui/AuthPageShell.vue";

definePage({
  meta: {
    layout: "no-layout",
  },
});

const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);

function onSubmit() {
  // TODO: integrate register mutation
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 1200);
}
</script>

<template>
  <AuthPageShell
    title="Create account"
    description="Let's get you started with your new account."
    aside-title="Start your cooking journey"
    aside-text="Join thousands of home cooks discovering new recipes every day."
    image-src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1010&auto=format&fit=crop"
    image-alt="Avocado and Egg Toast"
  >
    <form class="space-y-5" @submit.prevent="onSubmit">
      <div>
        <label
          for="register-name"
          class="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Full Name
        </label>

        <div class="relative">
          <i
            class="pi pi-user absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            id="register-name"
            v-model="name"
            type="text"
            required
            minlength="2"
            maxlength="100"
            autocomplete="name"
            placeholder="Jane Doe"
            class="focus:border-terracotta focus:ring-terracotta/20 w-full rounded-xl border border-stone-200 bg-white py-3 pr-4 pl-10 text-sm text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label
          for="register-email"
          class="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Email
        </label>

        <div class="relative">
          <i
            class="pi pi-envelope absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            id="register-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="focus:border-terracotta focus:ring-terracotta/20 w-full rounded-xl border border-stone-200 bg-white py-3 pr-4 pl-10 text-sm text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label
          for="register-password"
          class="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Password
        </label>

        <div class="relative">
          <i
            class="pi pi-lock absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            id="register-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            autocomplete="new-password"
            placeholder="••••••••"
            class="focus:border-terracotta focus:ring-terracotta/20 w-full rounded-xl border border-stone-200 bg-white py-3 pr-10 pl-10 text-sm text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:ring-2"
          />
          <button
            type="button"
            class="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            :aria-pressed="showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <i
              :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
              aria-hidden="true"
            />
          </button>
        </div>
        <p class="mt-1.5 text-xs text-stone-500">
          Must be at least 6 characters
        </p>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="bg-terracotta shadow-terracotta/25 hover:bg-terracotta-dark flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
      >
        <i v-if="isLoading" class="pi pi-spinner pi-spin" aria-hidden="true" />
        <span>
          {{ isLoading ? "Creating account..." : "Create Account" }}
        </span>
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-stone-500">
      Already have an account?
      <RouterLink
        to="/login"
        class="text-terracotta hover:text-terracotta-dark font-semibold transition-colors"
      >
        Sign in
      </RouterLink>
    </p>
  </AuthPageShell>
</template>
