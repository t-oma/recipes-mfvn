import type { FastifyReply, FastifyRequest } from "fastify";
import type { JwtPayload } from "../utils/jwt.js";
import { verifyToken } from "../utils/jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export function extractToken(request: FastifyRequest): string {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new Error("Missing or invalid token");
  }

  if (!parts[1]) {
    throw new Error("Missing token");
  }

  return parts[1];
}

export async function authGuard(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const token = extractToken(request);
    request.user = verifyToken(token);
  } catch {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
}

export async function optionalAuth(request: FastifyRequest): Promise<void> {
  try {
    const token = extractToken(request);
    request.user = verifyToken(token);
  } catch {
    // Token invalid, but we don't throw — just leave user undefined
  }
}
