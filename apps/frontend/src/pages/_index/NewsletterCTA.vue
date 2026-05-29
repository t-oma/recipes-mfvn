<template>
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
        Subscribe to our newsletter and get the best seasonal recipes, tips, and
        cooking secrets delivered straight to your inbox.
      </p>

      <div class="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
        <InputText
          type="email"
          placeholder="your@email.com"
          class="py-3! focus:ring-2! focus:ring-white/50!"
          fluid
        />
        <Button label="Subscribe" iconPos="right" severity="contrast" />
      </div>

      <p class="mt-4 text-sm text-white/60">No spam. Unsubscribe anytime.</p>
    </div>
  </div>
</template>
