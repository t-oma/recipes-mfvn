<script setup lang="ts">
import { onMounted, ref } from "vue";
import Footer from "@/common/ui/footer/Footer.vue";
import Header from "@/common/ui/header/Header.vue";
import NewsletterCTA from "@/common/ui/NewsletterCTA.vue";
import Testimonials from "@/common/ui/Testimonials.vue";
import TodaysPick from "@/common/ui/todays-pick/TodaysPick.vue";
import Categories from "@/features/home/views/categories/Categories.vue";
import FeaturedRecipes from "@/features/home/views/featured-recipes/FeaturedRecipes.vue";

const isLoaded = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true;
  });
});
</script>

<template>
  <div
    class="font-body min-h-screen bg-stone-50 text-stone-800"
    :class="{ 'opacity-0': !isLoaded, 'opacity-100': isLoaded }"
    style="transition: opacity 0.6s ease-out"
  >
    <!-- Decorative grain overlay -->
    <div class="pointer-events-none fixed inset-0 z-50 opacity-[0.03]">
      <div
        class="h-full w-full"
        style="
          background-image: url('&quot;data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E&quot');
        "
      />
    </div>

    <Header />

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-32">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <!-- Left: Text -->
          <div>
            <div
              class="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"
                />
                <span
                  class="relative inline-flex h-2 w-2 rounded-full bg-amber-500"
                />
              </span>
              Over 300+ tested recipes
            </div>

            <h1
              class="font-display text-5xl leading-[1.1] font-bold tracking-tight text-stone-900 lg:text-7xl"
            >
              Cook with
              <span class="relative inline-block">
                <span class="relative z-10">passion</span>
                <span
                  class="bg-terracotta/20 absolute -bottom-1 left-0 z-0 h-3 w-full lg:h-4"
                />
              </span>
              <br />
              every day
            </h1>

            <p
              class="mt-6 max-w-lg text-lg leading-relaxed text-stone-600 lg:text-xl"
            >
              Classic dishes and modern twists. Step-by-step recipes, helpful
              tips, and inspiration for your kitchen.
            </p>

            <div class="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                class="group flex items-center gap-3 rounded-2xl bg-stone-900 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-stone-900/20 transition-all hover:bg-stone-800 hover:shadow-2xl hover:shadow-stone-900/30"
              >
                Start Cooking
                <i
                  class="pi pi-arrow-right text-sm transition-transform group-hover:translate-x-1"
                />
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-7 py-4 text-base font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50"
              >
                <i class="pi pi-play-circle text-terracotta text-lg" />
                Watch Tour
              </button>
            </div>

            <!-- Social proof -->
            <div class="mt-12 flex items-center gap-6">
              <div class="flex -space-x-3">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-linear-to-br from-stone-200 to-stone-300 text-xs font-bold text-stone-600"
                >
                  {{ ["EK", "AM", "MS", "JP"][i - 1] }}
                </div>
              </div>
              <div>
                <div class="flex items-center gap-1">
                  <i
                    v-for="i in 5"
                    :key="i"
                    class="pi pi-star-fill text-xs text-amber-400"
                  />
                </div>
                <p class="mt-0.5 text-sm text-stone-500">
                  <span class="font-semibold text-stone-700">12,400+</span>
                  happy cooks
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Hero image collage -->
          <div class="relative">
            <div class="relative mx-auto max-w-lg lg:max-w-none">
              <!-- Main image -->
              <div
                class="relative overflow-hidden rounded-3xl shadow-2xl shadow-stone-900/15"
              >
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&h=800&fit=crop"
                  alt="Delicious dish"
                  class="h-105 w-full object-cover lg:h-130"
                />
                <div
                  class="absolute inset-0 bg-linear-to-t from-stone-900/30 to-transparent"
                />
                <div class="absolute right-6 bottom-6 left-6">
                  <div
                    class="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 backdrop-blur-md"
                  >
                    <i class="pi pi-star-fill text-sm text-amber-400" />
                    <span class="text-sm font-semibold text-stone-800"
                      >Recipe of the Day</span
                    >
                  </div>
                  <h3
                    class="font-display mt-2 text-2xl font-bold text-white drop-shadow-lg"
                  >
                    Braised Potatoes with Mushrooms
                  </h3>
                </div>
              </div>

              <!-- Floating card 1 -->
              <div
                class="absolute top-8 -left-6 hidden w-48 rounded-2xl border border-stone-100 bg-white p-4 shadow-xl shadow-stone-900/8 lg:block"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50"
                  >
                    <i class="pi pi-clock text-emerald-600" />
                  </div>
                  <div>
                    <p class="text-xs text-stone-500">Cook Time</p>
                    <p class="text-sm font-bold text-stone-800">45 minutes</p>
                  </div>
                </div>
              </div>

              <!-- Floating card 2 -->
              <div
                class="absolute -right-4 bottom-16 hidden w-52 rounded-2xl border border-stone-100 bg-white p-4 shadow-xl shadow-stone-900/8 lg:block"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50"
                  >
                    <i class="pi pi-heart-fill text-rose-500" />
                  </div>
                  <div>
                    <p class="text-xs text-stone-500">Saved by</p>
                    <p class="text-sm font-bold text-stone-800">2,847 people</p>
                  </div>
                </div>
              </div>

              <!-- Decorative elements -->
              <div
                class="bg-terracotta/8 absolute -top-8 -right-8 -z-10 h-72 w-72 rounded-full blur-3xl"
              />
              <div
                class="absolute -bottom-8 -left-8 -z-10 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Wavy divider -->
      <div class="absolute right-0 bottom-0 left-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          class="h-15 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>

    <Categories />

    <FeaturedRecipes />

    <TodaysPick
      title="TODO"
      image="TODO"
      :calories="245"
      :time="40"
      :servings="4"
      difficulty="easy"
    />

    <Testimonials />

    <NewsletterCTA />

    <Footer />
  </div>
</template>
