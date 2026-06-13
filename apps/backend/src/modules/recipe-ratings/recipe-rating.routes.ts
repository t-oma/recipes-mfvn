import { recipeRatingInputSchema } from "@recipes/shared/recipe-rating";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import type { RecipeRatingService } from "@/modules/recipe-ratings/recipe-rating.service.js";
import {
  parseRecipeRef,
  recipeParamsSchema,
} from "@/modules/recipes/recipe.routes.js";

export interface RecipeRatingModuleOptions {
  service: RecipeRatingService;
}

export const recipeRatingRoutes: FastifyPluginAsync<
  RecipeRatingModuleOptions
> = async (fastify, { service }) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .put(
      "/:ref/rating",
      {
        schema: {
          params: recipeParamsSchema,
          body: recipeRatingInputSchema,
          response: {
            200: z.object({ value: z.number().int().min(1).max(5) }),
          },
          tags: ["Ratings"],
          summary: "Rate a recipe",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const { id } = parseRecipeRef(request.params.ref);

        const result = await service.rate(id, {
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.send(result);
      },
    )
    .delete(
      "/:ref/rating",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            204: z.void(),
          },
          tags: ["Ratings"],
          summary: "Remove rating from recipe",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const { id } = parseRecipeRef(request.params.ref);

        await service.remove(id, {
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(204).send();
      },
    );
};
