// Routes are registered within recipe.routes.ts, not as a standalone module.
// This is intentional: favorites are a child resource of recipes.

export * from "./favorite.model.js";
export * from "./favorite.schema.js";
export * from "./favorite.service.js";
