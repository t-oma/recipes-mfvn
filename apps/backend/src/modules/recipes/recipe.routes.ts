import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard, optionalAuth } from "@/common/middleware/auth.guard.js";
import type { CommentService } from "@/modules/comments/index.js";
import {
  commentParamsSchema,
  commentQuerySchema,
  createCommentSchema,
} from "@/modules/comments/index.js";
import type { FavoriteService } from "@/modules/favorites/index.js";
import type { RecipeService } from "@/modules/recipes/index.js";
import {
  createRecipeSchema,
  recipeParamsSchema,
  recipeQuerySchema,
  updateRecipeSchema,
} from "@/modules/recipes/index.js";

export interface RecipePluginOptions {
  service: RecipeService;
  favoriteService: FavoriteService;
  commentService: CommentService;
}

export const recipeRoutes: FastifyPluginAsync<RecipePluginOptions> = async (
  fastify,
  { service, favoriteService, commentService },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/",
      {
        schema: {
          querystring: recipeQuerySchema,
          tags: ["Recipes"],
          summary: "Get all recipes with pagination",
        },
        preHandler: optionalAuth,
      },
      async (request, reply) => {
        const result = await service.findAll(
          request.query,
          request.user?.userId,
        );
        return reply.send(result);
      },
    )
    .get(
      "/:recipeId",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Get recipe by ID",
        },
        preHandler: optionalAuth,
      },
      async (request, reply) => {
        const recipe = await service.findById(
          request.params.recipeId,
          request.user?.userId,
        );
        return reply.send(recipe);
      },
    )
    .post(
      "/",
      {
        schema: {
          body: createRecipeSchema,
          tags: ["Recipes"],
          summary: "Create a recipe",
          security: [{ bearerAuth: [] }],
        },
        preHandler: authGuard,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: "Not authorized" });
        }

        const recipe = await service.create(request.body, userId);
        return reply.status(201).send(recipe);
      },
    )
    .patch(
      "/:recipeId",
      {
        schema: {
          params: recipeParamsSchema,
          body: updateRecipeSchema,
          tags: ["Recipes"],
          summary: "Update a recipe",
          security: [{ bearerAuth: [] }],
        },
        preHandler: authGuard,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: "Not authorized" });
        }

        const recipe = await service.update(
          request.params.recipeId,
          request.body,
          userId,
        );
        return reply.send(recipe);
      },
    )
    .delete(
      "/:recipeId",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Delete a recipe",
          security: [{ bearerAuth: [] }],
        },
        preHandler: authGuard,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: "Not authorized" });
        }

        await service.delete(request.params.recipeId, userId);
        return reply.status(204).send();
      },
    )
    .post(
      "/:recipeId/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Add recipe to favorites",
          security: [{ bearerAuth: [] }],
        },
        preHandler: authGuard,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: "Not authorized" });
        }

        const result = await favoriteService.add(
          userId,
          request.params.recipeId,
        );
        return reply.send(result);
      },
    )
    .delete(
      "/:recipeId/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
          summary: "Remove recipe from favorites",
          security: [{ bearerAuth: [] }],
        },
        preHandler: authGuard,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: "Not authorized" });
        }

        const result = await favoriteService.remove(
          userId,
          request.params.recipeId,
        );
        return reply.send(result);
      },
    )
    .get(
      "/:recipeId/favorite",
      {
        schema: {
          params: recipeParamsSchema,
          tags: ["Recipes"],
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
          request.params.recipeId,
        );
        return reply.send({ favorited });
      },
    )
    .get(
      "/:recipeId/comments",
      {
        schema: {
          params: recipeParamsSchema,
          querystring: commentQuerySchema,
          tags: ["Recipes"],
          summary: "Get comments for a recipe",
        },
      },
      async (request, reply) => {
        const result = await commentService.findByRecipe(
          { recipeId: request.params.recipeId },
          request.query,
        );
        return reply.send(result);
      },
    )
    .post(
      "/:recipeId/comments",
      {
        schema: {
          params: recipeParamsSchema,
          body: createCommentSchema,
          tags: ["Recipes"],
          summary: "Create a comment",
          security: [{ bearerAuth: [] }],
        },
        preHandler: authGuard,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: "Not authorized" });
        }

        const comment = await commentService.create(
          request.params.recipeId,
          userId,
          request.body,
        );
        return reply.status(201).send(comment);
      },
    )
    .delete(
      "/comments/:commentId",
      {
        schema: {
          params: commentParamsSchema,
          tags: ["Recipes"],
          summary: "Delete a comment",
          security: [{ bearerAuth: [] }],
        },
        preHandler: authGuard,
      },
      async (request, reply) => {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: "Not authorized" });
        }

        await commentService.delete(request.params.commentId, userId);
        return reply.status(204).send();
      },
    );
};
