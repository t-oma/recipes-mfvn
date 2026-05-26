import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { cuisineRoutes } from "@/modules/cuisines/cuisine.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("cuisineRoutes", () => {
  const mockCuisineService = {
    findAll: vi.fn(),
    create: vi.fn(),
    deleteById: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439022";
  const cuisineId = "507f1f77bcf86cd799439033";

  const validCuisine = {
    id: cuisineId,
    name: "Italian",
    slug: "italian",
    description: "Mediterranean classics",
    image: {
      url: "https://example.com/italian.jpg",
    },
    recipeCount: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  const testJwtPayload = {
    id: userId,
    email: "user@test.com",
    role: "user",
  } as const;

  const testAdminJwtPayload = {
    id: adminId,
    email: "admin@test.com",
    role: "admin",
  } as const;

  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createTestApp();
    await app.register(cuisineRoutes, {
      service: mockCuisineService,
      prefix: "/api/cuisines",
    });
  });

  describe("GET /api/cuisines", () => {
    it("should return paginated cuisines", async () => {
      mockCuisineService.findAll.mockResolvedValue({
        value: {
          items: [{ ...validCuisine, recipeCount: 5 }],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
        cache: {
          status: "miss",
          key: "cuisines:list:sort=name:page=1:limit=10",
          ttl: 300,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/cuisines?page=1&limit=10",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].name).toBe("Italian");
      expect(response.headers["x-cache"]).toBe("MISS");
      expect(response.headers["x-cache-ttl"]).toBe("300");
    });

    it("should return 400 for invalid query", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/cuisines?page=abc",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/cuisines", () => {
    it("should create cuisine when admin", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);
      mockCuisineService.create.mockResolvedValue(validCuisine);

      const response = await app.inject({
        method: "POST",
        url: "/api/cuisines",
        payload: {
          name: "Italian",
          image: { url: "https://example.com/italian.jpg" },
        },
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(201);
      expect(mockCuisineService.create).toHaveBeenCalledWith({
        data: {
          name: "Italian",
          image: { url: "https://example.com/italian.jpg" },
        },
        initiator: {
          id: testAdminJwtPayload.id,
          role: testAdminJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/cuisines",
        payload: { name: "Italian" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "POST",
        url: "/api/cuisines",
        payload: { name: "Italian" },
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for invalid body", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);

      const response = await app.inject({
        method: "POST",
        url: "/api/cuisines",
        payload: { name: "" },
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /api/cuisines/:id", () => {
    it("should delete cuisine when admin", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);
      mockCuisineService.deleteById.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/cuisines/${cuisineId}`,
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(204);
      expect(mockCuisineService.deleteById).toHaveBeenCalledWith(cuisineId, {
        initiator: {
          id: testAdminJwtPayload.id,
          role: testAdminJwtPayload.role,
        },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/cuisines/${cuisineId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 403 when not admin", async () => {
      verifyToken.mockReturnValue(testJwtPayload);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/cuisines/${cuisineId}`,
        headers: authHeader(testJwtPayload),
      });

      expect(response.statusCode).toBe(403);
    });

    it("should return 400 for invalid id", async () => {
      verifyToken.mockReturnValue(testAdminJwtPayload);

      const response = await app.inject({
        method: "DELETE",
        url: "/api/cuisines/bad-id",
        headers: authHeader(testAdminJwtPayload),
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
