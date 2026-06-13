import crypto from "node:crypto";
import type { Prettify } from "@recipes/shared/core";
import type { UserRole } from "@recipes/shared/users";
import type { JwtPayload as _JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "@/config/env.js";

export type JwtPayload = Prettify<_JwtPayload> & {
  id: string;
  email: string;
  role: UserRole;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign({ ...payload }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
    subject: payload.id,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  }) as JwtPayload;
}

export function generateOpaqueToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
