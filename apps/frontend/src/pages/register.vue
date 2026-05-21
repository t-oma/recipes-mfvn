<script setup lang="ts">
import { ref } from "vue";
import AppLogo from "@/shared/ui/AppLogo.vue";

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
  <main class="flex min-h-screen bg-stone-50">
    <!-- Left side: image & brand -->
    <div class="relative hidden w-1/3 sm:block lg:w-1/2">
      <img
        src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1010&auto=format&fit=crop"
        alt="Food"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-stone-900/50" />
      <div class="relative flex h-full flex-col justify-between p-12">
        <AppLogo theme="dark" />
        <div>
          <h2 class="font-display text-4xl leading-tight font-bold text-white">
            Start your<br />cooking journey
          </h2>
          <p class="mt-4 max-w-xs text-lg leading-relaxed text-white/80">
            Join thousands of home cooks discovering new recipes every day.
          </p>
        </div>
        <p class="text-sm text-white/60">
          &copy; {{ new Date().getFullYear() }} Savory
        </p>
      </div>
    </div>

    <!-- Right side: form -->
    <div
      class="flex w-full flex-col justify-center px-6 py-12 sm:w-2/3 sm:px-10 md:px-12 lg:w-1/2 lg:px-16 xl:px-24"
    >
      <div class="mx-auto w-full max-w-sm">
        <div class="mb-8">
          <h1
            class="font-display text-3xl font-bold tracking-tight text-stone-900"
          >
            Create account
          </h1>
          <p class="mt-2 text-stone-500">
            Let's get you started with your new account.
          </p>
        </div>

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
              />
              <input
                id="register-name"
                v-model="name"
                type="text"
                required
                minlength="2"
                maxlength="100"
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
              />
              <input
                id="register-email"
                v-model="email"
                type="email"
                required
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
              />
              <input
                id="register-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="••••••••"
                class="focus:border-terracotta focus:ring-terracotta/20 w-full rounded-xl border border-stone-200 bg-white py-3 pr-10 pl-10 text-sm text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:ring-2"
              />
              <button
                type="button"
                class="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" />
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
            <i v-if="isLoading" class="pi pi-spinner pi-spin" />
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

        <div class="mt-8">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
          >
            <i class="pi pi-arrow-left" />
            Back to home
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
