import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import type { FavoriteService } from "@/modules/favorites/favorite.service.js";
import {
  parseRecipeRef,
  recipeParamsSchema,
} from "@/modules/recipes/recipe.routes.js";

export interface FavoriteModuleOptions {
  service: FavoriteService;
}

export const favoriteRoutes: FastifyPluginAsync<FavoriteModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/:ref/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: z.object({ favorited: z.boolean() }),
          },
          tags: ["Favorites"],
          summary: "Check if recipe is favorited",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const { id } = parseRecipeRef(request.params.ref);

        const favorited = await service.isFavorited(id, {
          initiator: { id: request.user.id, role: request.user.role },
        });

        return reply.send({ favorited });
      },
    )
    .post(
      "/:ref/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: z.object({ favorited: z.literal(true) }),
          },
          tags: ["Favorites"],
          summary: "Add recipe to favorites",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const { id } = parseRecipeRef(request.params.ref);

        const result = await service.add(id, {
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.send(result);
      },
    )
    .delete(
      "/:ref/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: z.object({ favorited: z.literal(false) }),
          },
          tags: ["Favorites"],
          summary: "Remove recipe from favorites",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const { id } = parseRecipeRef(request.params.ref);

        const result = await service.remove(id, {
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.send(result);
      },
    );
};
