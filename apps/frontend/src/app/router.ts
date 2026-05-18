import { createRouter, createWebHistory } from "vue-router";
import { handleHotUpdate, routes } from "vue-router/auto-routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

declare module "vue-router" {
  interface RouteMeta {
    layout?: "default" | "no-layout";
  }
}

export default router;
