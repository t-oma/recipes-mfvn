import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createObjectId,
  createRefreshSessionDoc,
  createUserDoc,
} from "@/__tests__/helpers.js";
import { UnauthorizedError } from "@/common/errors.js";
import {
  createRefreshSessionService,
  exhaustiveCheck,
  getRefreshSessionState,
} from "./refresh-session.service.js";

const { generateOpaqueToken, hashToken, signToken } = vi.hoisted(() => ({
  generateOpaqueToken: vi.fn(),
  hashToken: vi.fn(),
  signToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({
  generateOpaqueToken,
  hashToken,
  signToken,
}));

describe("createRefreshSessionService", () => {
  const mockRefreshRepo = {
    findByTokenHash: vi.fn(),
    create: vi.fn(),
    rotate: vi.fn(),
    revokeById: vi.fn(),
    revokeFamily: vi.fn(),
  };
  const mockUserRepo = {
    findById: vi.fn(),
  };
  const service = createRefreshSessionService(mockRefreshRepo, mockUserRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should generate opaque token, hash it, store session and return raw token", async () => {
      generateOpaqueToken.mockReturnValue("raw-opaque-token");
      hashToken.mockReturnValue("hashed-token");
      mockRefreshRepo.create.mockResolvedValue({ _id: "session-id" });

      const result = await service.create("user-id", {
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      });

      expect(generateOpaqueToken).toHaveBeenCalledTimes(1);
      expect(hashToken).toHaveBeenCalledWith("raw-opaque-token");
      expect(mockRefreshRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "user-id",
          tokenHash: "hashed-token",
          ip: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        }),
      );
      expect(result.refreshToken).toBe("raw-opaque-token");
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe("refresh", () => {
    it("should rotate session and return new tokens for valid refresh", async () => {
      const user = createUserDoc({ email: "user@test.com" });
      const session = createRefreshSessionDoc({
        user: user._id,
        familyId: "family-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      hashToken
        .mockReturnValueOnce("hashed-old")
        .mockReturnValueOnce("hashed-new");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);
      mockUserRepo.findById.mockResolvedValue(user);
      generateOpaqueToken.mockReturnValue("new-raw-token");
      mockRefreshRepo.rotate.mockResolvedValue({
        _id: "new-session",
        tokenHash: "hashed-new",
      });
      signToken.mockReturnValue("new-access-token");

      const result = await service.refresh("old-raw-token", {
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      });

      expect(mockRefreshRepo.findByTokenHash).toHaveBeenCalledWith(
        "hashed-old",
      );
      expect(mockRefreshRepo.rotate).toHaveBeenCalledWith(
        session,
        expect.objectContaining({
          tokenHash: "hashed-new",
          ip: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        }),
      );
      expect(signToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        }),
      );
      expect(result.user.email).toBe("user@test.com");
      expect(result.accessToken).toBe("new-access-token");
      expect(result.refreshToken).toBe("new-raw-token");
    });

    it("should throw UnauthorizedError when token not found", async () => {
      hashToken.mockReturnValue("unknown-hash");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(null);

      await expect(service.refresh("unknown-token", {})).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.refresh("unknown-token", {})).rejects.toThrow(
        "Invalid refresh token",
      );
    });

    it("should throw UnauthorizedError when session is revoked", async () => {
      const session = createRefreshSessionDoc({
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);

      await expect(service.refresh("token", {})).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.refresh("token", {})).rejects.toThrow(
        "Refresh session revoked",
      );
    });

    it("should revoke and throw when session is expired", async () => {
      const session = createRefreshSessionDoc({
        expiresAt: new Date(Date.now() - 1000),
      });

      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);

      await expect(service.refresh("token", {})).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.refresh("token", {})).rejects.toThrow(
        "Refresh token expired",
      );
      expect(mockRefreshRepo.revokeById).toHaveBeenCalledWith(
        session._id,
        "expired",
      );
    });

    it("should revoke family and throw when token is reused", async () => {
      const session = createRefreshSessionDoc({
        familyId: "family-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rotatedAt: new Date(),
      });

      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);

      await expect(service.refresh("token", {})).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.refresh("token", {})).rejects.toThrow(
        "Refresh token reuse detected",
      );
      expect(mockRefreshRepo.revokeFamily).toHaveBeenCalledWith(
        "family-1",
        "reuse-detected",
      );
    });

    it("should revoke family and throw when user not found", async () => {
      const session = createRefreshSessionDoc({
        familyId: "family-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.refresh("token", {})).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.refresh("token", {})).rejects.toThrow(
        "User not found",
      );
      expect(mockRefreshRepo.revokeFamily).toHaveBeenCalledWith(
        "family-1",
        "user-not-found",
      );
    });

    it("should throw rotation conflict when rotate returns null", async () => {
      const user = createUserDoc();
      const session = createRefreshSessionDoc({
        familyId: "family-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);
      mockUserRepo.findById.mockResolvedValue(user);
      generateOpaqueToken.mockReturnValue("new-token");
      mockRefreshRepo.rotate.mockResolvedValue(null);

      await expect(service.refresh("token", {})).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(service.refresh("token", {})).rejects.toThrow(
        "Refresh token rotation conflict",
      );
    });
  });

  describe("logout", () => {
    it("should revoke session when valid token provided", async () => {
      const session = createRefreshSessionDoc({});

      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);

      await service.logout("raw-token");

      expect(mockRefreshRepo.revokeById).toHaveBeenCalledWith(
        session._id,
        "logout",
      );
    });

    it("should do nothing when no token provided", async () => {
      await service.logout();

      expect(mockRefreshRepo.findByTokenHash).not.toHaveBeenCalled();
    });

    it("should do nothing when token not found", async () => {
      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(null);

      await service.logout("unknown-token");

      expect(mockRefreshRepo.revokeById).not.toHaveBeenCalled();
    });

    it("should do nothing when session already revoked", async () => {
      const session = createRefreshSessionDoc({
        revokedAt: new Date(),
      });

      hashToken.mockReturnValue("hashed");
      mockRefreshRepo.findByTokenHash.mockResolvedValue(session);

      await service.logout("raw-token");

      expect(mockRefreshRepo.revokeById).not.toHaveBeenCalled();
    });
  });
});

describe("getRefreshSessionState", () => {
  it("should return 'revoked' when revokedAt is set", () => {
    const state = getRefreshSessionState({
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000),
      rotatedAt: null,
      replacedBy: null,
    });
    expect(state).toBe("revoked");
  });

  it("should return 'expired' when expiresAt is in the past", () => {
    const state = getRefreshSessionState({
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      rotatedAt: null,
      replacedBy: null,
    });
    expect(state).toBe("expired");
  });

  it("should return 'reused' when rotatedAt is set", () => {
    const state = getRefreshSessionState({
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000),
      rotatedAt: new Date(),
      replacedBy: null,
    });
    expect(state).toBe("reused");
  });

  it("should return 'reused' when replacedBy is set", () => {
    const state = getRefreshSessionState({
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000),
      rotatedAt: null,
      replacedBy: createObjectId(),
    });
    expect(state).toBe("reused");
  });

  it("should return 'valid' for active non-expired session", () => {
    const state = getRefreshSessionState({
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000),
      rotatedAt: null,
      replacedBy: null,
    });
    expect(state).toBe("valid");
  });
});

describe("exhaustiveCheck", () => {
  it("should throw AppError for any value", () => {
    expect(() => exhaustiveCheck("unexpected" as never)).toThrow();
    expect(() => exhaustiveCheck(42 as never)).toThrow();
  });
});
