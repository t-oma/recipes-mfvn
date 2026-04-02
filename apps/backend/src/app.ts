import "dotenv/config";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import { env } from "@/config/env.js";
import { swaggerOptions, swaggerUiOptions } from "@/config/swagger.js";
import { authRoutes, createAuthService } from "@/modules/auth/index.js";
import {
  CategoryModel,
  categoryRoutes,
  createCategoryService,
} from "@/modules/categories/index.js";
import {
  CommentModel,
  createCommentService,
} from "@/modules/comments/index.js";
import {
  createUserService,
  UserModel,
  userRoutes,
} from "@/modules/users/index.js";
import { FavoriteService } from "./modules/favorites/favorite.service.js";
import { RecipeModel } from "./modules/recipes/recipe.model.js";
import { recipeRoutes } from "./modules/recipes/recipe.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // Validation & serialization
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Error handling
  app.setErrorHandler(errorHandler);

  // CORS
  app.register(fastifyCors, { origin: true });

  // Swagger
  app.register(fastifySwagger, swaggerOptions);
  app.register(fastifySwaggerUi, swaggerUiOptions);

  // Health check
  app.get("/health", async () => ({ status: "ok" }));

  // Routes
  app.register(authRoutes, {
    service: createAuthService(UserModel),
    prefix: "/api/auth",
  });
  app.register(userRoutes, {
    service: createUserService(
      createCommentService(CommentModel, RecipeModel, UserModel),
      new FavoriteService(),
      UserModel,
    ),
    prefix: "/api/users",
  });
  app.register(recipeRoutes, { prefix: "/api/recipes" });
  app.register(categoryRoutes, {
    service: createCategoryService(CategoryModel),
    prefix: "/api/categories",
  });

  return app;
}
