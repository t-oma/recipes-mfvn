/**
 * Cache service interface.
 *
 * Cache service is responsible for storing and retrieving data from a cache.
 * It provides methods for setting, getting, deleting, flushing cache, and closing the cache service.
 */
export interface CacheService {
  /**
   * Gets the value of the entry with the given key.
   *
   * @param key - The key of the entry to get.
   * @returns The value of the entry with the given key, or `undefined` if the entry does not exist.
   */
  get<T extends {}>(key: string): Promise<T | undefined>;

  /**
   * Sets the value of the entry with the given key.
   *
   * @param key - The key of the entry to set.
   * @param ttlSeconds - The time-to-live (TTL) in seconds for the entry. If not provided, the entry will not expire.
   */
  set<T extends {}>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Gets the value of the entry with the given key, or sets it using the provided factory function if it doesn't exist.
   *
   * @param key - The key of the entry to get or set.
   * @param factory - The function to use to set the value if it doesn't exist.
   * @param ttlSeconds - The time-to-live (TTL) in seconds for the entry. If not provided, the entry will not expire.
   * @returns The value of the entry with the given key, or the result of the factory function.
   */
  getOrSet<T extends {}>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<CacheGetResult<T>>;

  /**
   * Deletes the entry with the given key.
   */
  delete(key: string): Promise<void>;

  /**
   * Deletes all entries that match the given pattern.
   *
   * The pattern is a glob pattern that matches keys. For example, to delete all entries with the prefix "user:", you can use the pattern "user:*".
   */
  deletePattern(pattern: string): Promise<void>;

  /**
   * Flushes the cache and removes all entries.
   */
  flush(): Promise<void>;

  /**
   * Closes the cache service and releases any resources it holds.
   */
  close(): Promise<void>;
}

export type CacheGetResult<T> = {
  value: T;
  hit: boolean;
  key: string;
  ttl: number;
};

export function isCacheGetResult<T>(
  value: unknown,
): value is CacheGetResult<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "hit" in value &&
    "key" in value &&
    "ttl" in value
  );
}
