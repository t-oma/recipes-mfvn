import crypto from "node:crypto";
import type { UserDetails } from "@recipes/shared";
import { generateOpaqueToken, hashToken } from "@/common/utils/jwt.js";
import { env } from "@/config/env.js";
import type { RefreshSessionRepository } from "./refresh-session.repository.js";

export type CreateSessionContext = {
  ip?: string | null;
  userAgent?: string | null;
};

export type CreateSessionResult = {
  token: string;
  expiresAt: Date;
};

export interface RefreshSessionService {
  create(
    userId: UserDetails["id"],
    context: CreateSessionContext,
  ): Promise<CreateSessionResult>;
}

type RefreshSessionRepositoryPort = Pick<
  RefreshSessionRepository,
  "create" | "updateMany" | "rotateById"
>;

export function createRefreshSessionService(
  refreshSessionRepository: RefreshSessionRepositoryPort,
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
        token,
        expiresAt,
      };
    },
  };
}
