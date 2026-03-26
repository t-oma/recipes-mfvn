import { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: "Recipes API",
      description: "API для сайту рецептів",
      version: "1.0.0",
    },
    servers: [
      { url: "http://localhost:3000", description: "Development" },
    ],
  },
};

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
  },
};
