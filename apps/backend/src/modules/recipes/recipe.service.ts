import type {
  CreateRecipeBody,
  Paginated,
  RecipeQuery,
  RecipeWithComputed,
  UpdateRecipeBody,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type { EmptyObject } from "@/common/base.repository.js";
import type {
  CachedResult,
  CacheService,
} from "@/common/cache/cache.service.js";
import { ForbiddenError, NotFoundError } from "@/common/errors.js";
import type { TypedEmitter } from "@/common/events.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  InitiatedMethodParams,
  OptionalInitiator,
  QueryMethodParams,
  UpdateMethodParams,
} from "@/common/types/methods.js";
import { assertExists, assertValidId } from "@/common/utils/validation.js";
import type { CategoryRepository } from "@/modules/categories/category.repository.js";
import type { FavoriteRepository } from "@/modules/favorites/favorite.repository.js";
import { recipeCache } from "@/modules/recipes/recipe.cache.js";
import type { UserRepository } from "@/modules/users/user.repository.js";
import { toRecipe } from "./recipe.mapper.js";
import type { RecipeRepository } from "./recipe.repository.js";

export interface RecipeService {
  findAll(
    params: QueryMethodParams<RecipeQuery>,
  ): Promise<CachedResult<Paginated<RecipeWithComputed>>>;
  findById(
    id: string,
    params: InitiatedMethodParams<OptionalInitiator>,
  ): Promise<CachedResult<RecipeWithComputed>>;
  create(
    params: CreateMethodParams<CreateRecipeBody>,
  ): Promise<RecipeWithComputed>;
  update(
    id: string,
    params: UpdateMethodParams<UpdateRecipeBody>,
  ): Promise<RecipeWithComputed>;
  delete(id: string, params: DeleteMethodParams): Promise<void>;
}

type RecipeRepositoryPort = Pick<
  RecipeRepository,
  | "findDocumentById"
  | "create"
  | "save"
  | "deleteDocument"
  | "aggregateSearch"
  | "aggregateById"
>;
type UserRepositoryPort = Pick<UserRepository, "exists" | "modelName">;
type FavoriteRepositoryPort = Pick<FavoriteRepository, "exists">;
type CategoryRepositoryPort = Pick<CategoryRepository, "exists" | "modelName">;
type CacheServicePort = Pick<
  CacheService,
  "getOrSet" | "delete" | "deletePattern"
>;
type TypedEmitterPort = Pick<TypedEmitter, "emit">;

export function createRecipeService(
  repository: RecipeRepositoryPort,
  userRepository: UserRepositoryPort,
  favoriteRepository: FavoriteRepositoryPort,
  categoryRepository: CategoryRepositoryPort,
  cache: CacheServicePort,
  bus: TypedEmitterPort,
): RecipeService {
  return {
    findAll: async ({ query, initiator }) => {
      if (query.isFavorited === true && !initiator.id) {
        return {
          value: withPagination([], 0, query.page, query.limit),
          cache: {
            status: "bypass",
            reason: "not-applicable",
          },
        };
      }

      const canUseSharedCache = !initiator.id;
      const cacheKey = recipeCache.keys.list(query);

      const load = async () => {
        const [recipes, total] = await repository.aggregateSearch({
          query,
          initiator,
        });

        return withPagination(
          recipes.map((recipe) => toRecipe(recipe, recipe.isFavorited)),
          total,
          query.page,
          query.limit,
        );
      };

      if (!canUseSharedCache) {
        return {
          value: await load(),
          cache: {
            status: "bypass",
            reason: "authenticated",
          },
        };
      }

      return cache.getOrSet<Paginated<RecipeWithComputed>>(
        cacheKey,
        load,
        recipeCache.ttl.list,
      );
    },

    findById: async (id, { initiator }) => {
      assertValidId(id, "Recipe");

      const canUseSharedCache = !initiator.id;
      const cacheKey = recipeCache.keys.byId(id);

      const load = async () => {
        const recipe = await repository.aggregateById(id, {
          initiator,
        });
        if (!recipe) {
          throw new NotFoundError("Recipe not found");
        }

        return toRecipe(recipe, recipe.isFavorited);
      };

      if (!canUseSharedCache) {
        return {
          value: await load(),
          cache: {
            status: "bypass",
            reason: "authenticated",
          },
        };
      }

      return cache.getOrSet<RecipeWithComputed>(
        cacheKey,
        load,
        recipeCache.ttl.byId,
      );
    },

    create: async ({ data, initiator }) => {
      assertValidId(initiator.id, "Author");
      assertValidId(data.category, "Category");

      await assertExists(categoryRepository, data.category);
      await assertExists(userRepository, initiator.id);

      const recipe = await repository.create({
        ...data,
        author: initiator.id,
      });

      await cache.deletePattern(recipeCache.keys.listPattern());
      bus.emit("recipe:created", { recipeId: recipe._id.toHexString() });

      return toRecipe(recipe, false);
    },

    update: async (id, { data, initiator }) => {
      assertValidId(id, "Recipe");

      const recipe = await repository.findDocumentById<EmptyObject>(id, {
        populate: false,
      });
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(initiator.id) && initiator.role !== "admin") {
        throw new ForbiddenError("Not authorized to update this recipe");
      }

      const updated = await repository.save(recipe, data);
      const isFavorited = await favoriteRepository.exists({
        user: initiator.id,
        recipe: id,
      });

      await Promise.all([
        cache.delete(recipeCache.keys.byId(id)),
        cache.deletePattern(recipeCache.keys.listPattern()),
      ]);
      bus.emit("recipe:updated", { recipeId: id });

      return toRecipe(updated, isFavorited);
    },

    delete: async (id, { initiator }) => {
      assertValidId(id, "Recipe");
      const recipe = await repository.findDocumentById<EmptyObject>(id, {
        populate: false,
      });
      if (!recipe) {
        throw new NotFoundError("Recipe not found");
      }

      if (!recipe.author.equals(initiator.id) && initiator.role !== "admin") {
        throw new ForbiddenError("Not authorized to delete this recipe");
      }

      await repository.deleteDocument(recipe);

      await cache.delete(recipeCache.keys.byId(id));
      await cache.deletePattern(recipeCache.keys.listPattern());
      bus.emit("recipe:deleted", { recipeId: id });
    },
  };
}
