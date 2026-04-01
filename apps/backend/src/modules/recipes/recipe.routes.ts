import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard, optionalAuth } from "@/common/middleware/auth.guard.js";
import { FavoriteService } from "@/modules/favorites/favorite.service.js";
import {
  createRecipeSchema,
  recipeParamsSchema,
  recipeQuerySchema,
  updateRecipeSchema,
} from "@/modules/recipes/recipe.schema.js";
import { RecipeService } from "@/modules/recipes/recipe.service.js";

const recipeService = new RecipeService();
const favoriteService = new FavoriteService();

export async function recipeRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  // GET — get all recipes with pagination, filtering and sorting
  fastify.get(
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
      const userId = request.user?.userId;
      const result = await recipeService.findAll(request.query, userId);
      return reply.send(result);
    },
  );

  // GET — get recipe by ID
  fastify.get(
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
      const userId = request.user?.userId;
      const recipe = await recipeService.findById(
        request.params.recipeId,
        userId,
      );
      return reply.send(recipe);
    },
  );

  // POST — create recipe
  fastify.post(
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

      const recipe = await recipeService.create(request.body, userId);
      return reply.status(201).send(recipe);
    },
  );

  // PATCH — update recipe
  fastify.patch(
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

      const recipe = await recipeService.update(
        request.params.recipeId,
        request.body,
        userId,
      );
      return reply.send(recipe);
    },
  );

  // DELETE — delete recipe
  fastify.delete(
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

      await recipeService.delete(request.params.recipeId, userId);
      return reply.status(204).send();
    },
  );

  // POST — toggle favorite
  fastify.post(
    "/:recipeId/favorite",
    {
      schema: {
        params: recipeParamsSchema,
        tags: ["Recipes"],
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

      const result = await favoriteService.toggle(
        userId,
        request.params.recipeId,
      );
      return reply.send(result);
    },
  );

  // GET — check if favorited
  fastify.get(
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
  );
}
