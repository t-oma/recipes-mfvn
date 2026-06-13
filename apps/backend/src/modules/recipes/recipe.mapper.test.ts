import type { Minutes, RecipeComputed } from "@recipes/shared/recipes";
import { describe, expect, it } from "vitest";
import { createObjectId, createRecipeDoc } from "@/__tests__/helpers.js";
import {
  toRecipeDetails,
  toRecipeListItem,
  toRecipeSummary,
} from "./recipe.mapper.js";
import type { RecipeDocumentPopulated } from "./recipe.model.js";

describe("toRecipeSummary", () => {
  it("should map RecipeSummaryView to RecipeSummary DTO", () => {
    const doc = {
      _id: createObjectId(),
      title: "Pasta Carbonara",
      slug: "pasta-carbonara",
    };

    const result = toRecipeSummary(doc);

    expect(result).toEqual({
      id: doc._id.toString(),
      title: "Pasta Carbonara",
      slug: "pasta-carbonara",
    });
  });
});

describe("toRecipeListItem", () => {
  it("should map recipe document to RecipeListItem DTO", () => {
    const categoryId = createObjectId();
    const authorId = createObjectId();
    const doc = {
      _id: createObjectId(),
      title: "Pasta",
      slug: "pasta",
      image: { url: "https://example.com/pasta.jpg" },
      difficulty: "easy" as const,
      mealType: "breakfast" as const,
      cookingTime: 30 as Minutes,
      servings: 4,
      category: {
        _id: categoryId,
        name: "Italian",
        slug: "italian",
        image: { url: "https://example.com/italian.jpg" },
      },
      author: {
        _id: authorId,
        name: "Chef",
        email: "chef@test.com",
      },
      userRating: 4,
      stats: {
        favoritesCount: 2,
        commentsCount: 4,
        ratingCount: 10,
        ratingSum: 20,
        averageRating: 4.2,
        popularity: 10,
      },
    };

    const result = toRecipeListItem(doc, true);

    expect(result.id).toBe(doc._id.toString());
    expect(result.title).toBe("Pasta");
    expect(result.slug).toBe("pasta");
    expect(result.isFavorited).toBe(true);
    expect(result.userRating).toBe(4);
    expect(result.image).toEqual({
      url: "https://example.com/pasta.jpg",
      alt: "Pasta",
    });
    expect(result.difficulty).toBe("easy");
    expect(result.mealType).toBe("breakfast");
    expect(result.cookingTime).toBe(30);
    expect(result.servings).toBe(4);
    expect(result.category).toEqual({
      id: categoryId.toString(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg", alt: "Italian" },
    });
    expect(result.author).toEqual({
      id: authorId.toString(),
      email: "chef@test.com",
      name: "Chef",
    });
    expect(result.stats.averageRating).toBe(4.2);
    expect(result.stats.ratingCount).toBe(10);
    expect(result.stats.favoritesCount).toBe(2);
    expect(result.stats.commentsCount).toBe(4);
    expect(result.stats.popularity).toBe(10);
  });

  it("should default rating fields when missing", () => {
    const doc = {
      _id: createObjectId(),
      title: "Soup",
      slug: "soup",
      image: { url: "https://example.com/soup.jpg" },
      difficulty: "easy" as const,
      mealType: "breakfast" as const,
      cookingTime: 20 as Minutes,
      servings: 2,
      category: {
        _id: createObjectId(),
        name: "Cat",
        slug: "cat",
        image: { url: "https://example.com/cat.jpg" },
      },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
      stats: {
        favoritesCount: 0,
        commentsCount: 0,
        ratingCount: 0,
        ratingSum: 0,
        averageRating: null,
        popularity: 0,
      },
    };

    const result = toRecipeListItem(doc, false);

    expect(result.userRating).toBeNull();
    expect(result.stats.averageRating).toBeNull();
    expect(result.stats.ratingCount).toBe(0);
    expect(result.stats.ratingSum).toBe(0);
    expect(result.isFavorited).toBe(false);
  });

  it("should default partial stats fields when some are missing", () => {
    const doc = {
      _id: createObjectId(),
      title: "Salad",
      slug: "salad",
      image: { url: "https://example.com/salad.jpg" },
      difficulty: "medium" as const,
      mealType: "dinner" as const,
      cookingTime: 15 as Minutes,
      servings: 2,
      category: {
        _id: createObjectId(),
        name: "Cat",
        slug: "cat",
        image: { url: "https://example.com/cat.jpg" },
      },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
      stats: {
        favoritesCount: 5,
        commentsCount: 3,
      } as never,
    };

    const result = toRecipeListItem(doc, false);

    expect(result.stats.favoritesCount).toBe(5);
    expect(result.stats.commentsCount).toBe(3);
    expect(result.stats.ratingCount).toBe(0);
    expect(result.stats.ratingSum).toBe(0);
    expect(result.stats.averageRating).toBeNull();
    expect(result.stats.popularity).toBe(0);
  });
});

describe("toRecipeDetails", () => {
  it("should map recipe document to Recipe DTO", () => {
    const categoryId = createObjectId();
    const authorId = createObjectId();
    const doc = {
      ...createRecipeDoc({
        title: "Pasta",
        slug: "pasta",
        description: "Delicious pasta",
        difficulty: "easy",
        cookingTime: 30 as Minutes,
        servings: 4,
        isPublic: true,
      }),
      cuisine: undefined,
      category: {
        _id: categoryId,
        name: "Italian",
        slug: "italian",
        image: { url: "https://example.com/italian.jpg" },
      },
      author: {
        _id: authorId,
        name: "Chef",
        email: "chef@test.com",
      },
      isFavorited: true,
      userRating: 4,
      stats: {
        favoritesCount: 2,
        commentsCount: 4,
        ratingCount: 10,
        ratingSum: 20,
        averageRating: 4.2,
        popularity: 10,
      },
    } satisfies RecipeDocumentPopulated & RecipeComputed;

    const result = toRecipeDetails(doc, doc.isFavorited);

    expect(result.id).toBe(doc._id.toString());
    expect(result.title).toBe("Pasta");
    expect(result.slug).toBe("pasta");
    expect(result.isFavorited).toBe(doc.isFavorited);
    expect(result.category).toEqual({
      id: categoryId.toString(),
      name: "Italian",
      slug: "italian",
      image: { url: "https://example.com/italian.jpg", alt: "Italian" },
    });
    expect(result.author).toEqual({
      id: authorId.toString(),
      email: "chef@test.com",
      name: "Chef",
    });
    expect(result.userRating).toBe(4);
    expect(result.stats.averageRating).toBe(4.2);
    expect(result.stats.ratingCount).toBe(10);
    expect(result.stats.ratingSum).toBe(20);
    expect(result.stats.favoritesCount).toBe(2);
    expect(result.stats.commentsCount).toBe(4);
    expect(result.stats.popularity).toBe(10);
  });

  it("should default rating fields when missing", () => {
    const doc = {
      ...createRecipeDoc(),
      cuisine: undefined,
      category: {
        _id: createObjectId(),
        name: "Cat",
        slug: "cat",
        image: { url: "https://example.com/cat.jpg" },
      },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
    };

    const result = toRecipeDetails(doc, false);

    expect(result.userRating).toBeNull();
    expect(result.stats.averageRating).toBeNull();
    expect(result.stats.ratingCount).toBe(0);
  });

  it("should map isFavorited=false", () => {
    const doc = {
      ...createRecipeDoc(),
      cuisine: undefined,
      category: {
        _id: createObjectId(),
        name: "Cat",
        slug: "cat",
        image: { url: "https://example.com/cat.jpg" },
      },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
    };

    const result = toRecipeDetails(doc, false);

    expect(result.isFavorited).toBe(false);
  });

  it("should default partial stats fields when some are missing", () => {
    const doc = {
      ...createRecipeDoc(),
      cuisine: undefined,
      category: {
        _id: createObjectId(),
        name: "Cat",
        slug: "cat",
        image: { url: "https://example.com/cat.jpg" },
      },
      author: { _id: createObjectId(), name: "Auth", email: "a@b.c" },
      stats: {
        favoritesCount: 5,
        commentsCount: 3,
      } as never,
    };

    const result = toRecipeDetails(doc, false);

    expect(result.stats.favoritesCount).toBe(5);
    expect(result.stats.commentsCount).toBe(3);
    expect(result.stats.ratingCount).toBe(0);
    expect(result.stats.ratingSum).toBe(0);
    expect(result.stats.averageRating).toBeNull();
    expect(result.stats.popularity).toBe(0);
  });
});
