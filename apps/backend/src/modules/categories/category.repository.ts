import type { CategoryQuery } from "@recipes/shared";
import { BaseRepository } from "@/common/base.repository.js";
import { withSort } from "@/common/utils/mongoose.aggregation.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { CategoryDocument } from "./category.model.js";

export type RecipeCount = {
  recipeCount: number;
};

export class CategoryRepository extends BaseRepository<CategoryDocument> {
  async findMany(
    query: CategoryQuery,
  ): Promise<(CategoryDocument & RecipeCount)[]> {
    return this.aggregate<CategoryDocument & RecipeCount>([
      {
        $lookup: {
          from: recipesCollectionName,
          localField: "_id",
          foreignField: "category",
          as: "recipes",
        },
      },
      { $addFields: { recipeCount: { $size: "$recipes" } } },
      { $project: { recipes: 0 } },
      ...withSort(query.sort),
    ]);
  }
}
