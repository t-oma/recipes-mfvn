import type { ReviewDetails, ReviewsStats } from "@recipes/shared/reviews";
import { http } from "@/shared";

/**
 * Get featured testimonials.
 *
 * @returns List of featured reviews.
 */
export function getTestimonials() {
  return http.get<ReviewDetails[]>("/api/reviews/testimonials");
}

/**
 * Get review statistics.
 *
 * @returns Review stats (total, average rating, happy cooks).
 */
export function getReviewsStats() {
  return http.get<ReviewsStats>("/api/reviews/stats");
}
