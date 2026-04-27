import type { CreateCommentBody } from "@recipes/shared";
import type { PipelineStage, QueryFilter } from "mongoose";
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
import { recipesCollectionName } from "@/modules/recipes/recipe.model.js";
import type {
  CommentDocument,
  CommentDocumentPopulated,
  CommentModelType,
} from "./comment.model.js";

export class CommentRepository {
  private model: CommentModelType;

  constructor(model: CommentModelType) {
    this.model = model;
  }

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

  async findById(id: string): Promise<CommentDocument | null> {
    return this.model.findById(id).lean();
  }

  async findOne(
    filter: QueryFilter<CommentDocument>,
  ): Promise<CommentDocument | null> {
    return this.model.findOne(filter).lean();
  }

  async create(
    data: CreateCommentBody & { recipe: string; author: string },
  ): Promise<Omit<CommentDocumentPopulated, "recipe">> {
    const comment = await this.model.create(data);

    return (
      await comment.populate({
        path: "author",
        select: "name email",
      })
    ).toObject<Omit<CommentDocumentPopulated, "recipe">>();
  }

  async delete(id: string): Promise<CommentDocument | null> {
    return this.model.findByIdAndDelete(id).lean();
  }

  async aggregate<T>(pipeline: PipelineStage[]): Promise<T[]> {
    return this.model.aggregate<T>(pipeline);
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
