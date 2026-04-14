import type { z } from "zod";
import type { CategorySummary } from "./category.schema.js";
import type { createCommentSchema } from "./comment.schema.js";
import type {
  createRecipeSchema,
  difficultySchema,
  minutesSchema,
  secondsSchema,
  updateRecipeSchema,
} from "./recipe.schema.js";
import type { UserSummary } from "./user.schema.js";

export type Minutes = z.infer<typeof minutesSchema>;
export type Seconds = z.infer<typeof secondsSchema>;

export type CreateRecipeBody = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeBody = z.infer<typeof updateRecipeSchema>;

export type CreateCommentBody = z.infer<typeof createCommentSchema>;

export type Difficulty = z.infer<typeof difficultySchema>;

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeSummary {
  id: string;
  title: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  category: CategorySummary;
  author: UserSummary;
  difficulty: Difficulty;
  cookingTime: Minutes;
  servings: number;
  isPublic: boolean;
  isFavorited: boolean;
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

export interface Comment {
  id: string;
  text: string;
  recipe: RecipeSummary;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export type CommentForRecipe = Omit<Comment, "recipe">;
