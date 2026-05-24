import type { FastifyInstance } from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "@/__tests__/build-test-app.js";
import { ConflictError, UnauthorizedError } from "@/common/errors.js";
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
  const mockRefreshSessionService = {
    create: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  };

  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createTestApp();
    await app.register(authRoutes, {
      service: mockAuthService,
      refreshSession: mockRefreshSessionService,
      prefix: "/api/auth",
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and return 201", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const payload = {
        email: "new@test.com",
        password: "Password123!",
        name: "New User",
      };
      mockAuthService.register.mockResolvedValue({
        user: {
          id: userId,
          email: payload.email,
          name: payload.name,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        token: "mock-jwt-token",
      });
      const refreshExpiry = new Date(Date.now() + 15 * 60 * 1000);
      mockRefreshSessionService.create.mockResolvedValue({
        refreshToken: "mock-refresh-token",
        expiresAt: refreshExpiry,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/register",
        payload,
      });

      expect(response.statusCode).toBe(201);
      expect(response.headers["set-cookie"]).toContain(
        "refresh-token=mock-refresh-token",
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(payload);
      expect(mockRefreshSessionService.create).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          ip: "127.0.0.1",
          userAgent: "lightMyRequest",
        }),
      );
      const body = JSON.parse(response.payload);
      expect(body.user.email).toBe(payload.email);
      expect(body.token).toBe("mock-jwt-token");
    });

    it("should return 400 for invalid email", async () => {
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
      mockAuthService.register.mockRejectedValue(
        new ConflictError("Email already in use"),
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
      const userId = "507f1f77bcf86cd799439011";
      mockAuthService.login.mockResolvedValue({
        user: {
          id: userId,
          email: "user@test.com",
          name: "User",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        token: "mock-jwt-token",
      });
      const refreshExpiry = new Date(Date.now() + 15 * 60 * 1000);
      mockRefreshSessionService.create.mockResolvedValue({
        refreshToken: "mock-refresh-token",
        expiresAt: refreshExpiry,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "user@test.com", password: "correct-password" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["set-cookie"]).toContain(
        "refresh-token=mock-refresh-token",
      );
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "correct-password",
      });
      expect(mockRefreshSessionService.create).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          ip: "127.0.0.1",
          userAgent: "lightMyRequest",
        }),
      );
      const body = JSON.parse(response.payload);
      expect(body.user.email).toBe("user@test.com");
      expect(body.token).toBe("mock-jwt-token");
    });

    it("should return 400 for invalid email format", async () => {
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
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedError("Invalid email or password"),
      );

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "wrong@test.com", password: "wrong10" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh session and return new access token with cookie", async () => {
      const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockRefreshSessionService.refresh.mockResolvedValue({
        user: {
          id: "507f1f77bcf86cd799439011",
          email: "user@test.com",
          name: "User",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        expiresAt: refreshExpiry,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/refresh",
        cookies: {
          "refresh-token": "old-refresh-token",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["set-cookie"]).toContain(
        "refresh-token=new-refresh-token",
      );
      expect(mockRefreshSessionService.refresh).toHaveBeenCalledWith(
        "old-refresh-token",
        expect.objectContaining({
          ip: "127.0.0.1",
          userAgent: "lightMyRequest",
        }),
      );
      const body = JSON.parse(response.payload);
      expect(body.user.email).toBe("user@test.com");
      expect(body.token).toBe("new-access-token");
    });

    it("should return 401 when refresh cookie is missing", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/refresh",
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe("Invalid or expired token");
      expect(mockRefreshSessionService.refresh).not.toHaveBeenCalled();
    });

    it("should return 401 when refresh service throws UnauthorizedError", async () => {
      mockRefreshSessionService.refresh.mockRejectedValue(
        new UnauthorizedError("Refresh token expired"),
      );

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/refresh",
        cookies: {
          "refresh-token": "expired-token",
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe("Refresh token expired");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout and clear refresh cookie", async () => {
      mockRefreshSessionService.logout.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        cookies: {
          "refresh-token": "valid-refresh-token",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["set-cookie"]).toContain("refresh-token=;");
      expect(mockRefreshSessionService.logout).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
    });

    it("should return 200 even without refresh cookie", async () => {
      mockRefreshSessionService.logout.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
      });

      expect(response.statusCode).toBe(200);
      expect(mockRefreshSessionService.logout).toHaveBeenCalledWith(undefined);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
    });

    it("should return 200 when token not found or already revoked", async () => {
      mockRefreshSessionService.logout.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "POST",
        url: "/api/auth/logout",
        cookies: {
          "refresh-token": "unknown-token",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(mockRefreshSessionService.logout).toHaveBeenCalledWith(
        "unknown-token",
      );
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
    });
  });
});
