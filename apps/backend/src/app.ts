import "dotenv/config";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import cacheHeadersPlugin from "@/common/cache/cache-headers.plugin.js";
import { createCacheService } from "@/common/cache/create-cache.service.js";
import { createEventBus } from "@/common/events.js";
import type { Logger } from "@/common/logger.js";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import { env } from "@/config/env.js";
import { createRateLimitOptions } from "@/config/rate-limit.js";
import { swaggerOptions, swaggerUiOptions } from "@/config/swagger.js";
import { authRoutes } from "@/modules/auth/auth.routes.js";
import { categoryRoutes } from "@/modules/categories/category.routes.js";
import { CommentModel } from "@/modules/comments/comment.model.js";
import { FavoriteModel } from "@/modules/favorites/favorite.model.js";
import { favoriteRoutes } from "@/modules/favorites/favorite.routes.js";
import { RecipeRatingModel } from "@/modules/recipe-ratings/recipe-rating.model.js";
import { recipeRatingRoutes } from "@/modules/recipe-ratings/recipe-rating.routes.js";
import {
  createRecipeStatsQueue,
  scheduleRecipeStatsRebuild,
} from "@/modules/recipes/jobs/recipe-stats.queue.js";
import { createRecipeStatsWorker } from "@/modules/recipes/jobs/recipe-stats.worker.js";
import { registerRecipeEventHandlers } from "@/modules/recipes/recipe.events.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { recipeRoutes } from "@/modules/recipes/recipe.routes.js";
import { reviewRoutes } from "@/modules/reviews/review.routes.js";
import { userRoutes } from "@/modules/users/user.routes.js";
import { createServices } from "./app.services.js";

export async function buildApp(log: Logger) {
  const app = Fastify({
    loggerInstance: log,
  });

  const cache = await createCacheService(
    {
      backend: env.CACHE_BACKEND,
      redis: env.REDIS_URL ? { url: env.REDIS_URL } : undefined,
    },
    app.log,
  );

  // Validation & serialization
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Error handling
  app.setErrorHandler(errorHandler);

  // CORS
  app.register(fastifyCors, { origin: true });

  // Security headers
  app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  // Rate limiting
  app.register(fastifyRateLimit, createRateLimitOptions());

  // Swagger
  app.register(fastifySwagger, swaggerOptions);
  app.register(fastifySwaggerUi, swaggerUiOptions);

  // Cache headers helpers
  app.register(cacheHeadersPlugin);

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  const bus = createEventBus();
  const services = createServices(cache, bus, log);

  registerRecipeEventHandlers(bus, services);

  let recipeStatsQueue: ReturnType<typeof createRecipeStatsQueue> | undefined;
  let recipeStatsWorker: ReturnType<typeof createRecipeStatsWorker> | undefined;

  if (env.REDIS_URL && (await isRedisAvailable(env.REDIS_URL))) {
    recipeStatsQueue = createRecipeStatsQueue(env.REDIS_URL);
    recipeStatsWorker = createRecipeStatsWorker(env.REDIS_URL, {
      recipeModel: RecipeModel,
      favoriteModel: FavoriteModel,
      commentModel: CommentModel,
      recipeRatingModel: RecipeRatingModel,
      log,
    });

    await scheduleRecipeStatsRebuild(
      recipeStatsQueue,
      env.REBUILD_STATS_CRON,
      log,
    );
  } else {
    log.warn(
      "Redis unavailable — background jobs (recipe stats rebuild) disabled",
    );
  }

  // Routes
  app.register(authRoutes, {
    service: services.auth,
    prefix: "/api/auth",
  });
  app.register(userRoutes, {
    service: services.user,
    prefix: "/api/users",
  });
  app.register(recipeRoutes, {
    service: services.recipe,
    commentService: services.comment,
    prefix: "/api/recipes",
  });
  app.register(favoriteRoutes, {
    service: services.favorite,
    prefix: "/api/recipes",
  });
  app.register(recipeRatingRoutes, {
    service: services.recipeRating,
    prefix: "/api/recipes",
  });
  app.register(categoryRoutes, {
    service: services.category,
    prefix: "/api/categories",
  });
  app.register(reviewRoutes, {
    service: services.review,
    prefix: "/api/reviews",
  });

  app.addHook("onClose", async () => {
    if (recipeStatsWorker) {
      await recipeStatsWorker.close();
    }
    if (recipeStatsQueue) {
      await recipeStatsQueue.close();
    }
    await cache.close();
  });

  return app;
}

async function isRedisAvailable(
  url: string,
  timeoutMs = 2000,
): Promise<boolean> {
  const { Redis } = await import("ioredis");
  const redis = new Redis(url, { lazyConnect: true });

  try {
    await Promise.race([
      redis.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs),
      ),
    ]);

    await redis.ping();
    return true;
  } catch {
    return false;
  } finally {
    await redis.quit().catch(() => {});
  }
}
