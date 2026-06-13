import { paginatedSchema } from "@recipes/shared/core";
import {
  createCuisineInputSchema,
  cuisineDetailsSchema,
  cuisineListItemSchema,
  cuisineQuerySchema,
} from "@recipes/shared/cuisines";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import { rolesGuard } from "@/common/middleware/role.guard.js";
import { idParamSchema } from "@/common/schemas.js";
import type { CuisineService } from "./cuisine.service.js";

export interface CuisineModuleOptions {
  service: CuisineService;
}

export const cuisineRoutes: FastifyPluginAsync<CuisineModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/",
      {
        schema: {
          querystring: cuisineQuerySchema,
          response: {
            200: paginatedSchema(cuisineListItemSchema),
          },
          tags: ["Cuisines"],
          summary: "Get all cuisines with pagination",
        },
      },
      async (request, reply) => {
        const { value, cache } = await service.findAll({
          query: request.query,
          initiator: { id: request.user?.id, role: request.user?.role },
        });

        reply.applyCacheHeaders(cache);
        return reply.send(value);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createCuisineInputSchema,
          response: {
            201: cuisineDetailsSchema,
          },
          tags: ["Cuisines"],
          summary: "Create a cuisine",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const cuisine = await service.create({
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(201).send(cuisine);
      },
    )
    .delete(
      "/:id",
      {
        schema: {
          params: z.object({ id: idParamSchema }),
          tags: ["Cuisines"],
          summary: "Delete a cuisine",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        await service.deleteById(request.params.id, {
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(204).send();
      },
    );
};
