import type { RequireKeys } from "@recipes/shared/core";
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

  async markRotated(
    id: Types.ObjectId,
    data: { replacedBy: Types.ObjectId },
  ): Promise<RefreshSessionDocument | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, rotatedAt: null, replacedBy: null, revokedAt: null },
        {
          $set: {
            lastUsedAt: new Date(),
            rotatedAt: new Date(),
            replacedBy: data.replacedBy,
          },
        },
        { returnDocument: "after", runValidators: true },
      )
      .lean();
  }

  async rotate(
    session: Pick<
      RefreshSessionDocument,
      "_id" | "user" | "familyId" | "expiresAt"
    >,
    data: {
      tokenHash: string;
      ip?: string | null;
      userAgent?: string | null;
    },
  ): Promise<RefreshSessionDocument | null> {
    const newSession = await this.create({
      user: session.user,
      familyId: session.familyId,
      tokenHash: data.tokenHash,
      expiresAt: session.expiresAt,
      ip: data.ip ?? null,
      userAgent: data.userAgent ?? null,
    });

    const rotated = await this.markRotated(session._id, {
      replacedBy: newSession._id,
    });

    if (!rotated) {
      await this.revokeById(newSession._id, "rotation-conflict");
      return null;
    }

    return newSession;
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
