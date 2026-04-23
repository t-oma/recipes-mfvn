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
import { createCacheService } from "@/common/cache/create-cache.service.js";
import type { Logger } from "@/common/logger.js";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import { env } from "@/config/env.js";
import { createRateLimitOptions } from "@/config/rate-limit.js";
import { swaggerOptions, swaggerUiOptions } from "@/config/swagger.js";
import { authRoutes } from "@/modules/auth/auth.routes.js";
import { categoryRoutes } from "@/modules/categories/category.routes.js";
import { favoriteRoutes } from "@/modules/favorites/favorite.routes.js";
import { recipeRatingRoutes } from "@/modules/recipe-ratings/recipe-rating.routes.js";
import { recipeRoutes } from "@/modules/recipes/recipe.routes.js";
import { userRoutes } from "@/modules/users/user.routes.js";
import { createServices } from "./app.create-services.js";

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

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  const services = createServices(cache, log);

  // Routes
  app.register(authRoutes, {
    service: services.authService,
    prefix: "/api/auth",
  });
  app.register(userRoutes, {
    service: services.userService,
    prefix: "/api/users",
  });
  app.register(recipeRoutes, {
    service: services.recipeService,
    commentService: services.commentService,
    prefix: "/api/recipes",
  });
  app.register(favoriteRoutes, {
    service: services.favoriteService,
    prefix: "/api/recipes",
  });
  app.register(recipeRatingRoutes, {
    service: services.recipeRatingService,
    prefix: "/api/recipes",
  });
  app.register(categoryRoutes, {
    service: services.categoryService,
    prefix: "/api/categories",
  });

  app.addHook("onClose", async () => {
    await cache.close();
  });

  return app;
}
