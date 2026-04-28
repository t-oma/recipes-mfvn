import type { CreateCommentBody } from "@recipes/shared";
import type { PipelineStage } from "mongoose";
import type { PopulateKeys } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type {
  OptionalInitiator,
  QueryMethodParams,
} from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import type { WithTotalCountResult } from "@/common/utils/mongoose.aggregation.js";
import {
  extractTotalCountResult,
  withPagination,
  withSort,
  withTotalCount,
} from "@/common/utils/mongoose.aggregation.js";
import {
  byVisibility,
  withAuthor,
} from "@/modules/recipes/recipe.aggregation.js";
import type { RecipeDocument } from "@/modules/recipes/recipe.model.js";
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type { UserDocument } from "@/modules/users/user.model.js";
import type {
  CommentDocument,
  CommentDocumentPopulated,
} from "./comment.model.js";

export class CommentRepository extends BaseRepository<CommentDocument> {
  async findByRecipe(
    recipeId: string,
    { query, initiator }: QueryMethodParams,
  ): Promise<[CommentDocumentPopulated[], number]> {
    const result = await this.aggregate<
      WithTotalCountResult<CommentDocumentPopulated>
    >([
      {
        $match: {
          recipe: toObjectId(recipeId),
        },
      },
      { $unset: "__v" },
      ...withAuthor(),
      ...withRecipe(initiator),
      ...withTotalCount(
        ...withSort("-createdAt"),
        ...withPagination(query.page, query.limit),
      ),
    ]);

    return extractTotalCountResult(result);
  }

  async findByAuthor(
    authorId: string,
    { query, initiator }: QueryMethodParams,
  ): Promise<[CommentDocumentPopulated[], number]> {
    const result = await this.aggregate<
      WithTotalCountResult<CommentDocumentPopulated>
    >([
      {
        $match: {
          author: toObjectId(authorId),
        },
      },
      { $unset: "__v" },
      ...withAuthor(),
      ...withRecipe(initiator),
      ...withTotalCount(
        ...withSort("-createdAt"),
        ...withPagination(query.page, query.limit),
      ),
    ]);

    return extractTotalCountResult(result);
  }

  override async create<
    TPopulate extends PopulateKeys<CommentDocument> = {
      author: Pick<UserDocument, "_id" | "name" | "email">;
      recipe: Pick<RecipeDocument, "_id" | "title">;
    },
  >(
    data: CreateCommentBody & {
      recipe: string;
      author: string;
    },
  ) {
    return super.create<TPopulate>(data);
  }
}

function withRecipe(
  initiator: OptionalInitiator,
): PipelineStage.FacetPipelineStage[] {
  return [
    {
      $lookup: {
        from: recipesCollectionName,
        localField: "recipe",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              ...byVisibility(initiator),
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
            },
          },
        ],
        as: "recipe",
      },
    },
    { $unwind: { path: "$recipe" } },
  ];
}
