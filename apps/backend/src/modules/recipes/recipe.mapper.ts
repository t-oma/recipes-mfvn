import type {
  Difficulty,
  Image,
  Minutes,
  RecipeDetails,
  RecipeListItem,
  RecipeStats,
  RecipeSummary,
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

export type RecipeListItemView = RecipeSummaryView & {
  stats: RecipeStats;
  userRating?: number | null;
  image: Image;
  category: CategorySummaryView;
  author: UserSummaryView;
  cookingTime: Minutes;
  servings: number;
  difficulty: Difficulty;
};

export type RecipeView = RecipeListItemView & {
  description: string;
  ingredients: IngredientView[];
  instructions: string[];
  isPublic: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toRecipeSummary(view: RecipeSummaryView): RecipeSummary {
  return {
    id: view._id.toString(),
    title: view.title,
  };
}

export function toRecipeListItem(
  view: RecipeListItemView,
  isFavorited: boolean,
): RecipeListItem {
  return {
    ...toRecipeSummary(view),
    userRating: view.userRating ?? null,
    image: {
      ...view.image,
      alt: view.image.alt ?? view.title,
    },
    difficulty: view.difficulty,
    cookingTime: view.cookingTime,
    servings: view.servings,
    isFavorited,
    category: toCategorySummary(view.category),
    author: toUserSummary(view.author),
    stats: {
      favoritesCount: view.stats.favoritesCount ?? 0,
      commentsCount: view.stats.commentsCount ?? 0,
      ratingCount: view.stats.ratingCount ?? 0,
      ratingSum: view.stats.ratingSum ?? 0,
      averageRating: view.stats.averageRating ?? null,
      popularity: view.stats.popularity ?? 0,
    },
  };
}

export function toRecipeDetails(
  view: RecipeView,
  isFavorited: boolean,
): RecipeDetails {
  return {
    ...toRecipeListItem(view, isFavorited),
    description: view.description,
    ingredients: view.ingredients,
    instructions: view.instructions,
    isPublic: view.isPublic,
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
