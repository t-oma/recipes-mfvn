import type {
  CategoryDetails,
  CategoryListItem,
  CategoryQuery,
  CreateCategoryInput,
  Paginated,
} from "@recipes/shared";
import { withPagination } from "@recipes/shared";
import type {
  CachedGetResult,
  CacheService,
} from "@/common/cache/cache.service.js";
import { ConflictError, NotFoundError } from "@/common/errors.js";
import type { TypedEmitter } from "@/common/events.js";
import type {
  CreateMethodParams,
  DeleteMethodParams,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { categoryCache } from "@/modules/categories/category.cache.js";
import type { CategoryRepository } from "@/modules/categories/category.repository.js";
import type { RecipeRepository } from "@/modules/recipes/recipe.repository.js";
import { toCategoryDetails, toCategoryListItem } from "./category.mapper.js";

export interface CategoryService {
  findAll(
    params: QueryMethodParams<CategoryQuery>,
  ): Promise<CachedGetResult<Paginated<CategoryListItem>>>;
  create(
    params: CreateMethodParams<CreateCategoryInput>,
  ): Promise<CategoryDetails>;
  deleteById(id: string, params: DeleteMethodParams): Promise<void>;
}

type CategoryRepositoryPort = Pick<
  CategoryRepository,
  "findMany" | "create" | "delete"
>;
type RecipeRepositoryPort = Pick<RecipeRepository, "count">;
type CacheServicePort = Pick<CacheService, "getOrSet" | "deletePattern">;
type TypedEmitterPort = Pick<TypedEmitter, "emit">;

export function createCategoryService(
  repository: CategoryRepositoryPort,
  recipeRepository: RecipeRepositoryPort,
  cache: CacheServicePort,
  bus: TypedEmitterPort,
): CategoryService {
  return {
    findAll: async ({ query }) => {
      const cacheKey = categoryCache.keys.list(query);

      return cache.getOrSet<Paginated<CategoryListItem>>(
        cacheKey,
        async () => {
          const [categories, total] = await repository.findMany(query);

          return withPagination(
            categories.map(toCategoryListItem),
            total,
            query.page,
            query.limit,
          );
        },
        categoryCache.ttl.list,
      );
    },

    create: async ({ data }) => {
      const category = await repository.create(data);

      await cache.deletePattern(categoryCache.keys.allPattern());
      bus.emit("category:created", { categoryId: category._id.toHexString() });

      return toCategoryDetails(category);
    },

    deleteById: async (id) => {
      const recipeCount = await recipeRepository.count({
        category: id,
      });
      if (recipeCount > 0) {
        throw new ConflictError("Cannot delete category with existing recipes");
      }

      const result = await repository.delete(id);
      if (!result) {
        throw new NotFoundError("Category not found");
      }

      await cache.deletePattern(categoryCache.keys.allPattern());
      bus.emit("category:deleted", { categoryId: id });
    },
  };
}
