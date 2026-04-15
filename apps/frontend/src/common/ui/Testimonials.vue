<script setup lang="ts">
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
</template>
