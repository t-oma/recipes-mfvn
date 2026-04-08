import type { PipelineStage } from "mongoose";
import type { OptionalInitiator } from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";

export function byVisibility({ id, role }: OptionalInitiator) {
  if (role === "admin") {
    return {};
  }

  if (id) {
    return {
      $or: [{ isPublic: true }, { author: toObjectId(id) }],
    };
  }

  return { isPublic: true };
}

export function withCategories() {
  return [
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
            },
          },
        ],
        as: "category",
      },
    },
    { $unwind: "$category" },
  ] satisfies PipelineStage[];
}

export function withAuthor() {
  return [
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
        as: "author",
      },
    },
    { $unwind: "$author" },
  ] satisfies PipelineStage[];
}

export function withFavorited(userId?: string) {
  if (!userId) {
    return [
      {
        $addFields: {
          isFavorited: false,
        },
      },
    ] satisfies PipelineStage[];
  }
  const userOid = toObjectId(userId);

  return [
    {
      $lookup: {
        from: "favorites",
        localField: "_id",
        foreignField: "recipe",
        pipeline: [
          {
            $match: {
              user: userOid,
            },
          },
          {
            $project: {
              _id: 0,
              user: 1,
            },
          },
        ],
        as: "favoritedBy",
      },
    },
    { $unwind: { path: "$favoritedBy", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        isFavorited: {
          $eq: ["$favoritedBy.user", userOid],
        },
      },
    },
    { $unset: "favoritedBy" },
  ] satisfies PipelineStage[];
}
