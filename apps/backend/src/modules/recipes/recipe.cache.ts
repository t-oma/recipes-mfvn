export const recipeCache = {
  keys: {
    byId: (id: string) => `recipes:id:${id}`,
    list: (filtersHash: string) => `recipes:list:${filtersHash}`,
    allPattern: () => "recipes:*",
  },
  ttl: {
    byId: 600,
    list: 120,
    search: 60,
  },
} as const;
