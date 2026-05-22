import {
  createReviewInputSchema,
  paginatedSchema,
  reviewDetailsSchema,
  reviewQuerySchema,
  reviewsStatsSchema,
  updateReviewInputSchema,
} from "@recipes/shared";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  assertAuthenticated,
  authGuard,
} from "@/common/middleware/auth.guard.js";
import { rolesGuard } from "@/common/middleware/role.guard.js";
import { idParamSchema } from "@/common/schemas.js";
import type { ReviewService } from "@/modules/reviews/review.service.js";

export interface ReviewModuleOptions {
  service: ReviewService;
}

export const reviewRoutes: FastifyPluginAsync<ReviewModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/testimonials",
      {
        schema: {
          response: {
            200: z.array(reviewDetailsSchema),
          },
          tags: ["Reviews"],
          summary: "Get featured testimonials",
        },
      },
      async (_request, reply) => {
        const { value, cache } = await service.findFeatured();
        reply.applyCacheHeaders(cache);
        return reply.send(value);
      },
    )
    .get(
      "/stats",
      {
        schema: {
          response: {
            200: reviewsStatsSchema,
          },
          tags: ["Reviews"],
          summary: "Get review statistics",
        },
      },
      async (_request, reply) => {
        const { value, cache } = await service.getStats();
        reply.applyCacheHeaders(cache);
        return reply.send(value);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createReviewInputSchema,
          response: {
            201: reviewDetailsSchema,
          },
          tags: ["Reviews"],
          summary: "Create a review",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const review = await service.create({
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(201).send(review);
      },
    )
    .get(
      "/",
      {
        schema: {
          querystring: reviewQuerySchema,
          response: {
            200: paginatedSchema(reviewDetailsSchema),
          },
          tags: ["Reviews"],
          summary: "Get all reviews",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const result = await service.findAll({
          query: request.query,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.send(result);
      },
    )
    .patch(
      "/:id",
      {
        schema: {
          params: z.object({ id: idParamSchema }),
          body: updateReviewInputSchema,
          response: {
            200: reviewDetailsSchema,
          },
          tags: ["Reviews"],
          summary: "Update a review",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const review = await service.update(request.params.id, {
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.send(review);
      },
    )
    .patch(
      "/:id/feature",
      {
        schema: {
          params: z.object({ id: idParamSchema }),
          body: z.object({ isFeatured: z.boolean() }),
          response: {
            200: reviewDetailsSchema,
          },
          tags: ["Reviews"],
          summary: "Feature or unfeature a review",
          security: [{ bearerAuth: [] }],
        },
        onRequest: [authGuard, rolesGuard("admin")],
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const review = await service.feature(
          request.params.id,
          {
            initiator: { id: request.user.id, role: request.user.role },
          },
          request.body.isFeatured,
        );
        return reply.send(review);
      },
    )
    .delete(
      "/:id",
      {
        schema: {
          params: z.object({ id: idParamSchema }),
          tags: ["Reviews"],
          summary: "Delete a review",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        await service.delete(request.params.id, {
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(204).send();
      },
    );
};
