<script setup lang="ts">
import { APP_NAME } from "@/shared";
import AppLogo from "@/shared/ui/AppLogo.vue";

const {
  title,
  description,
  imageSrc,
  imageAlt,
  asideTitle,
  asideText,
  brandName = APP_NAME,
  asideDecorative = false,
} = defineProps<{
  title: string;
  description?: string;
  imageSrc: string;
  imageAlt?: string;
  asideTitle?: string;
  asideText?: string;
  brandName?: string;
  asideDecorative?: boolean;
}>();
</script>
<template>
  <main class="flex min-h-screen bg-stone-50">
    <aside
      v-if="imageSrc || asideTitle || asideText"
      class="relative hidden min-h-screen w-1/3 sm:block lg:w-1/2"
      :aria-hidden="asideDecorative ? 'true' : undefined"
    >
      <img
        :src="imageSrc"
        :alt="asideDecorative ? '' : imageAlt"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-stone-900/50" />

      <div class="relative flex h-full flex-col justify-between p-8 lg:p-12">
        <AppLogo theme="dark" />

        <section v-if="asideTitle || asideText" class="max-w-md">
          <h2
            v-if="asideTitle"
            class="font-display text-3xl leading-tight font-bold text-white lg:text-4xl"
          >
            {{ asideTitle }}
          </h2>

          <p
            v-if="asideText"
            class="mt-4 max-w-xs text-base leading-relaxed text-white/80 lg:text-lg"
          >
            {{ asideText }}
          </p>
        </section>

        <p class="text-sm text-white/60">
          &copy; {{ new Date().getFullYear() }} {{ brandName }}
        </p>
      </div>
    </aside>

    <section
      class="flex min-h-screen w-full items-center justify-center px-6 py-10 sm:w-2/3 sm:px-10 md:px-12 lg:w-1/2 lg:px-16 xl:px-24"
      aria-labelledby="auth-page-title"
    >
      <div class="w-full max-w-md">
        <header class="mb-8">
          <h1
            id="auth-page-title"
            class="font-display text-3xl font-bold tracking-tight text-stone-900"
          >
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="mt-2 text-sm leading-6 text-stone-600 sm:text-base"
          >
            {{ description }}
          </p>
        </header>

        <slot />

        <slot name="bottom-nav">
          <div class="mt-8">
            <RouterLink
              to="/"
              class="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
            >
              <i class="pi pi-arrow-left" aria-hidden="true" />
              Back to home
            </RouterLink>
          </div>
        </slot>
      </div>
    </section>
  </main>
</template>
