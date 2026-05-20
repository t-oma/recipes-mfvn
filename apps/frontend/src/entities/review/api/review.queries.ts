import { queryOptions } from "@tanstack/vue-query";
import { getReviewStats, getTestimonials } from "./review.api";

const reviewKeys = {
  all: ["reviews"] as const,

  testimonials: () => [...reviewKeys.all, "testimonials"] as const,
  stats: () => [...reviewKeys.all, "stats"] as const,
};

export function testimonialsOptions() {
  return queryOptions({
    queryKey: reviewKeys.testimonials(),
    queryFn: getTestimonials,
    staleTime: 5 * 60 * 1000,
  });
}

export function reviewStatsOptions() {
  return queryOptions({
    queryKey: reviewKeys.stats(),
    queryFn: getReviewStats,
    staleTime: 5 * 60 * 1000,
  });
}
