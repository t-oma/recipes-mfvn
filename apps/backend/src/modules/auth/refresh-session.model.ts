import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocumentWithoutUpdate } from "@/common/types/mongoose.js";

export const revokeReasons = [
  "logout",
  "reuse-detected",
  "admin",
  "expired",
  "user-not-found",
] as const;
export type RevokeReason = (typeof revokeReasons)[number];

export interface RefreshSessionDocument extends BaseDocumentWithoutUpdate {
  user: Types.ObjectId;
  familyId: string;
  tokenHash: string;

  expiresAt: Date;
  lastUsedAt: Date | null;

  rotatedAt: Date | null;
  replacedBy: Types.ObjectId | null;

  revokedAt: Date | null;
  revokeReason: RevokeReason | null;

  userAgent: string | null;
  ip: string | null;
}

export interface RefreshSessionModelType
  extends Model<RefreshSessionDocument> {}

const refreshSessionSchema = new Schema<
  RefreshSessionDocument,
  RefreshSessionModelType
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    familyId: {
      type: String,
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokeReason: {
      type: String,
      enum: [...revokeReasons, null],
      default: null,
    },
    rotatedAt: {
      type: Date,
      default: null,
    },
    replacedBy: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "refreshSessions",
  },
);

export const RefreshSessionModel = model<
  RefreshSessionDocument,
  RefreshSessionModelType
>("RefreshSession", refreshSessionSchema);

export const refreshSessionsCollectionName =
  RefreshSessionModel.collection.name;
