import type { z } from "zod";
import type { createCommentSchema } from "./comment.schema.js";
import type {
  createRecipeSchema,
  minutesSchema,
  secondsSchema,
  updateRecipeSchema,
} from "./recipe.schema.js";

export type Minutes = z.infer<typeof minutesSchema>;
export type Seconds = z.infer<typeof secondsSchema>;

export type CreateRecipeBody = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeBody = z.infer<typeof updateRecipeSchema>;

export type CreateCommentBody = z.infer<typeof createCommentSchema>;

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  category: CategorySummary;
  author: UserSummary;
  cookingTime: Minutes;
  servings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Comment {
  id: string;
  text: string;
  recipeId: string;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
