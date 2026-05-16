import type { CacheService } from "./cache.service.js";

export function createNamespacedCache(
  prefix: string,
  cache: CacheService,
): CacheService {
  return {
    async get<T extends {}>(key: string) {
      return cache.get<T>(`${prefix}:${key}`);
    },

    async set<T extends {}>(key: string, value: T, ttlSeconds?: number) {
      return cache.set(`${prefix}:${key}`, value, ttlSeconds);
    },

    async getOrSet<T extends {}>(
      key: string,
      factory: () => Promise<T>,
      ttlSeconds?: number,
    ) {
      return cache.getOrSet(`${prefix}:${key}`, factory, ttlSeconds);
    },

    async delete(key: string) {
      return cache.delete(`${prefix}:${key}`);
    },

    async deletePattern(pattern: string) {
      return cache.deletePattern(`${prefix}:${pattern}`);
    },

    flush: cache.flush,
    close: cache.close,
  };
}
