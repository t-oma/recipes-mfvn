import { Worker } from "bullmq";
import type { Logger } from "@/common/logger.js";
import type { CommentModelType } from "@/modules/comments/comment.model.js";
import type { FavoriteModelType } from "@/modules/favorites/favorite.model.js";
import type { RecipeRatingModelType } from "@/modules/recipe-ratings/recipe-rating.model.js";
import type { RecipeModelType } from "@/modules/recipes/recipe.model.js";
import { rebuildRecipeStats } from "@/modules/recipes/recipe-stats.service.js";
import type { RebuildStatsJobData } from "./recipe-stats.queue.js";
import { RECIPE_STATS_QUEUE_NAME } from "./recipe-stats.queue.js";

export interface RecipeStatsWorkerDeps {
  recipeModel: RecipeModelType;
  favoriteModel: FavoriteModelType;
  commentModel: CommentModelType;
  recipeRatingModel: RecipeRatingModelType;
  log: Logger;
}

export function createRecipeStatsWorker(
  redisUrl: string,
  deps: RecipeStatsWorkerDeps,
) {
  const worker = new Worker<RebuildStatsJobData>(
    RECIPE_STATS_QUEUE_NAME,
    async () => {
      deps.log.info("Starting scheduled recipe stats rebuild...");
      const start = Date.now();

      await rebuildRecipeStats(
        deps.recipeModel,
        deps.favoriteModel,
        deps.commentModel,
        deps.recipeRatingModel,
      );

      const duration = Date.now() - start;
      deps.log.info({ durationMs: duration }, "Recipe stats rebuild completed");
    },
    { connection: { url: redisUrl } },
  );

  worker.on("failed", (job, err) => {
    deps.log.error(
      { err, jobId: job?.id, attempt: job?.attemptsMade },
      "Recipe stats rebuild job failed",
    );
  });

  return worker;
}
