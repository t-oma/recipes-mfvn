import { Queue } from "bullmq";

export const RECIPE_STATS_QUEUE_NAME = "recipe-stats-rebuild";

export type RebuildStatsJobData = Record<string, never>;

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

export async function scheduleRecipeStatsRebuild(
  queue: Queue<RebuildStatsJobData>,
  cron: string,
  log: {
    info: (obj: unknown, msg: string) => void;
    error: (obj: unknown, msg: string) => void;
  },
) {
  const repeatableJobs = await queue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await queue.removeRepeatableByKey(job.key);
  }

  await queue.add(
    "rebuild-stats",
    {},
    {
      repeat: { pattern: cron },
      jobId: "rebuild-stats-scheduled",
    },
  );

  log.info({ cron }, "Scheduled recipe stats rebuild job");
}
