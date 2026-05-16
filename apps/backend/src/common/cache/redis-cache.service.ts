import { Redis } from "ioredis";
import type { Logger } from "@/common/logger.js";
import type { CacheService } from "./cache.service.js";

export interface RedisCacheOptions {
  url: string;
  keyPrefix?: string;
}

export function createRedisCache(
  options: RedisCacheOptions,
  log: Logger,
): CacheService {
  const { url, keyPrefix = "" } = options;

  const redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on("error", (err) => {
    log.error(err, "Redis connection error");
  });

  redis.on("reconnecting", () => {
    log.warn("Redis reconnecting");
  });

  function prefixed(key: string): string {
    return keyPrefix + key;
  }

  return {
    async get<T extends {}>(key: string) {
      const raw = await redis.get(prefixed(key));
      if (raw === null) return undefined;
      return JSON.parse(raw) as T;
    },

    async set<T extends {}>(key: string, value: T, ttlSeconds?: number) {
      if (ttlSeconds) {
        await redis.setex(prefixed(key), ttlSeconds, JSON.stringify(value));
        return;
      }

      await redis.set(prefixed(key), JSON.stringify(value));
    },

    async getOrSet<T extends {}>(
      key: string,
      factory: () => Promise<T>,
      ttlSeconds?: number,
    ) {
      const cached = await this.get<T>(key);
      if (cached !== undefined) {
        return {
          value: cached,
          cache: {
            status: "hit",
            key,
            ttl: ttlSeconds ?? 0,
          },
        };
      }

      const value = await factory();

      await this.set(key, value, ttlSeconds);
      return {
        value,
        cache: {
          status: "miss",
          key,
          ttl: ttlSeconds ?? 0,
        },
      };
    },

    async delete(key: string) {
      await redis.del(prefixed(key));
    },

    async deletePattern(pattern: string) {
      const fullPattern = prefixed(pattern);
      let cursor = "0";

      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          fullPattern,
          "COUNT",
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== "0");
    },

    async flush(): Promise<void> {
      await redis.flushdb();
    },

    async close(): Promise<void> {
      await this.flush();
      await redis.quit();
    },
  };
}
