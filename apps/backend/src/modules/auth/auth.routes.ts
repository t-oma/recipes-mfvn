import { loginSchema, registerSchema } from "@recipes/shared";
import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { AuthService } from "./auth.service.js";

export interface AuthModuleOptions {
  service: AuthService;
}

export const authRoutes: FastifyPluginAsync<AuthModuleOptions> = async (
  fastify,
  { service },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/register",
      {
        schema: {
          body: registerSchema,
          tags: ["Auth"],
          summary: "Register a new user",
        },
      },
      async (request, reply) => {
        const result = await service.register(request.body);
        return reply.status(201).send(result);
      },
    )
    .post(
      "/login",
      {
        schema: {
          body: loginSchema,
          tags: ["Auth"],
          summary: "Login user",
        },
      },
      async (request, reply) => {
        const result = await service.login(request.body);
        return reply.status(200).send(result);
      },
    );
};
