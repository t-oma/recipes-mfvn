import {
  commentDetailsSchema,
  commentQuerySchema,
  createCommentInputSchema,
  createRecipeInputSchema,
  paginatedSchema,
  recipeDetailsSchema,
  recipeListItemSchema,
  recipeQuerySchema,
  updateRecipeInputSchema,
} from "@recipes/shared";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  assertAuthenticated,
  authGuard,
  optionalAuth,
} from "@/common/middleware/auth.guard.js";
import { commentParamsSchema } from "@/modules/comments/comment.schema.js";
import type { CommentService } from "@/modules/comments/comment.service.js";
import { recipeParamsSchema } from "@/modules/recipes/recipe.schema.js";
import type { RecipeService } from "@/modules/recipes/recipe.service.js";

export interface RecipeModuleOptions {
  service: RecipeService;
  commentService: CommentService;
}

export const recipeRoutes: FastifyPluginAsync<RecipeModuleOptions> = async (
  fastify,
  { service, commentService },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/",
      {
        schema: {
          querystring: recipeQuerySchema,
          response: {
            200: paginatedSchema(recipeListItemSchema),
          },
          tags: ["Recipes"],
          summary: "Get all recipes with pagination",
        },
        onRequest: optionalAuth,
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
    .get(
      "/:id",
      {
        schema: {
          params: recipeParamsSchema,
          response: {
            200: recipeDetailsSchema,
          },
          tags: ["Recipes"],
          summary: "Get recipe by ID",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const { value, cache } = await service.findById(request.params.id, {
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
          body: createRecipeInputSchema,
          response: {
            201: recipeDetailsSchema,
          },
          tags: ["Recipes"],
          summary: "Create a recipe",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const recipe = await service.create({
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(201).send(recipe);
      },
    )
    .patch(
      "/:id",
      {
        schema: {
          params: recipeParamsSchema,
          body: updateRecipeInputSchema,
          response: {
            200: recipeDetailsSchema,
          },
          tags: ["Recipes"],
          summary: "Update a recipe",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const recipe = await service.update(request.params.id, {
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.send(recipe);
      },
    )
    .delete(
      "/:id",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Delete a recipe",
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
    )
    .get(
      "/:id/comments",
      {
        schema: {
          params: recipeParamsSchema,
          querystring: commentQuerySchema,
          response: {
            200: paginatedSchema(commentDetailsSchema),
          },
          tags: ["Recipes"],
          summary: "Get comments for a recipe",
        },
        onRequest: optionalAuth,
      },
      async (request, reply) => {
        const result = await commentService.findByRecipe(request.params.id, {
          query: request.query,
          initiator: { id: request.user?.id, role: request.user?.role },
        });
        return reply.send(result);
      },
    )
    .post(
      "/:id/comments",
      {
        schema: {
          params: recipeParamsSchema,
          body: createCommentInputSchema,
          response: {
            201: commentDetailsSchema,
          },
          tags: ["Recipes"],
          summary: "Create a comment",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        const comment = await commentService.create(request.params.id, {
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(201).send(comment);
      },
    )
    .delete(
      "/comments/:id",
      {
        schema: {
          params: commentParamsSchema,
          tags: ["Recipes"],
          summary: "Delete a comment",
          security: [{ bearerAuth: [] }],
        },
        onRequest: authGuard,
      },
      async (request, reply) => {
        assertAuthenticated(request);

        await commentService.delete(request.params.id, {
          initiator: { id: request.user.id, role: request.user.role },
        });
        return reply.status(204).send();
      },
    );
};
