import { queryOptions } from "@tanstack/vue-query";
import { getReviewsStats, getTestimonials } from "./review.api";

export const queryKeys = {
  all: ["reviews"] as const,

  testimonials: () => [...queryKeys.all, "testimonials"] as const,
  stats: () => [...queryKeys.all, "stats"] as const,
};

export function testimonialsOptions() {
  return queryOptions({
    queryKey: queryKeys.testimonials(),
    queryFn: getTestimonials,
    staleTime: 5 * 60 * 1000,
  });
}

export function reviewStatsOptions() {
  return queryOptions({
    queryKey: queryKeys.stats(),
    queryFn: getReviewsStats,
    staleTime: 5 * 60 * 1000,
  });
}
