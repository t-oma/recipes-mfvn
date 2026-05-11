import { describe, expect, it } from "vitest";
import { createCategoryDoc } from "@/__tests__/helpers.js";
import { toCategory } from "./category.mapper.js";

describe("toCategory", () => {
  it("should map CategoryDocument to Category DTO", () => {
    const doc = createCategoryDoc({
      name: "Desserts",
      slug: "desserts",
      description: "Sweet dishes",
    });

    const result = toCategory(doc);

    expect(result).toEqual({
      id: doc._id.toString(),
      name: "Desserts",
      slug: "desserts",
      description: "Sweet dishes",
      image: { url: "https://example.com/category.jpg", alt: "Desserts" },
      recipeCount: 0,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    });
  });

  it("should handle optional description", () => {
    const doc = createCategoryDoc({ description: undefined });

    const result = toCategory(doc);

    expect(result.description).toBeUndefined();
  });
});
