import type { CacheService } from "./cache.service.js";
import type { MemoryCacheOptions } from "./memory-cache.service.js";
import { createMemoryCache } from "./memory-cache.service.js";
import type { RedisCacheOptions } from "./redis-cache.service.js";

export type CacheBackend = "memory" | "redis";

export interface CacheFactoryOptions {
  backend?: CacheBackend;
  redis?: RedisCacheOptions;
  memory?: MemoryCacheOptions;
}

/**
 * Creates a new cache service based on the provided options.
 *
 * @param options.backend - The cache backend to use. Defaults to "memory".
 * @param options.redis - Redis cache options. Only used when backend is "redis".
 * @param options.memory - Memory cache options. Only used when backend is "memory".
 * @returns A new cache service.
 */
export async function createCacheService(
  options: CacheFactoryOptions = {},
): Promise<CacheService> {
  const { backend = "memory" } = options;

  if (backend === "redis") {
    console.warn(
      "⚠️  Redis backend is not configured yet, falling back to in-memory cache",
    );
  }

  return createMemoryCache(options.memory);
}
