import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard } from "@/common/middleware/auth.guard.js";
import { commentQuerySchema } from "@/modules/comments/index.js";
import { favoriteQuerySchema } from "@/modules/favorites/favorite.schema.js";
import type { UserService } from "@/modules/users/index.js";

export interface UserPluginOptions {
  service: UserService;
}

export const userRoutes: FastifyPluginAsync<UserPluginOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
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

        const user = await service.getCurrentUser(userId);
        return reply.send(user);
      },
    )
    .get(
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

        const result = await service.getFavorites(userId, request.query);
        return reply.send(result);
      },
    )
    .get(
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

        const result = await service.getComments(userId, request.query);
        return reply.send(result);
      },
    );
};
