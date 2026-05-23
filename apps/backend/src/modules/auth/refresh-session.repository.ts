import type { RequireKeys } from "@recipes/shared";
import type { ObjectId, QueryFilter } from "mongoose";
import type { CreateInput, UpdateInput } from "@/common/base.repository.js";
import { BaseRepository } from "@/common/base.repository.js";
import type { RefreshSessionDocument } from "./refresh-session.model.js";

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
  async updateMany(
    filter: QueryFilter<RefreshSessionDocument>,
    data: RefreshSessionUpdateInput,
  ) {
    return this.model.updateMany(filter, data);
  }

  async rotateById(id: ObjectId, newSession: RefreshSessionDocument) {
    return this.model
      .findByIdAndUpdate(id, {
        lastUsedAt: new Date(),
        rotatedAt: new Date(),
        replacedBySessionId: newSession._id,
      })
      .lean();
  }
}
