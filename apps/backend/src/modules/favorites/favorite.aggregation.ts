import type { PipelineStage } from "mongoose";
import type { DefaultInitiator } from "@/common/types/methods.js";
import {
  byVisibility,
  withAuthor,
  withCategories,
} from "@/modules/recipes/index.js";

export function withRecipe(
  initiator: Partial<DefaultInitiator>,
): PipelineStage.FacetPipelineStage[] {
  return [
    {
      $lookup: {
        from: "recipes",
        localField: "recipe",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              ...byVisibility(initiator),
            },
          },
          { $unset: "__v" },
          ...withCategories(),
          ...withAuthor(),
        ],
        as: "recipe",
      },
    },
    { $unwind: { path: "$recipe" } },
  ];
}
