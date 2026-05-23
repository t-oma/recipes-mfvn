import type { RequireKeys } from "@recipes/shared";
import type { Types } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type {
  RefreshSessionDocument,
  RevokeReason,
} from "./refresh-session.model.js";

export type RefreshSessionCreateInput = RequireKeys<
  CreateInput<
    Omit<
      RefreshSessionDocument,
      | "lastUsedAt"
      | "rotatedAt"
      | "replacedBy"
      | "revokedAt"
      | "revokeReason"
      | "createdAt"
    >
  >,
  "familyId" | "tokenHash" | "expiresAt"
>;

export type RefreshSessionUpdateInput = UpdateInput<
  Omit<
    RefreshSessionDocument,
    | "user"
    | "familyId"
    | "tokenHash"
    | "expiresAt"
    | "userAgent"
    | "ip"
    | "createdAt"
  >
>;

export class RefreshSessionRepository extends BaseRepository<
  RefreshSessionDocument,
  RefreshSessionCreateInput,
  RefreshSessionUpdateInput
> {
  async findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshSessionDocument | null> {
    return this.model.findOne({ tokenHash }).lean();
  }

  async rotateById(
    id: Types.ObjectId,
    data: { replacedBy: Types.ObjectId },
  ): Promise<RefreshSessionDocument | null> {
    return this.model
      .findByIdAndUpdate(id, {
        lastUsedAt: new Date(),
        rotatedAt: new Date(),
        replacedBy: data.replacedBy,
      })
      .lean();
  }

  async revokeById(id: Types.ObjectId, reason: RevokeReason): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, {
        revokedAt: new Date(),
        revokeReason: reason,
      })
      .lean();
  }

  async revokeFamily(familyId: string, reason: RevokeReason): Promise<void> {
    await this.model
      .updateMany(
        { familyId },
        {
          revokedAt: new Date(),
          revokeReason: reason,
        },
      )
      .lean();
  }
}
