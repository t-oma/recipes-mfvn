import type { PipelineStage } from "mongoose";
import type { DefaultInitiator } from "@/common/types/methods.js";
import { byVisibility } from "@/modules/recipes/index.js";

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
