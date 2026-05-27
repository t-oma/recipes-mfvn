import { createRouter, createWebHistory } from "vue-router";
import { handleHotUpdate, routes } from "vue-router/auto-routes";
import { useAuthStore } from "@/features/auth/model/auth.store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: "/" };
  }
});

declare module "vue-router" {
  interface RouteMeta {
    layout?: "default" | "no-layout";
    requiresAuth?: boolean;
    guestOnly?: boolean;
  }
}

export default router;
