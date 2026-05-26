import type {
  CreateCuisineInput,
  CuisineDetails,
  CuisineListItem,
  CuisineQuery,
  Paginated,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type {
  CachedResult,
  CacheService,
} from "@/common/cache/cache.service.js";
import type { TypedEmitter } from "@/common/events.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { assertValidId } from "@/common/utils/validation.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import { cuisineCache } from "./cuisine.cache.js";
import { toCuisineDetails, toCuisineListItem } from "./cuisine.mapper.js";
import type { CuisineRepository } from "./cuisine.repository.js";

export interface CuisineService {
  findAll(
    params: QueryMethodParams<CuisineQuery>,
  ): Promise<CachedResult<Paginated<CuisineListItem>>>;
  create(
    params: CreateMethodParams<CreateCuisineInput>,
  ): Promise<CuisineDetails>;
  deleteById(id: string, params: DeleteMethodParams): Promise<void>;
}

type CuisineRepositoryPort = Pick<
  CuisineRepository,
  "findMany" | "create" | "delete" | "findById"
>;
type RecipeRepositoryPort = Pick<RecipeRepository, "count">;
type CacheServicePort = Pick<
  CacheService,
  "getOrSet" | "delete" | "deletePattern"
>;
type TypedEmitterPort = Pick<TypedEmitter, "emit">;

export function createCuisineService(
  repository: CuisineRepositoryPort,
  recipeRepository: RecipeRepositoryPort,
  cache: CacheServicePort,
  bus: TypedEmitterPort,
): CuisineService {
  return {
    findAll: async ({ query }) => {
      const cacheKey = cuisineCache.keys.list(query);

      return cache.getOrSet<Paginated<CuisineListItem>>(
        cacheKey,
        async () => {
          const [cuisines, total] = await repository.findMany(query);
          return withPagination(
            cuisines.map((c) => toCuisineListItem(c)),
            total,
            query.page,
            query.limit,
          );
        },
        cuisineCache.ttl.list,
      );
    },

    create: async ({ data }) => {
      const cuisine = await repository.create(data);

      await cache.deletePattern(cuisineCache.keys.listPattern());
      bus.emit("cuisine:created", {
        cuisineId: cuisine._id.toHexString(),
      });

      return toCuisineDetails(cuisine);
    },

    deleteById: async (id, _params) => {
      assertValidId(id, "Cuisine");

      const cuisine = await repository.findById(id);
      if (!cuisine) {
        return;
      }

      const recipeCount = await recipeRepository.count({ cuisine: id });
      if (recipeCount > 0) {
        throw new Error("Cannot delete cuisine with associated recipes");
      }

      await repository.delete(id);

      await cache.deletePattern(cuisineCache.keys.listPattern());
      bus.emit("cuisine:deleted", { cuisineId: id });
    },
  };
}
