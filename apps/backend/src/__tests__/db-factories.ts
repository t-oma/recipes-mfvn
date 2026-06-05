import type {
  Difficulty,
  MealType,
  Minutes,
  RecipeStats,
} from "@recipes/shared";
import type { Types } from "mongoose";
import { slugify } from "@/common/utils/slug.js";
import { RefreshSessionModel } from "@/modules/auth/refresh-session.model.js";
import { CategoryModel } from "@/modules/categories/category.model.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import { CuisineModel } from "@/modules/cuisines/cuisine.model.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { RecipeRatingModel } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { ReviewModel } from "@/modules/reviews/review.model.js";
import { UserModel } from "@/modules/users/user.model.js";
import { createObjectId } from "./helpers.js";

let counter = 0;
function unique(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export async function createDbUser(
  overrides: Partial<{
    email: string;
    password: string;
    name: string;
    role: "user" | "admin";
  }> = {},
) {
  return UserModel.create({
    email: `${unique("user")}@test.com`,
    password: "hashedPassword123",
    name: "Test User",
    role: "user",
    ...overrides,
  });
}

export async function createDbCategory(
  overrides: Partial<{
    name: string;
    slug: string;
    description: string;
    image: { url: string };
  }> = {},
) {
  const name = overrides.name ?? unique("category");
  return CategoryModel.create({
    name,
    slug: overrides.slug ?? slugify(name),
    description: "A test category",
    image: { url: "https://example.com/category.jpg" },
    ...overrides,
  });
}

export async function createDbCuisine(
  overrides: Partial<{
    name: string;
    slug: string;
    description: string;
    image: { url: string };
  }> = {},
) {
  const name = overrides.name ?? unique("cuisine");
  return CuisineModel.create({
    name,
    slug: overrides.slug ?? slugify(name),
    description: "A test cuisine",
    image: { url: "https://example.com/cuisine.jpg" },
    ...overrides,
  });
}

export async function createDbRecipe(
  overrides: Partial<{
    title: string;
    description: string;
    slug: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    instructions: string[];
    category: Types.ObjectId;
    cuisine?: Types.ObjectId;
    author: Types.ObjectId;
    difficulty: Difficulty;
    mealType: MealType;
    cookingTime: Minutes;
    servings: number;
    isPublic: boolean;
    image: { url: string; alt?: string };
    stats: RecipeStats;
  }> = {},
) {
  const title = overrides.title ?? unique("recipe");

  return RecipeModel.create({
    title,
    description: "A test recipe",
    slug: slugify(title),
    ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
    instructions: ["Mix ingredients"],
    category: createObjectId(),
    author: createObjectId(),
    difficulty: "easy",
    mealType: "breakfast",
    cookingTime: 30 as Minutes,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    },
    ...overrides,
  });
}

export async function createDbComment(
  overrides: Partial<{
    text: string;
    recipe: Types.ObjectId;
    author: Types.ObjectId;
  }> = {},
) {
  return CommentModel.create({
    text: "Great recipe!",
    recipe: createObjectId(),
    author: createObjectId(),
    ...overrides,
  });
}

export async function createDbFavorite(
  overrides: Partial<{
    user: Types.ObjectId;
    recipe: Types.ObjectId;
  }> = {},
) {
  return FavoriteModel.create({
    user: createObjectId(),
    recipe: createObjectId(),
    ...overrides,
  });
}

export async function createDbRecipeRating(
  overrides: Partial<{
    user: Types.ObjectId;
    recipe: Types.ObjectId;
    value: number;
  }> = {},
) {
  return RecipeRatingModel.create({
    user: createObjectId(),
    recipe: createObjectId(),
    value: 5,
    ...overrides,
  });
}

export async function createDbReview(
  overrides: Partial<{
    author: Types.ObjectId;
    text: string;
    rating: number;
    isFeatured: boolean;
  }> = {},
) {
  return ReviewModel.create({
    author: createObjectId(),
    text: "Amazing platform!",
    rating: 5,
    isFeatured: false,
    ...overrides,
  });
}

export async function createDbRefreshSession(
  overrides: Partial<{
    user: Types.ObjectId;
    familyId: string;
    tokenHash: string;
    expiresAt: Date;
    rotatedAt: Date | null;
    replacedBy: string | null;
    revokedAt: Date | null;
    revokeReason: string | null;
  }> = {},
) {
  return RefreshSessionModel.create({
    user: overrides.user ?? createObjectId(),
    familyId: overrides.familyId ?? `family-${unique("fam")}`,
    tokenHash: overrides.tokenHash ?? `hash-${unique("hash")}`,
    expiresAt:
      overrides.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    rotatedAt: overrides.rotatedAt ?? null,
    replacedBy: overrides.replacedBy ?? null,
    revokedAt: overrides.revokedAt ?? null,
    revokeReason: overrides.revokeReason ?? null,
    ...overrides,
  });
}
