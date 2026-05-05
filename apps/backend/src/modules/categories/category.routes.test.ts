import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp, authHeader } from "@/__tests__/build-test-app.js";
import { categoryRoutes } from "@/modules/categories/category.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("categoryRoutes", () => {
  const mockCategoryService = {
    findAll: vi.fn(),
    create: vi.fn(),
    deleteById: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439022";
  const categoryId = "507f1f77bcf86cd799439033";

  const validCategory = {
    id: categoryId,
    name: "Desserts",
    slug: "desserts",
    description: "Sweet dishes",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildApp() {
    const app = createTestApp();
    app.register(categoryRoutes, { service: mockCategoryService, prefix: "/api/categories" });
    return app;
  }

  describe("GET /api/categories", () => {
    it("should return paginated categories", async () => {
      const app = buildApp();
      mockCategoryService.findAll.mockResolvedValue({
        items: [{ ...validCategory, recipeCount: 5 }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/categories?page=1&limit=10",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].name).toBe("Desserts");
    });

    it("should return 400 for invalid query", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "GET",
        url: "/api/categories?page=abc",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/categories", () => {
    it("should create category when admin", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId: adminId, email: "admin@test.com", role: "admin" });
      mockCategoryService.create.mockResolvedValue(validCategory);

      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Desserts" },
        headers: authHeader({ userId: adminId, email: "admin@test.com", role: "admin" }),
      });

      expect(response.statusCode).toBe(201);
      expect(mockCategoryService.create).toHaveBeenCalledWith({
        data: { name: "Desserts" },
        initiator: { id: adminId, role: "admin" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Desserts" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId, email: "user@test.com", role: "user" });

      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "Desserts" },
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for invalid body", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId: adminId, email: "admin@test.com", role: "admin" });

      const response = await app.inject({
        method: "POST",
        url: "/api/categories",
        payload: { name: "" },
        headers: authHeader({ userId: adminId, email: "admin@test.com", role: "admin" }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("should delete category when admin", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId: adminId, email: "admin@test.com", role: "admin" });
      mockCategoryService.deleteById.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/categories/${categoryId}`,
        headers: authHeader({ userId: adminId, email: "admin@test.com", role: "admin" }),
      });

      expect(response.statusCode).toBe(204);
      expect(mockCategoryService.deleteById).toHaveBeenCalledWith(categoryId, {
        initiator: { id: adminId, role: "admin" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "DELETE",
        url: `/api/categories/${categoryId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId, email: "user@test.com", role: "user" });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/categories/${categoryId}`,
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for invalid id", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({ userId: adminId, email: "admin@test.com", role: "admin" });

      const response = await app.inject({
        method: "DELETE",
        url: "/api/categories/bad-id",
        headers: authHeader({ userId: adminId, email: "admin@test.com", role: "admin" }),
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
