import type { PipelineStage } from "mongoose";
import { Types } from "mongoose";

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
  const userOid = Types.ObjectId.createFromHexString(userId);

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

export function withSort(sort: string) {
  const sortName = sort.startsWith("-") ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith("-") ? -1 : 1;

  return [
    {
      $sort: { [sortName]: sortOrder },
    },
  ] satisfies PipelineStage[];
}

export function withPagination(page: number, limit: number) {
  return [
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ] satisfies PipelineStage[];
}
