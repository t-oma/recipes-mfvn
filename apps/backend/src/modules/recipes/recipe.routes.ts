import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard, optionalAuth } from "@/common/middleware/auth.guard.js";
import {
  createRecipeSchema,
  recipeParamsSchema,
  recipeQuerySchema,
  updateRecipeSchema,
} from "@/modules/recipes/recipe.schema.js";
import { RecipeService } from "@/modules/recipes/recipe.service.js";

const recipeService = new RecipeService();

export async function recipeRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

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
}
