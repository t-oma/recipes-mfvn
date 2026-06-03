import type { RecipeDetails } from "@recipes/shared";

export function recalculateRating(
  old: Pick<RecipeDetails, "stats" | "userRating">,
  newUserRating: number | null,
) {
  const prevAvg = old.stats.averageRating ?? 0;
  const prevCount = old.stats.ratingCount ?? 0;
  const totalBefore = prevAvg * prevCount;

  let nextCount = prevCount;
  let totalAfter = totalBefore;

  if (old.userRating !== null && newUserRating !== null) {
    nextCount = prevCount;
    totalAfter = totalBefore - old.userRating + newUserRating;
  } else if (old.userRating !== null && newUserRating === null) {
    nextCount = Math.max(prevCount - 1, 0);
    totalAfter = totalBefore - old.userRating;
  } else if (old.userRating === null && newUserRating !== null) {
    nextCount = prevCount + 1;
    totalAfter = totalBefore + newUserRating;
  }

  return {
    averageRating: totalAfter / nextCount,
    ratingsCount: nextCount,
  };
}
