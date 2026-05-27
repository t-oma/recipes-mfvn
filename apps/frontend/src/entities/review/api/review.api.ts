import type { ReviewDetails, ReviewsStats } from "@recipes/shared";
import { http } from "@/shared/api/http";

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
export function getReviewStats() {
  return http.get<ReviewsStats>("/api/reviews/stats");
}
