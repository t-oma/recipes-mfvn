import type { FastifyRequest } from "fastify";
import { ForbiddenError } from "@/common/errors.js";
import { assertAuthenticated } from "./auth.guard.js";

export function rolesGuard(...roles: string[]) {
  return async (request: FastifyRequest) => {
    assertAuthenticated(request);

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
  };
}
