<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { ref } from "vue";

const searchQuery = ref("");

const categories = [
  { name: "Breakfast", icon: "🍳", count: 24 },
  { name: "Lunch", icon: "🍲", count: 42 },
  { name: "Dinner", icon: "🍝", count: 38 },
  { name: "Desserts", icon: "🍰", count: 56 },
  { name: "Salads", icon: "🥗", count: 31 },
  { name: "Drinks", icon: "🍹", count: 19 },
];

const popularRecipes = [
  {
    id: 1,
    title: "Ukrainian Borscht",
    description: "Classic borscht recipe with garlic pampushky",
    time: "2 hrs",
    difficulty: "Medium",
    image: "🍲",
  },
  {
    id: 2,
    title: "Syrnyky",
    description: "Delicate cheese pancakes with sour cream and jam",
    time: "30 min",
    difficulty: "Easy",
    image: "🥞",
  },
  {
    id: 3,
    title: "Charlotte Cake",
    description: "Apple pie with tender dough",
    time: "1 hr",
    difficulty: "Easy",
    image: "🍰",
  },
  {
    id: 4,
    title: "Stuffed Cabbage Rolls",
    description: "Cabbage rolls with meat and rice in tomato sauce",
    time: "1.5 hrs",
    difficulty: "Medium",
    image: "🥬",
  },
];

const latestRecipes = [
  {
    id: 5,
    title: "Carbonara Pasta",
    description: "Italian pasta with bacon and creamy sauce",
    time: "25 min",
    difficulty: "Easy",
    image: "🍝",
  },
  {
    id: 6,
    title: "Chicken Soup",
    description: "Light chicken soup with noodles and vegetables",
    time: "45 min",
    difficulty: "Easy",
    image: "🍜",
  },
  {
    id: 7,
    title: "Tiramisu",
    description: "Classic Italian dessert with mascarpone",
    time: "40 min",
    difficulty: "Medium",
    image: "🍰",
  },
  {
    id: 8,
    title: "Olivier Salad",
    description: "Festive salad with sausage and mayonnaise",
    time: "30 min",
    difficulty: "Easy",
    image: "🥗",
  },
];
</script>

