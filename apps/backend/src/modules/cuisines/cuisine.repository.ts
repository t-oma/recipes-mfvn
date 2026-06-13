import type { RequireKeys } from "@recipes/shared/core";
import type { CuisineComputed, CuisineQuery } from "@recipes/shared/cuisines";
import type {
  CreateInput,
  TimestampKeys,
  UpdateInput,
} from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { PaginatedStageResult } from "@/common/utils/stages.js";
import stages, { extractPaginatedResult } from "@/common/utils/stages.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { CuisineDocument } from "./cuisine.model.js";

export type CuisineCreateInput = RequireKeys<
  CreateInput<Omit<CuisineDocument, TimestampKeys>>,
  "name"
>;
export type CuisineUpdateInput = UpdateInput<CuisineDocument>;

type CuisineDocumentListItem = Omit<
  CuisineDocument,
  "description" | "createdAt" | "updatedAt"
> &
  CuisineComputed;

export class CuisineRepository extends BaseRepository<
  CuisineDocument,
  CuisineCreateInput,
  CuisineUpdateInput
> {
  async findMany(
    query: CuisineQuery,
  ): Promise<[CuisineDocumentListItem[], number]> {
    const pipeline = [
      stages.lookup({
        from: recipesCollectionName,
        localField: "_id",
        foreignField: "cuisine",
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
      await this.aggregate<PaginatedStageResult<CuisineDocumentListItem>>(
        pipeline,
      );

    return extractPaginatedResult(result);
  }
}
