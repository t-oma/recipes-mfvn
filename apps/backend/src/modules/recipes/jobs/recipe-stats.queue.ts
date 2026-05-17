import { Queue } from "bullmq";

export const RECIPE_STATS_QUEUE_NAME = "recipe-stats-rebuild";

export type RebuildStatsJobData = Record<never, never>;

export function createRecipeStatsQueue(redisUrl: string) {
  return new Queue<RebuildStatsJobData>(RECIPE_STATS_QUEUE_NAME, {
    connection: { url: redisUrl },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 5 },
    },
  });
}

const SCHEDULER_ID = "recipe-stats-rebuild-scheduler";

export async function scheduleRecipeStatsRebuild(
  queue: Queue<RebuildStatsJobData>,
  cron: string,
  log: {
    info: (obj: unknown, msg: string) => void;
    error: (obj: unknown, msg: string) => void;
  },
) {
  await queue.upsertJobScheduler(
    SCHEDULER_ID,
    { pattern: cron },
    {
      name: "rebuild-stats",
      data: {},
      opts: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 5 },
      },
    },
  );

  log.info({ cron }, "Scheduled recipe stats rebuild job");
}
