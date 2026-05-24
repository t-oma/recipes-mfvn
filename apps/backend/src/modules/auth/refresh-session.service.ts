import crypto from "node:crypto";
import type { UserDetails } from "@recipes/shared";
import { AppError, UnauthorizedError } from "@/common/errors.js";
import {
  generateOpaqueToken,
  hashToken,
  signToken,
} from "@/common/utils/jwt.js";
import { env } from "@/config/env.js";
import { toUserDetails } from "@/modules/users/user.mapper.js";
import type { UserRepository } from "@/modules/users/user.repository.js";
import type { RefreshSessionDocument } from "./refresh-session.model.js";
import type { RefreshSessionRepository } from "./refresh-session.repository.js";

type SessionContext = {
  ip?: string | null;
  userAgent?: string | null;
};

type CreateSessionResult = {
  refreshToken: string;
  expiresAt: Date;
};

type RefreshSessionResult = CreateSessionResult & {
  user: UserDetails;
  accessToken: string;
};

export interface RefreshSessionService {
  create(
    userId: UserDetails["id"],
    context: SessionContext,
  ): Promise<CreateSessionResult>;
  refresh(
    refreshToken: string,
    context: SessionContext,
  ): Promise<RefreshSessionResult>;
  logout(refreshToken?: string): Promise<void>;
}

type RefreshSessionRepositoryPort = Pick<
  RefreshSessionRepository,
  "findByTokenHash" | "create" | "rotate" | "revokeById" | "revokeFamily"
>;
type UserRepositoryPort = Pick<UserRepository, "findById">;

export function createRefreshSessionService(
  refreshSessionRepository: RefreshSessionRepositoryPort,
  userRepository: UserRepositoryPort,
): RefreshSessionService {
  return {
    async create(userId, { ip, userAgent }) {
      const token = generateOpaqueToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(
        Date.now() + env.SESSION_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
      );
      const familyId = crypto.randomUUID();

      await refreshSessionRepository.create({
        user: userId,
        familyId,
        tokenHash,
        expiresAt,
        ip,
        userAgent,
      });

      return {
        refreshToken: token,
        expiresAt: expiresAt,
      };
    },

    async refresh(refreshToken, { ip, userAgent }) {
      const refreshTokenHash = hashToken(refreshToken);

      const currentSession =
        await refreshSessionRepository.findByTokenHash(refreshTokenHash);
      if (!currentSession) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      const sessionState = getRefreshSessionState(currentSession);
      switch (sessionState) {
        case "revoked":
          throw new UnauthorizedError("Refresh session revoked");
        case "expired":
          await refreshSessionRepository.revokeById(
            currentSession._id,
            "expired",
          );
          throw new UnauthorizedError("Refresh token expired");
        case "reused":
          await refreshSessionRepository.revokeFamily(
            currentSession.familyId,
            "reuse-detected",
          );
          throw new UnauthorizedError("Refresh token reuse detected");
        case "valid":
          break;
        default:
          exhaustiveCheck(sessionState);
      }

      const user = await userRepository.findById(
        currentSession.user.toHexString(),
      );
      if (!user) {
        await refreshSessionRepository.revokeFamily(
          currentSession.familyId,
          "user-not-found",
        );
        throw new UnauthorizedError("User not found");
      }

      const newRefreshToken = generateOpaqueToken();
      const newRefreshTokenHash = hashToken(newRefreshToken);

      const newSession = await refreshSessionRepository.rotate(currentSession, {
        tokenHash: newRefreshTokenHash,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
      });
      if (!newSession) {
        throw new UnauthorizedError("Refresh token rotation conflict");
      }

      const accessToken = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        user: toUserDetails(user),
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt: currentSession.expiresAt,
      };
    },

    async logout(refreshToken?: string) {
      if (!refreshToken) {
        return;
      }

      const tokenHash = hashToken(refreshToken);
      const session = await refreshSessionRepository.findByTokenHash(tokenHash);
      if (!session) {
        return;
      }

      if (!session.revokedAt) {
        return refreshSessionRepository.revokeById(session._id, "logout");
      }
    },
  };
}

export function getRefreshSessionState(
  session: Pick<
    RefreshSessionDocument,
    "revokedAt" | "expiresAt" | "rotatedAt" | "replacedBy"
  >,
) {
  if (session.revokedAt) return "revoked";
  if (session.expiresAt.getTime() <= Date.now()) return "expired";
  if (session.rotatedAt || session.replacedBy) return "reused";
  return "valid";
}

export function exhaustiveCheck(value: never): never {
  throw new AppError(`Unhandled value ${value}`);
}