<template>
  <div class="min-h-screen bg-amber-50">
    <!-- Hero Section -->
    <section
      class="relative overflow-hidden bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 py-20"
    >
      <div class="absolute inset-0 opacity-30">
        <div
          class="bg-size[20px_20px] h-full w-full bg-[radial-gradient(circle_at_1px_1px,#d97706_1px,transparent_0)]"
        ></div>
      </div>

      <div class="relative mx-auto max-w-6xl px-6">
        <div class="flex flex-col items-center text-center">
          <h1
            class="font-display text-6xl font-bold tracking-tight text-amber-900 md:text-7xl lg:text-8xl"
          >
            Delicious Recipes
          </h1>
          <p
            class="mt-6 max-w-2xl font-body text-xl text-amber-800 md:text-2xl"
          >
            Discover the best recipes of Ukrainian and world cuisine. Cook with
            love and inspiration!
          </p>

          <!-- Search Bar -->
          <IconField class="mt-8 w-full max-w-xl">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Search recipes..."
              class="w-full rounded-full border-2 border-amber-300 bg-white/80 px-6 py-4 pl-12 font-body text-lg text-amber-900 shadow-lg backdrop-blur-sm transition-all duration-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200"
            />
          </IconField>

          <div class="mt-8 flex gap-4">
            <Button
              label="Browse Recipes"
              class="rounded-full bg-amber-600 px-8 py-3 font-body text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-amber-700 hover:shadow-xl"
            />
            <Button
              label="Add Recipe"
              outlined
              class="rounded-full border-2 border-amber-600 px-8 py-3 font-body text-lg font-semibold text-amber-700 transition-all duration-300 hover:bg-amber-600 hover:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Decorative elements -->
      <div
        class="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl"
      ></div>
    </section>

    <!-- Categories Section -->
    <section class="py-16">
      <div class="mx-auto max-w-6xl px-6">
        <h2 class="font-display text-4xl font-bold text-amber-900">
          Categories
        </h2>
        <p class="mt-2 font-body text-lg text-amber-700">
          Choose a category and find the perfect recipe
        </p>

        <div class="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="category in categories"
            :key="category.name"
            class="group cursor-pointer rounded-2xl border-2 border-amber-200 bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-amber-400 hover:shadow-xl"
          >
            <div
              class="text-4xl transition-transform duration-300 group-hover:scale-110"
            >
              {{ category.icon }}
            </div>
            <h3
              class="mt-3 font-display text-lg font-semibold text-amber-900"
            >
              {{ category.name }}
            </h3>
            <p class="mt-1 font-body text-sm text-amber-600">
              {{ category.count }} recipes
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Recipes Section -->
    <section class="bg-amber-100/50 py-16">
      <div class="mx-auto max-w-6xl px-6">
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="font-display text-4xl font-bold text-amber-900"
            >
              Popular Recipes
            </h2>
            <p class="mt-2 font-body text-lg text-amber-700">
              Most loved dishes by our users
            </p>
          </div>
          <Button
            label="All Recipes"
            text
            class="font-body text-amber-700 hover:text-amber-900"
          />
        </div>

        <div class="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card
            v-for="recipe in popularRecipes"
            :key="recipe.id"
            class="group overflow-hidden rounded-2xl border-2 border-amber-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-amber-400 hover:shadow-xl"
          >
            <template #header>
              <div
                class="flex h-48 items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-6xl transition-transform duration-300 group-hover:scale-110"
              >
                {{ recipe.image }}
              </div>
            </template>
            <template #title>
              <h3
                class="font-display text-xl font-semibold text-amber-900"
              >
                {{ recipe.title }}
              </h3>
            </template>
            <template #content>
              <p class="font-body text-amber-700">
                {{ recipe.description }}
              </p>
              <div class="mt-4 flex items-center gap-4">
                <span
                  class="flex items-center gap-1 font-body text-sm text-amber-600"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Time"
                  >
                    <title>Time</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ recipe.time }}
                </span>
                <span
                  class="rounded-full bg-amber-100 px-3 py-1 font-body text-sm font-medium text-amber-700"
                >
                  {{ recipe.difficulty }}
                </span>
              </div>
            </template>
            <template #footer>
              <Button
                label="View Recipe"
                class="w-full rounded-xl bg-amber-600 font-body font-semibold text-white transition-all duration-300 hover:bg-amber-700"
              />
            </template>
          </Card>
        </div>
      </div>
    </section>

    <!-- Latest Recipes Section -->
    <section class="py-16">
      <div class="mx-auto max-w-6xl px-6">
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="font-display text-4xl font-bold text-amber-900"
            >
              Latest Recipes
            </h2>
            <p class="mt-2 font-body text-lg text-amber-700">
              Fresh recipes added by our users
            </p>
          </div>
          <Button
            label="All Recipes"
            text
            class="font-body text-amber-700 hover:text-amber-900"
          />
        </div>

        <div class="mt-10 grid gap-6 md:grid-cols-2">
          <div
            v-for="recipe in latestRecipes"
            :key="recipe.id"
            class="group flex gap-6 rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl"
          >
            <div
              class="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-4xl transition-transform duration-300 group-hover:scale-110"
            >
              {{ recipe.image }}
            </div>
            <div class="flex flex-col justify-between">
              <div>
                <h3
                  class="font-display text-xl font-semibold text-amber-900"
                >
                  {{ recipe.title }}
                </h3>
                <p class="mt-1 font-body text-amber-700">
                  {{ recipe.description }}
                </p>
              </div>
              <div class="mt-3 flex items-center gap-4">
                <span
                  class="flex items-center gap-1 font-body text-sm text-amber-600"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Time"
                  >
                    <title>Time</title>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ recipe.time }}
                </span>
                <span
                  class="rounded-full bg-amber-100 px-3 py-1 font-body text-sm font-medium text-amber-700"
                >
                  {{ recipe.difficulty }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-linear-to-r from-amber-600 to-orange-500 py-20">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h2
          class="font-display text-4xl font-bold text-white md:text-5xl"
        >
          Share Your Recipe
        </h2>
        <p class="mt-4 font-body text-xl text-amber-100">
          Have a favorite recipe? Share it with our community!
        </p>
        <Button
          label="Add Recipe"
          class="mt-8 rounded-full bg-white px-10 py-4 font-body text-lg font-semibold text-amber-700 shadow-lg transition-all duration-300 hover:bg-amber-50 hover:shadow-xl"
        />
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-amber-900 py-12 text-amber-100">
      <div class="mx-auto max-w-6xl px-6">
        <div class="grid gap-8 md:grid-cols-4">
          <div>
            <h3 class="font-display text-2xl font-bold text-white">
              Recipes
            </h3>
            <p class="mt-2 font-body text-amber-200">
              Delicious dishes for every day
            </p>
          </div>
          <div>
            <h4 class="font-body text-lg font-semibold text-white">
              Categories
            </h4>
            <ul class="mt-3 space-y-2 font-body text-amber-200">
              <li>
                <a href="#" class="transition-colors hover:text-white">
                  Breakfast
                </a>
              </li>
              <li>
                <a href="#" class="transition-colors hover:text-white">
                  Lunch
                </a>
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
          <div>
            <h4 class="font-body text-lg font-semibold text-white">
              Information
            </h4>
            <ul class="mt-3 space-y-2 font-body text-amber-200">
              <li>
                <a href="#" class="transition-colors hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" class="transition-colors hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" class="transition-colors hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-body text-lg font-semibold text-white">
              Social Media
            </h4>
            <div class="mt-3 flex gap-4">
              <a
                href="#"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-800 text-amber-200 transition-colors hover:bg-amber-700 hover:text-white"
                aria-label="Twitter"
              >
                <svg
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                  />
                </svg>
              </a>
              <a
                href="#"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-800 text-amber-200 transition-colors hover:bg-amber-700 hover:text-white"
                aria-label="Instagram"
              >
                <svg
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
              <a
                href="#"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-800 text-amber-200 transition-colors hover:bg-amber-700 hover:text-white"
                aria-label="YouTube"
              >
                <svg
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div class="mt-10 border-t border-amber-800 pt-8 text-center">
          <p class="font-body text-amber-300">
            © 2026 Recipes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
