import type { PipelineStage } from "mongoose";
import type { OptionalInitiator } from "@/common/types/methods.js";
import { toObjectId } from "@/common/utils/mongo.js";
import { categoriesCollectionName } from "@/modules/categories/category.model.js";
import { favoritesCollectionName } from "@/modules/favorites/favorite.model.js";
import { recipeRatingsCollectionName } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { usersCollectionName } from "@/modules/users/user.model.js";

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
        from: categoriesCollectionName,
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
        from: usersCollectionName,
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
        from: favoritesCollectionName,
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

export function withUserRating(userId?: string) {
  if (!userId) {
    return [
      {
        $addFields: {
          userRating: null,
        },
      },
    ] satisfies PipelineStage[];
  }
  const userOid = toObjectId(userId);

  return [
    {
      $lookup: {
        from: recipeRatingsCollectionName,
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
              value: 1,
            },
          },
        ],
        as: "userRatingDoc",
      },
    },
    { $unwind: { path: "$userRatingDoc", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        userRating: "$userRatingDoc.value",
      },
    },
    { $unset: "userRatingDoc" },
  ] satisfies PipelineStage[];
}

export function withAverageRating() {
  return [
    {
      $lookup: {
        from: recipeRatingsCollectionName,
        localField: "_id",
        foreignField: "recipe",
        pipeline: [
          {
            $group: {
              _id: null,
              avg: { $avg: "$value" },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              avg: { $round: ["$avg", 1] },
              count: 1,
            },
          },
        ],
        as: "ratingStats",
      },
    },
    { $unwind: { path: "$ratingStats", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        averageRating: "$ratingStats.avg",
        ratingCount: { $ifNull: ["$ratingStats.count", 0] },
      },
    },
    { $unset: "ratingStats" },
  ] satisfies PipelineStage[];
}
