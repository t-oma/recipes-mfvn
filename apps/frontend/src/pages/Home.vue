<script setup lang="ts">
import { onMounted, ref } from "vue";
import Footer from "@/common/ui/footer/Footer.vue";

const isLoaded = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true;
  });
});

interface CategoryItem {
  name: string;
  icon: string;
  count: number;
  gradient: string;
}

const categories: CategoryItem[] = [
  {
    name: "Breakfast",
    icon: "pi pi-sun",
    count: 42,
    gradient: "from-amber-100 to-orange-100",
  },
  {
    name: "Lunch",
    icon: "pi pi-bolt",
    count: 78,
    gradient: "from-emerald-50 to-teal-100",
  },
  {
    name: "Dinner",
    icon: "pi pi-moon",
    count: 63,
    gradient: "from-violet-50 to-indigo-100",
  },
  {
    name: "Desserts",
    icon: "pi pi-heart",
    count: 51,
    gradient: "from-pink-50 to-rose-100",
  },
  {
    name: "Soups",
    icon: "pi pi-box",
    count: 34,
    gradient: "from-yellow-50 to-amber-100",
  },
  {
    name: "Salads",
    icon: "pi pi-verified",
    count: 29,
    gradient: "from-lime-50 to-green-100",
  },
];

interface FeaturedRecipe {
  id: number;
  title: string;
  time: string;
  difficulty: string;
  rating: number;
  image: string;
  tag: string;
}

const featuredRecipes: FeaturedRecipe[] = [
  {
    id: 1,
    title: "Classic Beef Bourguignon",
    time: "2 hr",
    difficulty: "Medium",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&h=400&fit=crop",
    tag: "Classic",
  },
  {
    id: 2,
    title: "Cherry Dumplings",
    time: "1.5 hr",
    difficulty: "Easy",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=400&fit=crop",
    tag: "Popular",
  },
  {
    id: 3,
    title: "Lemon Ricotta Pancakes",
    time: "30 min",
    difficulty: "Easy",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop",
    tag: "Quick",
  },
  {
    id: 4,
    title: "Stuffed Bell Peppers",
    time: "2.5 hr",
    difficulty: "Medium",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
    tag: "Hearty",
  },
];

