import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/auth/index.ts",
    "src/categories/index.ts",
    "src/comments/index.ts",
    "src/common/index.ts",
    "src/core/index.ts",
    "src/cuisines/index.ts",
    "src/favorites/index.ts",
    "src/query/index.ts",
    "src/recipe-rating/index.ts",
    "src/recipes/index.ts",
    "src/reviews/index.ts",
    "src/users/index.ts",
  ],
  external: ["zod"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
