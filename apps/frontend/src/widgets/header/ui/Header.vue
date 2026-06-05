<script setup lang="ts">
import {
  SignedIn,
  SignedOut,
  useCurrentUser,
  useLogoutMutation,
} from "@/features/auth";
import AppLink from "@/shared/ui/AppLink.vue";
import AppLogo from "@/shared/ui/AppLogo.vue";

const links = [
  {
    to: "#recipes",
    label: "Recipes",
  },
  {
    to: "#categories",
    label: "Categories",
  },
  {
    to: "#about",
    label: "About",
  },
];

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
            <li v-for="link in links" :key="link.to">
              <AppLink :to="link.to" variant="secondary" class="justify-center">
                {{ link.label }}
              </AppLink>
            </li>
          </ul>
        </nav>

        <div class="flex items-center gap-3">
          <SignedIn>
            <span class="text-sm font-medium text-stone-700">
              {{ user?.name }}
            </span>
            <Button
              label="Log out"
              size="small"
              severity="secondary"
              @click="logout()"
              outlined
            />
          </SignedIn>

          <SignedOut>
            <Button
              asChild
              v-slot="slotProps"
              size="small"
              severity="secondary"
              outlined
            >
              <RouterLink
                to="/login"
                class="font-medium"
                :class="slotProps.class"
              >
                Sign In
              </RouterLink>
            </Button>
          </SignedOut>

          <Button label="Add Recipe" size="small" />
        </div>
      </div>
    </div>
  </header>
</template>
