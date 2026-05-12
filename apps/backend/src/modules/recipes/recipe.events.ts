import type { CacheService } from "@/common/cache/cache.service.js";
import type { TypedEmitter } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";

export function registerRecipeEventHandlers(
  bus: TypedEmitter,
  deps: {
    recipeCache: CacheService;
    log: Logger;
  },
) {
  bus.on("category:changed", () => deps.recipeCache.deletePattern("*"));
  bus.on("recipe:rated", () => deps.recipeCache.deletePattern("*"));
}
