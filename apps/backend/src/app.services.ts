import type { CacheService } from "@/common/cache/cache.service.js";
import { createNamespacedCache } from "@/common/cache/namespaced-cache.js";
import type { TypedEmitter } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import { createBcryptPasswordService } from "@/common/passwords/bcrypt.service.js";
import { env } from "@/config/env.js";
import type { AuthService } from "@/modules/auth/auth.service.js";
import { createAuthService } from "@/modules/auth/auth.service.js";
import { RefreshSessionModel } from "@/modules/auth/refresh-session.model.js";
import { RefreshSessionRepository } from "@/modules/auth/refresh-session.repository.js";
import type { RefreshSessionService } from "@/modules/auth/refresh-session.service.js";
import { createRefreshSessionService } from "@/modules/auth/refresh-session.service.js";
import { CategoryModel } from "@/modules/categories/category.model.js";
import { CategoryRepository } from "@/modules/categories/category.repository.js";
import type { CategoryService } from "@/modules/categories/category.service.js";
import { createCategoryService } from "@/modules/categories/category.service.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import { CommentRepository } from "@/modules/comments/comment.repository.js";
import type { CommentService } from "@/modules/comments/comment.service.js";
import { createCommentService } from "@/modules/comments/comment.service.js";
import { CuisineModel } from "@/modules/cuisines/cuisine.model.js";
import { CuisineRepository } from "@/modules/cuisines/cuisine.repository.js";
import type { CuisineService } from "@/modules/cuisines/cuisine.service.js";
import { createCuisineService } from "@/modules/cuisines/cuisine.service.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { FavoriteRepository } from "@/modules/favorites/favorite.repository.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import { createFavoriteService } from "@/modules/favorites/favorite.service.js";
import { RecipeRatingModel } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { RecipeRatingRepository } from "@/modules/recipe-ratings/recipe-rating.repository.js";
import type { RecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";
import { createRecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import type { RecipeService } from "@/modules/recipes/recipe.service.js";
import { createRecipeService } from "@/modules/recipes/recipe.service.js";
import type { RecipeStatsService } from "@/modules/recipes/recipe-stats.service.js";
import { createRecipeStatsService } from "@/modules/recipes/recipe-stats.service.js";
import { ReviewModel } from "@/modules/reviews/review.model.js";
import { ReviewRepository } from "@/modules/reviews/review.repository.js";
import type { ReviewService } from "@/modules/reviews/review.service.js";
import { createReviewService } from "@/modules/reviews/review.service.js";
import { UserModel } from "@/modules/users/user.model.js";
import { UserRepository } from "@/modules/users/user.repository.js";
import type { UserService } from "@/modules/users/user.service.js";
import { createUserService } from "@/modules/users/user.service.js";

export interface AppServices {
  auth: AuthService;
  user: UserService;
  recipe: RecipeService;
  recipeStats: RecipeStatsService;
  comment: CommentService;
  favorite: FavoriteService;
  recipeRating: RecipeRatingService;
  category: CategoryService;
  cuisine: CuisineService;
  review: ReviewService;
  refreshSession: RefreshSessionService;

  recipeCache: CacheService;
  categoryCache: CacheService;
  cuisineCache: CacheService;
  reviewCache: CacheService;

  log: Logger;
}

export function createServices(
  cache: CacheService,
  bus: TypedEmitter,
  log: Logger,
): AppServices {
  const commentRepository = new CommentRepository(CommentModel);
  const categoryRepository = new CategoryRepository(CategoryModel);
  const cuisineRepository = new CuisineRepository(CuisineModel);
  const favoriteRepository = new FavoriteRepository(FavoriteModel);
  const recipeRatingRepository = new RecipeRatingRepository(RecipeRatingModel);
  const userRepository = new UserRepository(UserModel);
  const recipeRepository = new RecipeRepository(RecipeModel);
  const reviewRepository = new ReviewRepository(ReviewModel);
  const refreshSessionRepository = new RefreshSessionRepository(
    RefreshSessionModel,
  );

  const recipeCache = createNamespacedCache("recipes", cache);
  const categoryCache = createNamespacedCache("categories", cache);
  const cuisineCache = createNamespacedCache("cuisines", cache);
  const reviewCache = createNamespacedCache("reviews", cache);

  const passwordService = createBcryptPasswordService(env.BCRYPT_SALT_ROUNDS);

  const commentService = createCommentService(
    commentRepository,
    recipeRepository,
    userRepository,
    bus,
  );
  const favoriteService = createFavoriteService(
    favoriteRepository,
    recipeRepository,
    userRepository,
    bus,
  );
  const userService = createUserService(
    userRepository,
    commentService,
    favoriteService,
  );
  const recipeRatingService = createRecipeRatingService(
    recipeRatingRepository,
    recipeRepository,
    userRepository,
    bus,
  );
  const categoryService = createCategoryService(
    categoryRepository,
    recipeRepository,
    categoryCache,
    bus,
  );
  const cuisineService = createCuisineService(
    cuisineRepository,
    recipeRepository,
    cuisineCache,
    bus,
  );
  const recipeService = createRecipeService(
    recipeRepository,
    userRepository,
    favoriteRepository,
    categoryRepository,
    cuisineRepository,
    recipeCache,
    bus,
  );
  const recipeStatsService = createRecipeStatsService(recipeRepository);
  const reviewService = createReviewService(
    reviewRepository,
    userRepository,
    reviewCache,
  );
  const refreshSessionService = createRefreshSessionService(
    refreshSessionRepository,
    userRepository,
  );
  const authService = createAuthService(userRepository, passwordService, log);

  return {
    auth: authService,
    user: userService,
    recipe: recipeService,
    recipeStats: recipeStatsService,
    comment: commentService,
    favorite: favoriteService,
    recipeRating: recipeRatingService,
    category: categoryService,
    cuisine: cuisineService,
    review: reviewService,
    refreshSession: refreshSessionService,

    recipeCache,
    categoryCache,
    cuisineCache,
    reviewCache,

    log,
  };
}
