import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { CacheMeta } from "./cache.service.js";

declare module "fastify" {
  interface FastifyReply {
    applyCacheHeaders(cache: CacheMeta): FastifyReply;
  }
}

const cacheHeaders: FastifyPluginAsync = async (fastify) => {
  fastify.decorateReply("applyCacheHeaders", function (cache: CacheMeta) {
    this.header("X-Cache", cache.status.toUpperCase());

    if (cache.status === "bypass") {
      this.headers({
        "X-Cache-Bypass": cache.reason,
        "Cache-Control": "no-store",
      });
      return this;
    }

    this.headers({
      "X-Cache-Key": cache.key,
      "X-Cache-TTL": String(cache.ttl),
      "Cache-Control": "public, max-age=0, must-revalidate",
    });

    return this;
  });
};

export default fp(cacheHeaders, {
  fastify: "5.x",
  name: "cache-headers",
});
