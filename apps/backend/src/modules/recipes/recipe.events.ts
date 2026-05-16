import type { CacheService } from "@/common/cache/cache.service.js";
import type { TypedEmitter } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import { recipeCache as recipeCacheOptions } from "./recipe.cache.js";
import type { RecipeStatsService } from "./recipe-stats.service.js";

export function registerRecipeEventHandlers(
  bus: TypedEmitter,
  deps: {
    recipeStats: RecipeStatsService;
    recipeCache: Pick<CacheService, "delete" | "deletePattern">;
    log: Logger;
  },
) {
  bus.on("favorite:created", async ({ recipeId }) => {
    try {
      await deps.recipeStats.onFavoriteCreated(recipeId);
      await deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
      await deps.recipeCache.deletePattern(
        recipeCacheOptions.keys.listPattern(),
      );
    } catch (err) {
      deps.log.error(
        { err, recipeId, event: "favorite:created" },
        "Failed to update recipe stats",
      );
    }
  });
  bus.on("favorite:deleted", async ({ recipeId }) => {
    try {
      await deps.recipeStats.onFavoriteDeleted(recipeId);
      await deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
      await deps.recipeCache.deletePattern(
        recipeCacheOptions.keys.listPattern(),
      );
    } catch (err) {
      deps.log.error(
        { err, recipeId, event: "favorite:deleted" },
        "Failed to update recipe stats",
      );
    }
  });
  bus.on("comment:created", async ({ recipeId }) => {
    try {
      await deps.recipeStats.onCommentCreated(recipeId);
      await deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
      await deps.recipeCache.deletePattern(
        recipeCacheOptions.keys.listPattern(),
      );
    } catch (err) {
      deps.log.error(
        { err, recipeId, event: "comment:created" },
        "Failed to update recipe stats",
      );
    }
  });
  bus.on("comment:deleted", async ({ recipeId }) => {
    try {
      await deps.recipeStats.onCommentDeleted(recipeId);
      await deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
      await deps.recipeCache.deletePattern(
        recipeCacheOptions.keys.listPattern(),
      );
    } catch (err) {
      deps.log.error(
        { err, recipeId, event: "comment:deleted" },
        "Failed to update recipe stats",
      );
    }
  });
  bus.on("recipe-rating:created", async ({ recipeId, value }) => {
    try {
      await deps.recipeStats.onRatingCreated(recipeId, value);
      await deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
      await deps.recipeCache.deletePattern(
        recipeCacheOptions.keys.listPattern(),
      );
    } catch (err) {
      deps.log.error(
        { err, recipeId, event: "recipe-rating:created" },
        "Failed to update recipe stats",
      );
    }
  });
  bus.on(
    "recipe-rating:updated",
    async ({ recipeId, previousValue, value }) => {
      try {
        await deps.recipeStats.onRatingUpdated(recipeId, previousValue, value);
        await deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
        await deps.recipeCache.deletePattern(
          recipeCacheOptions.keys.listPattern(),
        );
      } catch (err) {
        deps.log.error(
          { err, recipeId, event: "recipe-rating:updated" },
          "Failed to update recipe stats",
        );
      }
    },
  );
  bus.on("recipe-rating:deleted", async ({ recipeId, value }) => {
    try {
      await deps.recipeStats.onRatingDeleted(recipeId, value);
      await deps.recipeCache.delete(recipeCacheOptions.keys.byId(recipeId));
      await deps.recipeCache.deletePattern(
        recipeCacheOptions.keys.listPattern(),
      );
    } catch (err) {
      deps.log.error(
        { err, recipeId, event: "recipe-rating:deleted" },
        "Failed to update recipe stats",
      );
    }
  });
}
