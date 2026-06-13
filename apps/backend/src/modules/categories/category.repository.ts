import type {
  CategoryComputed,
  CategoryQuery,
} from "@recipes/shared/categories";
import type { RequireKeys } from "@recipes/shared/core";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { PaginatedStageResult } from "@/common/utils/stages.js";
import stages, { extractPaginatedResult } from "@/common/utils/stages.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { CategoryDocument } from "./category.model.js";

export type CategoryCreateInput = RequireKeys<
  CreateInput<CategoryDocument>,
  "name"
>;
export type CategoryUpdateInput = UpdateInput<CategoryDocument>;

type CategoryDocumentListItem = Omit<
  CategoryDocument,
  "description" | "createdAt" | "updatedAt"
> &
  CategoryComputed;

export class CategoryRepository extends BaseRepository<
  CategoryDocument,
  CategoryCreateInput,
  CategoryUpdateInput
> {
  async findMany(
    query: CategoryQuery,
  ): Promise<[CategoryDocumentListItem[], number]> {
    const pipeline = [
      stages.lookup({
        from: recipesCollectionName,
        localField: "_id",
        foreignField: "category",
        as: "recipes",
      }),
      stages.addFields({ recipeCount: { $size: "$recipes" } }),
      stages.project({ recipes: 0 }),
      stages.paginated(
        {
          sort: query.sort,
          page: query.page,
          limit: query.limit,
        },
        stages.project({ description: 0, createdAt: 0, updatedAt: 0 }),
      ),
    ].flat();

    const result =
      await this.aggregate<PaginatedStageResult<CategoryDocumentListItem>>(
        pipeline,
      );

    return extractPaginatedResult(result);
  }
}
