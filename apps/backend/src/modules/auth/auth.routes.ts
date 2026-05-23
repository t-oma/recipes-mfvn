import {
  authResponseSchema,
  loginInputSchema,
  registerInputSchema,
} from "@recipes/shared";
import type { FastifyPluginAsync, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { UnauthorizedError } from "@/common/errors.js";
import { env } from "@/config/env.js";
import type { AuthService } from "@/modules/auth/auth.service.js";
import type { RefreshSessionService } from "./refresh-session.service.js";

export interface AuthModuleOptions {
  service: AuthService;
  refreshSession: RefreshSessionService;
}

const REFRESH_COOKIE_NAME =
  env.NODE_ENV === "production" ? "__Host-refresh-token" : "refresh-token";

export const authRoutes: FastifyPluginAsync<AuthModuleOptions> = async (
  fastify,
  { service, refreshSession },
) => {
  fastify
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/register",
      {
        schema: {
          body: registerInputSchema,
          response: {
            201: authResponseSchema,
          },
          tags: ["Auth"],
          summary: "Register a new user",
        },
        config: {
          rateLimit: {
            max: env.RATE_LIMIT_AUTH_MAX,
            timeWindow: env.RATE_LIMIT_AUTH_WINDOW,
          },
        },
      },
      async (request, reply) => {
        const result = await service.register(request.body);
        const refreshResult = await refreshSession.create(result.user.id, {
          ip: request.ip,
          userAgent: request.headers["user-agent"] ?? null,
        });

        setRefreshCookie(reply, {
          token: refreshResult.refreshToken,
          expiresAt: refreshResult.expiresAt,
        });
        return reply.status(201).send(result);
      },
    )
    .post(
      "/login",
      {
        schema: {
          body: loginInputSchema,
          response: {
            200: authResponseSchema,
          },
          tags: ["Auth"],
          summary: "Login user",
        },
        config: {
          rateLimit: {
            max: env.RATE_LIMIT_AUTH_MAX,
            timeWindow: env.RATE_LIMIT_AUTH_WINDOW,
          },
        },
      },
      async (request, reply) => {
        const result = await service.login(request.body);
        const refreshResult = await refreshSession.create(result.user.id, {
          ip: request.ip,
          userAgent: request.headers["user-agent"] ?? null,
        });

        setRefreshCookie(reply, {
          token: refreshResult.refreshToken,
          expiresAt: refreshResult.expiresAt,
        });
        return reply.status(200).send(result);
      },
    )
    .post(
      "/refresh",
      {
        schema: {
          response: {
            200: authResponseSchema,
          },
          tags: ["Auth"],
          summary: "Refresh a session",
        },
      },
      async (request, reply) => {
        const refreshToken = request.cookies[REFRESH_COOKIE_NAME];
        if (!refreshToken)
          throw new UnauthorizedError("Invalid or expired token");

        const result = await refreshSession.refresh(refreshToken, {
          ip: request.ip,
          userAgent: request.headers["user-agent"] ?? null,
        });

        setRefreshCookie(reply, {
          token: result.refreshToken,
          expiresAt: result.expiresAt,
        });
        return reply.status(200).send({
          user: result.user,
          token: result.accessToken,
        });
      },
    );
};

function setRefreshCookie(
  reply: FastifyReply,
  session: { token: string; expiresAt: Date },
) {
  reply.cookie(REFRESH_COOKIE_NAME, session.token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: session.expiresAt,
  });
}

export function clearRefreshCookie(reply: FastifyReply) {
  reply.clearCookie(REFRESH_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
}
