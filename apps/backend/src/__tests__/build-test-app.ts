import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import cacheHeadersPlugin from "@/common/cache/cache-headers.plugin.js";
import { errorHandler } from "@/common/middleware/errorHandler.js";
import type { JwtPayload } from "@/common/utils/jwt.js";

export async function createTestApp() {
  const app = Fastify({ logger: false });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);
  await app.register(cacheHeadersPlugin);
  return app;
}

export function authHeader(payload: JwtPayload): { authorization: string } {
  return { authorization: `Bearer fake-token-${payload.userId}` };
}
