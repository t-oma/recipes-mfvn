import { describe, expect, it } from "vitest";
import { createUserDoc } from "@/__tests__/helpers.js";
import { toUser } from "./user.mapper.js";

describe("toUser", () => {
  it("should map UserDocument to User DTO", () => {
    const doc = createUserDoc({
      email: "john@test.com",
      name: "John",
    });

    const result = toUser(doc);

    expect(result).toEqual({
      id: doc._id.toString(),
      email: "john@test.com",
      name: "John",
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    });
  });

  it("should not expose password field", () => {
    const doc = createUserDoc();

    const result = toUser(doc);

    expect(result).not.toHaveProperty(["_id", "__v", "password", "role"]);
  });
});