interface Testimonial {
  text: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    text: "Best recipe site ever! The beef stew turned out even better than my grandmother's.",
    author: "Elena K.",
    role: "Home Cook",
  },
  {
    text: "So easy to find recipes here. Step-by-step instructions are a real find for beginners.",
    author: "Andrew M.",
    role: "Beginner Chef",
  },
  {
    text: "Dumplings, buns, fritters — everything in one place. Thanks for such a collection!",
    author: "Maria S.",
    role: "Food Enthusiast",
  },
];
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

    <!-- Navigation -->
    <nav
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

          <div class="hidden items-center gap-8 md:flex">
            <a
              href="#recipes"
              class="hover:text-terracotta text-sm font-medium text-stone-600 transition-colors"
            >
              Recipes
            </a>
            <a
              href="#categories"
              class="hover:text-terracotta text-sm font-medium text-stone-600 transition-colors"
            >
              Categories
            </a>
            <a
              href="#about"
              class="hover:text-terracotta text-sm font-medium text-stone-600 transition-colors"
            >
              About
            </a>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:shadow-md"
            >
              Sign In
            </button>
            <button
              type="button"
              class="bg-terracotta shadow-terracotta/25 hover:bg-terracotta-dark hover:shadow-terracotta/30 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl"
            >
              Add Recipe
            </button>
          </div>
        </div>
      </div>
    </nav>

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

    <!-- Categories Section -->
    <section id="categories" class="bg-white py-20 lg:py-28">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mb-14 flex items-end justify-between">
          <div>
            <p
              class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
            >
              Pick a direction
            </p>
            <h2
              class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
            >
              Recipe Categories
            </h2>
          </div>
          <a
            href="#"
            class="text-terracotta hover:text-terracotta-dark hidden items-center gap-2 text-sm font-semibold transition-colors sm:flex"
          >
            All categories
            <i class="pi pi-arrow-right text-xs" />
          </a>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <button
            v-for="(cat, index) in categories"
            :key="cat.name"
            type="button"
            class="group relative overflow-hidden rounded-2xl border border-stone-100 bg-linear-to-br p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-900/5"
            :class="cat.gradient"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 shadow-sm"
            >
              <i :class="[cat.icon, 'text-xl text-stone-700']" />
            </div>
            <h3 class="text-base font-bold text-stone-800">
              {{ cat.name }}
            </h3>
            <p class="mt-1 text-sm text-stone-500">{{ cat.count }} recipes</p>
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Recipes -->
    <section id="recipes" class="bg-stone-50 py-20 lg:py-28">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mb-14 flex items-end justify-between">
          <div>
            <p
              class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
            >
              Popular dishes
            </p>
            <h2
              class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
            >
              Featured Recipes
            </h2>
          </div>
          <a
            href="#"
            class="text-terracotta hover:text-terracotta-dark hidden items-center gap-2 text-sm font-semibold transition-colors sm:flex"
          >
            All recipes
            <i class="pi pi-arrow-right text-xs" />
          </a>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="recipe in featuredRecipes"
            :key="recipe.id"
            class="group cursor-pointer overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-900/8"
          >
            <div class="relative overflow-hidden">
              <img
                :src="recipe.image"
                :alt="recipe.title"
                class="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                class="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-700 backdrop-blur-md"
              >
                {{ recipe.tag }}
              </div>
              <button
                type="button"
                class="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-400 backdrop-blur-md transition-colors hover:text-rose-500"
              >
                <i class="pi pi-heart text-sm" />
              </button>
            </div>

            <div class="p-5">
              <h3
                class="font-display group-hover:text-terracotta text-lg font-bold text-stone-900 transition-colors"
              >
                {{ recipe.title }}
              </h3>

              <div class="mt-3 flex items-center gap-4 text-sm text-stone-500">
                <span class="flex items-center gap-1.5">
                  <i class="pi pi-clock text-xs" />
                  {{ recipe.time }}
                </span>
                <span class="flex items-center gap-1.5">
                  <i class="pi pi-chart-bar text-xs" />
                  {{ recipe.difficulty }}
                </span>
              </div>

              <div
                class="mt-4 flex items-center justify-between border-t border-stone-100 pt-4"
              >
                <div class="flex items-center gap-1">
                  <i class="pi pi-star-fill text-xs text-amber-400" />
                  <span class="text-sm font-semibold text-stone-700">
                    {{ recipe.rating }}
                  </span>
                </div>
                <span
                  class="text-terracotta flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
                >
                  View
                  <i class="pi pi-arrow-right text-[10px]" />
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Today's Pick / Highlight -->
    <section class="bg-white py-20 lg:py-28">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          class="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 p-8 lg:p-16"
        >
          <!-- Decorative background -->
          <div
            class="absolute top-0 right-0 z-0 h-full w-1/2 opacity-20"
            style="
              background: radial-gradient(
                ellipse at 70% 30%,
                rgba(194, 122, 84, 0.4),
                transparent 70%
              );
            "
          />
          <div
            class="bg-terracotta/10 absolute -top-20 -left-20 z-0 h-80 w-80 rounded-full blur-3xl"
          />

          <div class="relative z-10 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p
                class="text-terracotta mb-3 text-sm font-semibold tracking-widest uppercase"
              >
                Today's Pick
              </p>
              <h2
                class="font-display text-4xl font-bold tracking-tight text-white lg:text-5xl"
              >
                Culinary Calendar
              </h2>
              <p class="mt-6 max-w-lg text-lg leading-relaxed text-stone-300">
                Every day we pick seasonal recipes that perfectly match the time
                of year. Today — a silky roasted pumpkin soup with aromatic
                spices and homemade croutons.
              </p>

              <div class="mt-10 flex flex-wrap gap-4">
                <div
                  class="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm"
                >
                  <p class="text-sm text-stone-400">Calories</p>
                  <p class="text-xl font-bold text-white">245 kcal</p>
                </div>
                <div
                  class="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm"
                >
                  <p class="text-sm text-stone-400">Time</p>
                  <p class="text-xl font-bold text-white">40 min</p>
                </div>
                <div
                  class="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm"
                >
                  <p class="text-sm text-stone-400">Servings</p>
                  <p class="text-xl font-bold text-white">4</p>
                </div>
              </div>

              <button
                type="button"
                class="bg-terracotta shadow-terracotta/30 hover:bg-terracotta-dark mt-10 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                View Recipe
              </button>
            </div>

            <div class="relative">
              <div
                class="overflow-hidden rounded-2xl shadow-2xl shadow-black/30"
              >
                <img
                  src="https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=500&fit=crop"
                  alt="Pumpkin Soup"
                  class="h-95 w-full object-cover lg:h-110"
                />
              </div>
              <div
                class="absolute -bottom-4 -left-4 rounded-2xl border border-stone-700 bg-stone-800/90 px-5 py-3 backdrop-blur-md"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <i class="pi pi-check text-sm text-emerald-400" />
                  </div>
                  <div>
                    <p class="text-xs text-stone-400">Difficulty</p>
                    <p class="text-sm font-bold text-white">Easy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="bg-stone-50 py-20 lg:py-28">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mb-14 text-center">
          <p
            class="text-terracotta mb-2 text-sm font-semibold tracking-widest uppercase"
          >
            Reviews
          </p>
          <h2
            class="font-display text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl"
          >
            What Cooks Say
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="(item, index) in testimonials"
            :key="index"
            class="rounded-2xl border border-stone-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:shadow-stone-900/5"
          >
            <div class="mb-4 flex gap-1">
              <i
                v-for="s in 5"
                :key="s"
                class="pi pi-star-fill text-sm text-amber-400"
              />
            </div>
            <p class="text-lg leading-relaxed text-stone-700 italic">
              "{{ item.text }}"
            </p>
            <div class="mt-6 flex items-center gap-3">
              <div
                class="from-terracotta/20 text-terracotta flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br to-amber-100 text-sm font-bold"
              >
                {{ item.author.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-semibold text-stone-800">
                  {{ item.author }}
                </p>
                <p class="text-xs text-stone-500">{{ item.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter CTA -->
    <section class="bg-white py-20 lg:py-28">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          class="from-terracotta to-terracotta-dark shadow-terracotta/20 relative overflow-hidden rounded-3xl bg-linear-to-br px-8 py-16 text-center shadow-2xl lg:px-16"
        >
          <div
            class="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            class="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/10 blur-2xl"
          />

          <div class="relative z-10">
            <span class="text-5xl">📬</span>
            <h2
              class="font-display mt-6 text-4xl font-bold tracking-tight text-white lg:text-5xl"
            >
              New Recipes Every Week
            </h2>
            <p class="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Subscribe to our newsletter and get the best seasonal recipes,
              tips, and cooking secrets delivered straight to your inbox.
            </p>

            <div class="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="your@email.com"
                class="flex-1 rounded-xl border-0 bg-white/90 px-5 py-4 text-base text-stone-800 placeholder-stone-400 ring-0 backdrop-blur-sm transition-all outline-none focus:bg-white focus:ring-2 focus:ring-white/50"
              />
              <button
                type="button"
                class="shrink-0 rounded-xl bg-stone-900 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-stone-800"
              >
                Subscribe
              </button>
            </div>

            <p class="mt-4 text-sm text-white/60">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>
