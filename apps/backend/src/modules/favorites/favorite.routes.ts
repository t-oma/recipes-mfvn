import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard, optionalAuth } from "@/common/middleware/auth.guard.js";
import { favoriteParamsSchema } from "@/modules/favorites/favorite.schema.js";
import { FavoriteService } from "@/modules/favorites/favorite.service.js";

const favoriteService = new FavoriteService();

export async function favoriteRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/recipes/:id/favorite — toggle favorite
  fastify.post(
    "/recipes/:id/favorite",
    {
      schema: {
        params: favoriteParamsSchema,
        tags: ["Favorites"],
        summary: "Toggle favorite for a recipe",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.status(401).send({ error: "Not authorized" });
      }

      const result = await favoriteService.toggle(userId, request.params.id);
      return reply.send(result);
    },
  );

  // GET /api/recipes/:id/favorite — check if favorited
  fastify.get(
    "/recipes/:id/favorite",
    {
      schema: {
        params: favoriteParamsSchema,
        tags: ["Favorites"],
        summary: "Check if recipe is favorited",
      },
      preHandler: optionalAuth,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      if (!userId) {
        return reply.send({ favorited: false });
      }

      const favorited = await favoriteService.isFavorited(
        userId,
        request.params.id,
      );
      return reply.send({ favorited });
    },
  );
}
