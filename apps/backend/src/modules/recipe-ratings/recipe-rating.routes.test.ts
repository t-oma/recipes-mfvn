import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp, authHeader } from "@/__tests__/build-test-app.js";
import { recipeRatingRoutes } from "@/modules/recipe-ratings/recipe-rating.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("recipeRatingRoutes", () => {
  const mockRecipeRatingService = {
    rate: vi.fn(),
    remove: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const recipeId = "507f1f77bcf86cd799439033";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildApp() {
    const app = createTestApp();
    app.register(recipeRatingRoutes, { service: mockRecipeRatingService, prefix: "/api/recipes" });
    return app;
  }

  describe("PUT /api/recipes/:id/rating", () => {
    it("should rate recipe when authenticated", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId, email: "user@test.com", role: "user" });
      mockRecipeRatingService.rate.mockResolvedValue({ value: 5 });

      const response = await app.inject({
        method: "PUT",
        url: `/api/recipes/${recipeId}/rating`,
        payload: { value: 5 },
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.value).toBe(5);
      expect(mockRecipeRatingService.rate).toHaveBeenCalledWith(recipeId, {
        data: { value: 5 },
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "PUT",
        url: `/api/recipes/${recipeId}/rating`,
        payload: { value: 5 },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid rating value", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId, email: "user@test.com", role: "user" });

      const response = await app.inject({
        method: "PUT",
        url: `/api/recipes/${recipeId}/rating`,
        payload: { value: 10 },
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for invalid recipe id", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId, email: "user@test.com", role: "user" });

      const response = await app.inject({
        method: "PUT",
        url: "/api/recipes/bad-id/rating",
        payload: { value: 5 },
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/recipes/:id/rating", () => {
    it("should remove rating when authenticated", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId, email: "user@test.com", role: "user" });
      mockRecipeRatingService.remove.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}/rating`,
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(204);
      expect(mockRecipeRatingService.remove).toHaveBeenCalledWith(recipeId, {
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}/rating`,
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
