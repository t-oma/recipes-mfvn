<script setup lang="ts">
import { ref } from "vue";
import AuthPageShell from "@/features/auth/ui/AuthPageShell.vue";

definePage({
  meta: {
    layout: "no-layout",
  },
});

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);

function onSubmit() {
  // TODO: integrate login mutation
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 1200);
}
</script>

<template>
  <AuthPageShell
    title="Sign in"
    description="Welcome back! Please enter your details."
    aside-title="Welcome back, chef!"
    aside-text="Continue your culinary journey with step-by-step recipes and inspiration."
    image-src="https://plus.unsplash.com/premium_photo-1672153937750-9ea567e94026?q=80&w=987&auto=format&fit=crop"
    image-alt="A cooking scene with ingredients and kitchen tools"
  >
    <form class="space-y-5" @submit.prevent="onSubmit">
      <div>
        <label
          for="login-email"
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
            id="login-email"
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
          for="login-password"
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
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            autocomplete="current-password"
            placeholder="••••••••"
            class="focus:border-terracotta focus:ring-terracotta/20 w-full rounded-xl border border-stone-200 bg-white py-3 pr-10 pl-10 text-sm text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:ring-2"
          />
          <button
            type="button"
            class="absolute top-1/2 right-3 inline-flex -translate-y-1/2 items-center justify-center text-stone-400 hover:text-stone-600"
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
      </div>

      <div class="flex items-center justify-between">
        <label class="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            class="text-terracotta accent-terracotta focus:ring-terracotta h-4 w-4 rounded border-stone-300"
          />
          <span class="text-sm text-stone-600">Remember me</span>
        </label>

        <RouterLink
          to="#"
          class="text-terracotta hover:text-terracotta-dark text-sm font-medium transition-colors"
        >
          Forgot password?
        </RouterLink>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="bg-terracotta shadow-terracotta/25 hover:bg-terracotta-dark flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
      >
        <i v-if="isLoading" class="pi pi-spinner pi-spin" aria-hidden="true" />
        <span>{{ isLoading ? "Signing in..." : "Sign In" }}</span>
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-stone-500">
      Don't have an account?
      <RouterLink
        to="/register"
        class="text-terracotta hover:text-terracotta-dark font-semibold transition-colors"
      >
        Sign up
      </RouterLink>
    </p>
  </AuthPageShell>
</template>
