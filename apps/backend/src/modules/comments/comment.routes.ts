import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authGuard } from "@/common/middleware/auth.guard.js";
import {
  commentParamsSchema,
  commentQuerySchema,
  createCommentSchema,
  recipeCommentsParamsSchema,
} from "@/modules/comments/comment.schema.js";
import { CommentService } from "@/modules/comments/comment.service.js";

const commentService = new CommentService();

export async function commentRoutes(app: FastifyInstance): Promise<void> {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/:recipeId/comments",
    {
      schema: {
        params: recipeCommentsParamsSchema,
        querystring: commentQuerySchema,
        tags: ["Comments"],
        summary: "Get comments for a recipe",
      },
    },
    async (request, reply) => {
      const result = await commentService.findByRecipe(
        request.params,
        request.query,
      );
      return reply.send(result);
    },
  );

  fastify.post(
    "/:recipeId/comments",
    {
      schema: {
        params: recipeCommentsParamsSchema,
        body: createCommentSchema,
        tags: ["Comments"],
        summary: "Create a comment",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      const comment = await commentService.create(
        request.params.recipeId,
        request.user.userId,
        request.body,
      );
      return reply.status(201).send(comment);
    },
  );

  fastify.delete(
    "/comments/:commentId",
    {
      schema: {
        params: commentParamsSchema,
        tags: ["Comments"],
        summary: "Delete a comment",
        security: [{ bearerAuth: [] }],
      },
      preHandler: authGuard,
    },
    async (request, reply) => {
      await commentService.delete(
        request.params.commentId,
        request.user.userId,
      );
      return reply.status(204).send();
    },
  );
}
