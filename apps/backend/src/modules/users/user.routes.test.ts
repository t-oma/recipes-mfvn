import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { userRoutes } from "@/modules/users/user.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("userRoutes", () => {
  const mockUserService = {
    getCurrentUser: vi.fn(),
    getFavorites: vi.fn(),
    getComments: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";

  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = createTestApp();
    await app.register(userRoutes, {
      service: mockUserService,
      prefix: "/api/users",
    });
  });

  describe("GET /api/users/me", () => {
    it("should return current user when authenticated", async () => {
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockUserService.getCurrentUser.mockResolvedValue({
        id: userId,
        email: "user@test.com",
        name: "Test User",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/users/me",
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(200);
      expect(mockUserService.getCurrentUser).toHaveBeenCalledWith(userId);
      const body = JSON.parse(response.payload);
      expect(body.email).toBe("user@test.com");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/users/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/users/me/favorites", () => {
    it("should return favorites when authenticated", async () => {
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockUserService.getFavorites.mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/favorites",
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(200);
      expect(mockUserService.getFavorites).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          query: expect.any(Object),
          initiator: { id: userId, role: "user" },
        }),
      );
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/favorites",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/users/me/comments", () => {
    it("should return comments when authenticated", async () => {
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockUserService.getComments.mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/comments",
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(200);
      expect(mockUserService.getComments).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          query: expect.any(Object),
          initiator: { id: userId, role: "user" },
        }),
      );
    });

    it("should return 401 when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/users/me/comments",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
