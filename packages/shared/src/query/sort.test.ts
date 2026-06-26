import { describe, expect, it } from "vitest";
import { getSortObject } from "./sort";

describe("getSortObject", () => {
  it("returns ascending MongoDB sort object", () => {
    expect(getSortObject({ sort: "createdAt", order: "asc" })).toEqual({
      createdAt: 1,
    });
  });

  it("returns descending MongoDB sort object", () => {
    expect(getSortObject({ sort: "createdAt", order: "desc" })).toEqual({
      createdAt: -1,
    });
  });
});
