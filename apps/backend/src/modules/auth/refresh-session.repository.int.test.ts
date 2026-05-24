import { beforeEach, describe, expect, it } from "vitest";
import { createDbUser } from "@/__tests__/db-factories.js";
import { createObjectId } from "@/__tests__/helpers.js";
import { RefreshSessionModel } from "./refresh-session.model.js";
import { RefreshSessionRepository } from "./refresh-session.repository.js";

describe("RefreshSessionRepository", () => {
  const repository = new RefreshSessionRepository(RefreshSessionModel);

  beforeEach(async () => {
    await RefreshSessionModel.deleteMany({});
  });

  describe("create", () => {
    it("should create a refresh session", async () => {
      const user = await createDbUser();
      const session = await repository.create({
        user: user._id,
        familyId: "test-family",
        tokenHash: "abc123",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(session.user.toString()).toBe(user._id.toString());
      expect(session.tokenHash).toBe("abc123");
      expect(session.familyId).toBe("test-family");
      expect(session.revokedAt).toBeNull();
      expect(session.rotatedAt).toBeNull();
    });
  });

  describe("findByTokenHash", () => {
    it("should find a session by token hash", async () => {
      const session = await repository.create({
        user: createObjectId(),
        familyId: "fam-1",
        tokenHash: "find-me",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const found = await repository.findByTokenHash("find-me");

      expect(found).not.toBeNull();
      expect(found?._id.toString()).toBe(session._id.toString());
    });

    it("should return null for non-existing token hash", async () => {
      const found = await repository.findByTokenHash("does-not-exist");

      expect(found).toBeNull();
    });
  });

  describe("markRotated", () => {
    it("should mark session as rotated with replacedBy", async () => {
      const session = await repository.create({
        user: createObjectId(),
        familyId: "fam-1",
        tokenHash: "hash-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      const newSessionId = createObjectId();

      const rotated = await repository.markRotated(session._id, {
        replacedBy: newSessionId,
      });

      expect(rotated).not.toBeNull();
      expect(rotated?.rotatedAt).not.toBeNull();
      expect(rotated?.lastUsedAt).not.toBeNull();
      expect(rotated?.replacedBy?.toString()).toBe(newSessionId.toString());
    });

    it("should return null for already rotated session (concurrent access)", async () => {
      const session = await repository.create({
        user: createObjectId(),
        familyId: "fam-1",
        tokenHash: "hash-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      const firstId = createObjectId();
      const secondId = createObjectId();

      await repository.markRotated(session._id, { replacedBy: firstId });
      const second = await repository.markRotated(session._id, {
        replacedBy: secondId,
      });

      expect(second).toBeNull();
    });
  });

  describe("rotate", () => {
    it("should create new session and mark old as rotated", async () => {
      const user = await createDbUser();
      const oldSession = await repository.create({
        user: user._id,
        familyId: "family-1",
        tokenHash: "old-hash",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const newSession = await repository.rotate(oldSession, {
        tokenHash: "new-hash",
      });

      expect(newSession).not.toBeNull();
      expect(newSession?.tokenHash).toBe("new-hash");
      expect(newSession?.familyId).toBe("family-1");
      expect(newSession?.user.toString()).toBe(user._id.toString());

      const updated = await RefreshSessionModel.findById(oldSession._id).lean();
      expect(updated?.rotatedAt).not.toBeNull();
      expect(updated?.lastUsedAt).not.toBeNull();
      expect(updated?.replacedBy?.toString()).toBe(newSession?._id.toString());
    });
  });

  describe("revokeById", () => {
    it("should revoke a session by id", async () => {
      const session = await repository.create({
        user: createObjectId(),
        familyId: "fam-1",
        tokenHash: "hash-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await repository.revokeById(session._id, "logout");

      const updated = await RefreshSessionModel.findById(session._id).lean();
      expect(updated?.revokedAt).not.toBeNull();
      expect(updated?.revokeReason).toBe("logout");
    });
  });

  describe("revokeFamily", () => {
    it("should revoke all sessions in a family", async () => {
      const user = await createDbUser();
      const familyId = "family-revoke";

      await repository.create({
        user: user._id,
        familyId,
        tokenHash: "hash-1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await repository.create({
        user: user._id,
        familyId,
        tokenHash: "hash-2",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await repository.revokeFamily(familyId, "reuse-detected");

      const sessions = await RefreshSessionModel.find({ familyId }).lean();
      expect(sessions).toHaveLength(2);
      for (const s of sessions) {
        expect(s.revokedAt).not.toBeNull();
        expect(s.revokeReason).toBe("reuse-detected");
      }
    });
  });
});
