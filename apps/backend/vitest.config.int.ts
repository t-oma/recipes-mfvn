import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
    },
    setupFiles: ["dotenv/config", "src/__tests__/mongo-setup.ts"],
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },
});
