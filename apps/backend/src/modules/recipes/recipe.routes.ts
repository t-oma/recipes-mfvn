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
import { isObjectIdOrHexString } from "mongoose";
import { z } from "zod";
import { BadRequestError } from "@/common/errors.js";
import {
  assertAuthenticated,
  authGuard,
  optionalAuth,
} from "@/common/middleware/auth.guard.js";
import { commentParamsSchema } from "@/modules/comments/comment.schema.js";
import type { CommentService } from "@/modules/comments/comment.service.js";
import type { RecipeService } from "@/modules/recipes/recipe.service.js";

export interface RecipeModuleOptions {
  service: RecipeService;
  commentService: CommentService;
}

export const recipeParamsSchema = z.object({
  ref: z.string().trim().min(24),
});

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
      "/:ref",
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
        const { id } = parseRecipeRef(request.params.ref);

        const { value, cache } = await service.findById(id, {
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
      "/:ref",
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

        const { id } = parseRecipeRef(request.params.ref);

        const recipe = await service.update(id, {
          data: request.body,
          initiator: { id: request.user.id, role: request.user.role },
        });

        return reply.send(recipe);
      },
    )
    .delete(
      "/:ref",
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

        const { id } = parseRecipeRef(request.params.ref);

        await service.delete(id, {
          initiator: { id: request.user.id, role: request.user.role },
        });

        return reply.status(204).send();
      },
    )
    .get(
      "/:ref/comments",
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
        const { id } = parseRecipeRef(request.params.ref);

        const result = await commentService.findByRecipe(id, {
          query: request.query,
          initiator: { id: request.user?.id, role: request.user?.role },
        });
        return reply.send(result);
      },
    )
    .post(
      "/:ref/comments",
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

        const { id } = parseRecipeRef(request.params.ref);

        const comment = await commentService.create(id, {
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

export function parseRecipeRef(input: string) {
  const id = input.slice(0, 24);

  if (!isObjectIdOrHexString(id)) {
    throw new BadRequestError("Invalid recipe id");
  }

  const rest = input.slice(24);
  const slug = rest.startsWith("-") ? rest.slice(1) : null;

  return {
    id,
    slug: slug || null,
  };
}
