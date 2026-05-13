import type { CacheService } from "@/common/cache/cache.service.js";
import type { TypedEmitter } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import { recipeCache as recipeCacheOptions } from "./recipe.cache.js";
import type { RecipeStatsService } from "./recipe-stats.service.js";

export function registerRecipeEventHandlers(
  bus: TypedEmitter,
  deps: {
    recipeStats: RecipeStatsService;
    recipeCache: CacheService;
    log: Logger;
  },
) {
  bus.on("favorite:created", async ({ recipeId }) => {
    await deps.recipeStats.onFavoriteCreated(recipeId);
    deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
  });
  bus.on("favorite:deleted", async ({ recipeId }) => {
    await deps.recipeStats.onFavoriteDeleted(recipeId);
    deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
  });
  bus.on("comment:created", async ({ recipeId }) => {
    await deps.recipeStats.onCommentCreated(recipeId);
    deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
  });
  bus.on("comment:deleted", async ({ recipeId }) => {
    await deps.recipeStats.onCommentDeleted(recipeId);
    deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
  });
  bus.on("recipe-rating:created", async ({ recipeId, value }) => {
    await deps.recipeStats.onRatingCreated(recipeId, value);
    deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
  });
  bus.on(
    "recipe-rating:updated",
    async ({ recipeId, previousValue, value }) => {
      await deps.recipeStats.onRatingUpdated(recipeId, previousValue, value);
      deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
    },
  );
  bus.on("recipe-rating:deleted", async ({ recipeId, value }) => {
    await deps.recipeStats.onRatingDeleted(recipeId, value);
    deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
  });
}
