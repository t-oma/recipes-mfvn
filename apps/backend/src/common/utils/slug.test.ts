import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import {
  generateRecipeSlug,
  slugify,
  transliterate,
} from "@/common/utils/slug.js";

describe("transliterate", () => {
  it("should transliterate lowercase Ukrainian letters", () => {
    expect(transliterate("банан")).toBe("banan");
    expect(transliterate("борщ")).toBe("borshch");
    expect(transliterate("щука")).toBe("shchuka");
  });

  it("should transliterate uppercase Ukrainian letters", () => {
    expect(transliterate("Борщ")).toBe("Borshch");
    expect(transliterate("Європа")).toBe("Ievropa");
  });

  it("should handle mixed Ukrainian and Latin text", () => {
    expect(transliterate("recipe Борщ")).toBe("recipe Borshch");
  });

  it("should leave non-Ukrainian characters unchanged", () => {
    expect(transliterate("hello world 123")).toBe("hello world 123");
    expect(transliterate("café résumé")).toBe("café résumé");
  });

  it("should return empty string for empty input", () => {
    expect(transliterate("")).toBe("");
  });
});

describe("slugify", () => {
  it("should convert English title to slug", () => {
    expect(slugify("Classic American Pancakes")).toBe(
      "classic-american-pancakes",
    );
  });

  it("should convert Ukrainian title to slug", () => {
    expect(slugify("Борщ з квашеною капустою")).toBe(
      "borshch-z-kvashenoiu-kapustoiu",
    );
  });

  it("should remove special characters", () => {
    expect(slugify("Pancakes!!! (with syrup)")).toBe("pancakes-with-syrup");
  });

  it("should collapse multiple spaces and hyphens", () => {
    expect(slugify("too   many    spaces")).toBe("too-many-spaces");
    expect(slugify("double--hyphens")).toBe("double-hyphens");
  });

  it("should trim leading and trailing hyphens", () => {
    expect(slugify("-leading")).toBe("leading");
    expect(slugify("trailing-")).toBe("trailing");
    expect(slugify("-both-")).toBe("both");
  });

  it("should handle underscores like spaces", () => {
    expect(slugify("hello_world")).toBe("hello-world");
  });

  it("should return empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });
});

describe("generateRecipeSlug", () => {
  it("should generate slug with last 6 hex chars of ObjectId", () => {
    const objectId = new Types.ObjectId("507f1f77bcf86cd799439033");
    const result = generateRecipeSlug("Classic American Pancakes", objectId);

    expect(result).toBe("classic-american-pancakes-439033");
  });

  it("should work with string hex ObjectId", () => {
    const result = generateRecipeSlug("Борщ", "507f1f77bcf86cd799439011");

    expect(result).toBe("borshch-439011");
  });

  it("should handle titles with special characters", () => {
    const objectId = new Types.ObjectId("507f1f77bcf86cd799439022");
    const result = generateRecipeSlug("Pancakes!!! (super)", objectId);

    expect(result).toBe("pancakes-super-439022");
  });

  it("should handle empty title", () => {
    const objectId = new Types.ObjectId("507f1f77bcf86cd799439033");
    const result = generateRecipeSlug("", objectId);

    expect(result).toBe("-439033");
  });
});
