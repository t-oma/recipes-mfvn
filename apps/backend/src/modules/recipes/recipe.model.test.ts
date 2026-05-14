import { describe, expect, it } from "vitest";
import { RecipeModel } from "./recipe.model.js";

describe("RecipeModel", () => {
  describe("stats defaults", () => {
    it("should create recipe with default stats when stats not provided", () => {
      const recipe = new RecipeModel({
        title: "Test Recipe",
        description: "A test recipe",
        ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
        instructions: ["Mix ingredients"],
        category: "507f1f77bcf86cd799439011",
        author: "507f1f77bcf86cd799439022",
        difficulty: "easy",
        cookingTime: 30,
        servings: 4,
        isPublic: true,
        image: { url: "https://example.com/image.jpg" },
      });

      expect(recipe.stats.favoritesCount).toBe(0);
      expect(recipe.stats.commentsCount).toBe(0);
      expect(recipe.stats.ratingCount).toBe(0);
      expect(recipe.stats.ratingSum).toBe(0);
      expect(recipe.stats.averageRating).toBeNull();
      expect(recipe.stats.popularity).toBe(0);
    });

    it("should allow custom stats on creation", () => {
      const recipe = new RecipeModel({
        title: "Test Recipe",
        description: "A test recipe",
        ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
        instructions: ["Mix ingredients"],
        category: "507f1f77bcf86cd799439011",
        author: "507f1f77bcf86cd799439022",
        difficulty: "easy",
        cookingTime: 30,
        servings: 4,
        isPublic: true,
        image: { url: "https://example.com/image.jpg" },
        stats: {
          favoritesCount: 5,
          commentsCount: 3,
          ratingCount: 10,
          ratingSum: 45,
          averageRating: 4.5,
          popularity: 42,
        },
      });

      expect(recipe.stats.favoritesCount).toBe(5);
      expect(recipe.stats.commentsCount).toBe(3);
      expect(recipe.stats.ratingCount).toBe(10);
      expect(recipe.stats.ratingSum).toBe(45);
      expect(recipe.stats.averageRating).toBe(4.5);
      expect(recipe.stats.popularity).toBe(42);
    });

    it("should default missing stat fields to their defaults", () => {
      const recipe = new RecipeModel({
        title: "Test Recipe",
        description: "A test recipe",
        ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
        instructions: ["Mix ingredients"],
        category: "507f1f77bcf86cd799439011",
        author: "507f1f77bcf86cd799439022",
        difficulty: "easy",
        cookingTime: 30,
        servings: 4,
        isPublic: true,
        image: { url: "https://example.com/image.jpg" },
        stats: {
          favoritesCount: 7,
        } as never,
      });

      expect(recipe.stats.favoritesCount).toBe(7);
      expect(recipe.stats.commentsCount).toBe(0);
      expect(recipe.stats.ratingCount).toBe(0);
      expect(recipe.stats.ratingSum).toBe(0);
      expect(recipe.stats.averageRating).toBeNull();
      expect(recipe.stats.popularity).toBe(0);
    });
  });
});
