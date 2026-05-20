import type { ReviewDetails, ReviewsStats } from "@recipes/shared";
import { apiClient } from "@/shared/api/client";

/**
 * Get featured testimonials.
 *
 * @returns List of featured reviews.
 */
export function getTestimonials() {
  return apiClient<ReviewDetails[]>("/api/reviews/testimonials");
}

/**
 * Get review statistics.
 *
 * @returns Review stats (total, average rating, happy cooks).
 */
export function getReviewStats() {
  return apiClient<ReviewsStats>("/api/reviews/stats");
}
