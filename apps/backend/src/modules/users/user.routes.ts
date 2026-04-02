import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard } from "@/common/middleware/auth.guard.js";
import {
  CommentModel,
  commentQuerySchema,
  createCommentService,
} from "@/modules/comments/index.js";
import { favoriteQuerySchema } from "@/modules/favorites/favorite.schema.js";
import { RecipeModel } from "@/modules/recipes/recipe.model.js";
import { UserService } from "@/modules/users/user.service.js";
import { UserModel } from "./user.model.js";

const userService = new UserService(
  createCommentService(CommentModel, RecipeModel, UserModel),
);

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/me",
    {
      schema: {
        tags: ["Users"],
        summary: "Get current user",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const user = await userService.getCurrentUser(userId);
      return reply.send(user);
    },
  );

  fastify.get(
    "/me/favorites",
    {
      schema: {
        querystring: favoriteQuerySchema,
        tags: ["Users"],
        summary: "Get current user's favorite recipes",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const result = await userService.getFavorites(userId, request.query);
      return reply.send(result);
    },
  );

  fastify.get(
    "/me/comments",
    {
      schema: {
        querystring: commentQuerySchema,
        tags: ["Users"],
        summary: "Get current user's comments",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const result = await userService.getComments(userId, request.query);
      return reply.send(result);
    },
  );
}
