import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "@/__tests__/build-test-app.js";
import { authRoutes } from "@/modules/auth/auth.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("authRoutes", () => {
  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildApp() {
    const app = createTestApp();
    app.register(authRoutes, { service: mockAuthService, prefix: "/api/auth" });
    return app;
  }

  describe("POST /api/auth/register", () => {
    it("should register a new user and return 201", async () => {
      const app = buildApp();
      const payload = {
        email: "new@test.com",
        password: "Password123!",
        name: "New User",
      };
      mockAuthService.register.mockResolvedValue({
        user: {
          id: "507f1f77bcf86cd799439011",
          email: payload.email,
          name: payload.name,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        token: "mock-jwt-token",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(mockAuthService.register).toHaveBeenCalledWith(payload);
      const body = JSON.parse(response.payload);
      expect(body.user.email).toBe(payload.email);
      expect(body.token).toBe("mock-jwt-token");
    });

    it("should return 400 for invalid email", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "not-an-email", password: "pass", name: "A" },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for short password", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "test@test.com",
          password: "123",
          name: "Test User",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 409 when email already exists", async () => {
      const app = buildApp();
      mockAuthService.register.mockRejectedValue(
        Object.assign(new Error("Email already in use"), {
          statusCode: 409,
          code: "CONFLICT",
        }),
      );

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: {
          email: "existing@test.com",
          password: "Password123!",
          name: "Existing",
        },
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login and return 200 with token", async () => {
      const app = buildApp();
      mockAuthService.login.mockResolvedValue({
        user: {
          id: "507f1f77bcf86cd799439011",
          email: "user@test.com",
          name: "User",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        token: "mock-jwt-token",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "user@test.com", password: "correct-password" },
      });

      expect(response.statusCode).toBe(200);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "correct-password",
      });
      const body = JSON.parse(response.payload);
      expect(body.user.email).toBe("user@test.com");
      expect(body.token).toBe("mock-jwt-token");
    });

    it("should return 400 for invalid email format", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "bad-email", password: "pass" },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 401 when credentials are wrong", async () => {
      const app = buildApp();
      mockAuthService.login.mockRejectedValue(
        Object.assign(new Error("Invalid email or password"), {
          statusCode: 401,
          code: "UNAUTHORIZED",
        }),
      );

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "wrong@test.com", password: "wrong" },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
