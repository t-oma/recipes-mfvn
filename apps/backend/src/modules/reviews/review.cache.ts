export const reviewCache = {
  keys: {
    featured: () => "featured",
    stats: () => "stats",
    allPattern: () => "*",
  },
  ttl: {
    featured: 3600,
    stats: 300,
  },
} as const;
