import { LRUCache } from "lru-cache";
import type { CacheService } from "./cache.service.js";

export interface MemoryCacheOptions {
  maxSize?: number;
}

/**
 * Creates a new memory cache service.
 *
 * @param options.maxSize - The maximum number of items in the cache. Defaults to 1000.
 * @returns A new memory cache service.
 */
export function createMemoryCache(
  options: MemoryCacheOptions = {},
): CacheService {
  const { maxSize = 1000 } = options;

  const cache = new LRUCache<string, NonNullable<unknown>>({
    max: maxSize,
    updateAgeOnGet: true,
  });

  return {
    async get<T extends {}>(key: string) {
      return cache.get(key) as T | undefined;
    },

    async set<T extends {}>(key: string, value: T, ttlSeconds?: number) {
      if (ttlSeconds) {
        cache.set(key, value, { ttl: ttlSeconds * 1000 });
        return;
      }

      cache.set(key, value);
    },

    async getOrSet<T extends {}>(
      key: string,
      factory: () => Promise<T>,
      ttlSeconds?: number,
    ) {
      const cached = await this.get<T>(key);
      if (cached !== undefined) {
        return { value: cached, hit: true };
      }

      const value = await factory();

      await this.set(key, value, ttlSeconds);
      return { value, hit: false };
    },

    async delete(key: string) {
      cache.delete(key);
    },

    async deletePattern(pattern: string) {
      const regex = new RegExp(
        `^${pattern.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
      );
      for (const key of cache.keys()) {
        if (regex.test(key)) {
          cache.delete(key);
        }
      }
    },

    async flush() {
      cache.clear();
    },

    async close() {
      await this.flush();
      // Nothing to close for in-memory cache
    },
  };
}
