export function buildRecipeRef(recipe: {
  id: string | { toString(): string };
  slug: string;
}) {
  return `${recipe.id.toString()}-${recipe.slug}` as const;
}
