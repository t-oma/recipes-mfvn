import type {
  Difficulty,
  Image,
  Minutes,
  RecipeStats,
  RecipeSummary,
  RecipeWithComputed,
} from "@recipes/shared";
import type { CategorySummaryView } from "@/modules/categories/category.mapper.js";
import { toCategorySummary } from "@/modules/categories/category.mapper.js";
import type { UserSummaryView } from "@/modules/users/user.mapper.js";
import { toUserSummary } from "@/modules/users/user.mapper.js";

export type IngredientView = {
  name: string;
  quantity: number;
  unit: string;
};

export type RecipeSummaryView = {
  _id: string | { toString(): string };
  title: string;
};

export type RecipeView = RecipeSummaryView & {
  description: string;
  ingredients: IngredientView[];
  instructions: string[];
  category: CategorySummaryView;
  author: UserSummaryView;
  difficulty: Difficulty;
  cookingTime: Minutes;
  servings: number;
  isPublic: boolean;
  image: Image;
  stats: RecipeStats;
  userRating?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toRecipeSummary(view: RecipeSummaryView): RecipeSummary {
  return {
    id: view._id.toString(),
    title: view.title,
  };
}

export function toRecipe(
  view: RecipeView,
  isFavorited: boolean,
): RecipeWithComputed {
  return {
    ...toRecipeSummary(view),
    description: view.description,
    ingredients: view.ingredients,
    instructions: view.instructions,
    category: toCategorySummary(view.category),
    author: toUserSummary(view.author),
    difficulty: view.difficulty,
    cookingTime: view.cookingTime,
    servings: view.servings,
    isPublic: view.isPublic,
    image: {
      ...view.image,
      alt: view.image.alt ?? view.title,
    },
    isFavorited,
    userRating: view.userRating ?? null,
    stats: {
      favoritesCount: view.stats.favoritesCount ?? 0,
      commentsCount: view.stats.commentsCount ?? 0,
      ratingCount: view.stats.ratingCount ?? 0,
      ratingSum: view.stats.ratingSum ?? 0,
      averageRating: view.stats.averageRating ?? null,
      popularity: view.stats.popularity ?? 0,
    },
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
