export const categoryCache = {
  keys: {
    all: () => "categories:all",
  },
  ttl: {
    list: 3600,
  },
} as const;
