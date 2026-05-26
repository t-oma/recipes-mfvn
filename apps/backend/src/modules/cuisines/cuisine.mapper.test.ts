import { describe, expect, it } from "vitest";
import { createObjectId } from "@/__tests__/helpers.js";
import {
  toCuisineDetails,
  toCuisineListItem,
  toCuisineSummary,
} from "./cuisine.mapper.js";

describe("toCuisineSummary", () => {
  it("should map CuisineSummaryView to CuisineSummary DTO", () => {
    const view = {
      _id: createObjectId(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg" },
    };

    const result = toCuisineSummary(view);

    expect(result).toEqual({
      id: view._id.toString(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg", alt: "Italian cuisine" },
    });
  });

  it("should use name as alt fallback when alt is missing", () => {
    const view = {
      _id: createObjectId(),
      name: "French",
      slug: "french",
      image: { url: "https://example.com/french.jpg" },
    };

    const result = toCuisineSummary(view);

    expect(result.image.alt).toBe("French cuisine");
  });
});

describe("toCuisineListItem", () => {
  it("should map CuisineListItemView to CuisineListItem DTO", () => {
    const view = {
      _id: createObjectId(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg" },
      recipeCount: 7,
    };

    const result = toCuisineListItem(view);

    expect(result).toEqual({
      id: view._id.toString(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg", alt: "Italian cuisine" },
      recipeCount: 7,
    });
  });

  it("should default recipeCount to 0 when missing", () => {
    const view = {
      _id: createObjectId(),
      name: "Mexican",
      slug: "mexican",
      image: { url: "https://example.com/mexican.jpg" },
    };

    const result = toCuisineListItem(view);

    expect(result.recipeCount).toBe(0);
  });
});

describe("toCuisineDetails", () => {
  it("should map CuisineDetailsView to CuisineDetails DTO", () => {
    const view = {
      _id: createObjectId(),
      name: "Italian",
      slug: "italian",
      description: "Mediterranean classics",
      image: { url: "https://example.com/italian.jpg" },
      recipeCount: 5,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    const result = toCuisineDetails(view);

    expect(result).toEqual({
      id: view._id.toString(),
      name: "Italian",
      slug: "italian",
      description: "Mediterranean classics",
      image: { url: "https://example.com/italian.jpg", alt: "Italian cuisine" },
      recipeCount: 5,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
    });
  });

  it("should handle optional description", () => {
    const view = {
      _id: createObjectId(),
      name: "Asian",
      slug: "asian",
      image: { url: "https://example.com/asian.jpg" },
      recipeCount: 0,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    const result = toCuisineDetails(view);

    expect(result.description).toBeUndefined();
  });
});
