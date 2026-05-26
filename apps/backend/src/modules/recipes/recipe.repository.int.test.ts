import { beforeAll, describe, expect, it } from "vitest";
import {
  createDbCategory,
  createDbCuisine,
  createDbFavorite,
  createDbRecipe,
  createDbRecipeRating,
  createDbUser,
} from "@/__tests__/db-factories.js";
import { noInitiator } from "@/__tests__/helpers.js";
import { RecipeModel } from "./recipe.model.js";
import { RecipeRepository } from "./recipe.repository.js";

describe("RecipeRepository", () => {
  const repository = new RecipeRepository(RecipeModel);

  describe("aggregateSearch", () => {
    it("should return public recipes with populated data", async () => {
      const author = await createDbUser({ name: "Chef" });
      const category = await createDbCategory({
        name: "Italian",
        image: {
          url: "https://example.com/italian.jpg",
        },
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Pasta",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(1);
      expect(recipes).toHaveLength(1);
      expect(recipes[0]?.title).toBe("Pasta");
      expect(recipes[0]?.author.name).toBe("Chef");
      expect(recipes[0]?.category.name).toBe("Italian");
      expect(recipes[0]?.category.image.url).toBe(
        "https://example.com/italian.jpg",
      );
    });

    it("should NOT show private recipes when unauthenticated", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: false,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(0);
      expect(recipes).toEqual([]);
    });

    it("should show own private recipes to the author", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Secret",
        isPublic: false,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: {
          id: author._id.toString(),
          role: "user",
        },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.title).toBe("Secret");
    });

    it("should show all recipes to admin", async () => {
      const author = await createDbUser();
      const admin = await createDbUser({ role: "admin" });
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: false,
      });

      const [, total] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: {
          id: admin._id.toString(),
          role: "admin",
        },
      });

      expect(total).toBe(1);
    });

    it("should filter by categoryId", async () => {
      const author = await createDbUser();
      const catA = await createDbCategory({ name: "A" });
      const catB = await createDbCategory({ name: "B" });
      await createDbRecipe({
        author: author._id,
        category: catA._id,
        title: "Recipe A",
        isPublic: true,
      });
      await createDbRecipe({
        author: author._id,
        category: catB._id,
        title: "Recipe B",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: {
          page: 1,
          limit: 10,
          sort: "-createdAt",
          categoryId: catA._id.toString(),
        },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.title).toBe("Recipe A");
    });

    it("should filter by difficulty", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        difficulty: "easy",
        isPublic: true,
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        difficulty: "hard",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: {
          page: 1,
          limit: 10,
          sort: "-createdAt",
          difficulty: "hard",
        },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.difficulty).toBe("hard");
    });

    it("should filter by isFavorited", async () => {
      const user = await createDbUser();
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });
      await createDbFavorite({ user: user._id, recipe: recipe._id });

      const [recipes, total] = await repository.aggregateSearch({
        query: {
          page: 1,
          limit: 10,
          sort: "-createdAt",
          isFavorited: true,
        },
        initiator: {
          id: user._id.toString(),
          role: "user",
        },
      });

      expect(total).toBe(1);
      expect(recipes[0]?.isFavorited).toBe(true);
    });

    describe(() => {
      beforeAll(async () => {
        const author = await createDbUser();
        const category = await createDbCategory();
        await createDbRecipe({
          title: "Breakfast",
          author: author._id,
          category: category._id,
          mealType: "breakfast",
          isPublic: true,
        });
        await createDbRecipe({
          title: "Lunch",
          author: author._id,
          category: category._id,
          mealType: "lunch",
          isPublic: true,
        });
        await createDbRecipe({
          title: "Dinner",
          author: author._id,
          category: category._id,
          mealType: "dinner",
          isPublic: true,
        });
        await createDbRecipe({
          title: "Snack",
          author: author._id,
          category: category._id,
          mealType: "snack",
          isPublic: true,
        });
        await createDbRecipe({
          title: "Beverage",
          author: author._id,
          category: category._id,
          mealType: "beverage",
          isPublic: true,
        });
      });

      it.for([
        { mealType: "breakfast" as const },
        { mealType: "lunch" as const },
        { mealType: "dinner" as const },
        { mealType: "snack" as const },
        { mealType: "beverage" as const },
      ])("should filter by $mealType mealType", async ({ mealType }) => {
        const [recipes, total] = await repository.aggregateSearch({
          query: {
            page: 1,
            limit: 10,
            sort: "-createdAt",
            mealType,
          },
          initiator: noInitiator(),
        });

        expect(total).toBe(1);
        expect(recipes[0]?.mealType).toBe(mealType);
      });
    });

    it("should filter by cuisineId", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const italian = await createDbCuisine({ name: "Italian" });
      const mexican = await createDbCuisine({ name: "Mexican" });

      await createDbRecipe({
        title: "Pasta",
        author: author._id,
        category: category._id,
        cuisine: italian._id,
        isPublic: true,
      });
      await createDbRecipe({
        title: "Tacos",
        author: author._id,
        category: category._id,
        cuisine: mexican._id,
        isPublic: true,
      });
      await createDbRecipe({
        title: "No Cuisine",
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: {
          page: 1,
          limit: 10,
          sort: "-createdAt",
          cuisineId: italian._id.toString(),
        },
        initiator: noInitiator(),
      });

      expect(total).toBe(1);
      expect(recipes).toHaveLength(1);
      expect(recipes[0]?.title).toBe("Pasta");
      expect(recipes[0]?.cuisine?.name).toBe("Italian");
    });

    it("should include cuisine as undefined when not set", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();

      await createDbRecipe({
        title: "Simple Recipe",
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      const [recipes] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: noInitiator(),
      });

      const recipe = recipes.find((r) => r.title === "Simple Recipe");
      expect(recipe).toBeDefined();
      expect(recipe?.cuisine).toBeUndefined();
    });

    it("should return ratings data", async () => {
      const user = await createDbUser();
      const otherUser = await createDbUser();
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 2,
          ratingSum: 9,
          averageRating: 4.5,
          popularity: 0,
        },
      });
      await createDbRecipeRating({
        user: user._id,
        recipe: recipe._id,
        value: 4,
      });
      await createDbRecipeRating({
        user: otherUser._id,
        recipe: recipe._id,
        value: 5,
      });

      const [recipes] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-createdAt" },
        initiator: {
          id: user._id.toString(),
          role: "user",
        },
      });

      expect(recipes[0]?.userRating).toBe(4);
      expect(recipes[0]?.stats.averageRating).toBe(4.5);
      expect(recipes[0]?.stats.ratingCount).toBe(2);
    });

    it("should paginate correctly", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "First",
        isPublic: true,
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Second",
        isPublic: true,
      });

      const [recipes, total] = await repository.aggregateSearch({
        query: { page: 2, limit: 1, sort: "-createdAt" },
        initiator: { id: undefined, role: undefined },
      });

      expect(total).toBe(2);
      expect(recipes).toHaveLength(1);
    });

    it("should sort by popularity descending", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Low",
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 0,
          ratingSum: 0,
          averageRating: null,
          popularity: 5,
        },
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "High",
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 0,
          ratingSum: 0,
          averageRating: null,
          popularity: 50,
        },
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Medium",
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 0,
          ratingSum: 0,
          averageRating: null,
          popularity: 20,
        },
      });

      const [recipes] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "-popularity" },
        initiator: noInitiator(),
      });

      expect(recipes).toHaveLength(3);
      expect(recipes[0]?.title).toBe("High");
      expect(recipes[1]?.title).toBe("Medium");
      expect(recipes[2]?.title).toBe("Low");
    });

    it("should sort by popularity ascending", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Low",
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 0,
          ratingSum: 0,
          averageRating: null,
          popularity: 5,
        },
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "High",
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 0,
          ratingSum: 0,
          averageRating: null,
          popularity: 50,
        },
      });
      await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Medium",
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 0,
          ratingSum: 0,
          averageRating: null,
          popularity: 20,
        },
      });

      const [recipes] = await repository.aggregateSearch({
        query: { page: 1, limit: 10, sort: "popularity" },
        initiator: noInitiator(),
      });

      expect(recipes).toHaveLength(3);
      expect(recipes[0]?.title).toBe("Low");
      expect(recipes[1]?.title).toBe("Medium");
      expect(recipes[2]?.title).toBe("High");
    });
  });

  describe("aggregateById", () => {
    it("should return recipe by id with populated data", async () => {
      const author = await createDbUser({ name: "Chef" });
      const category = await createDbCategory({ name: "Desserts" });
      const cuisine = await createDbCuisine({ name: "Italian" });
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        cuisine: cuisine._id,
        title: "Cake",
        isPublic: true,
      });

      const result = await repository.aggregateById(recipe._id.toString(), {
        initiator: { id: undefined, role: undefined },
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe("Cake");
      expect(result?.author.name).toBe("Chef");
      expect(result?.category.name).toBe("Desserts");
      expect(result?.cuisine?.name).toBe("Italian");
      expect(result?.cuisine?.slug).toBe("italian");
    });

    it("should return recipe with undefined cuisine when not set", async () => {
      const author = await createDbUser({ name: "Chef" });
      const category = await createDbCategory({ name: "Soups" });
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Simple Soup",
        isPublic: true,
      });

      const result = await repository.aggregateById(recipe._id.toString(), {
        initiator: { id: undefined, role: undefined },
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe("Simple Soup");
      expect(result?.cuisine).toBeUndefined();
    });

    it("should return undefined for private recipe when unauthenticated", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: false,
      });

      const result = await repository.aggregateById(recipe._id.toString(), {
        initiator: { id: undefined, role: undefined },
      });

      expect(result).toBeUndefined();
    });

    it("should return own private recipe to the author", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        title: "Secret",
        isPublic: false,
      });

      const result = await repository.aggregateById(recipe._id.toString(), {
        initiator: {
          id: author._id.toString(),
          role: "user",
        },
      });

      expect(result?.title).toBe("Secret");
    });
  });

  describe("applyFavoritesDelta", () => {
    it("should increment favoritesCount and recalculate popularity", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      const result = await repository.applyFavoritesDelta(
        recipe._id.toString(),
        1,
      );

      expect(result?.stats.favoritesCount).toBe(1);
      expect(result?.stats.popularity).toBe(3);
    });

    it("should decrement favoritesCount", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
        stats: {
          favoritesCount: 2,
          commentsCount: 0,
          ratingCount: 0,
          ratingSum: 0,
          averageRating: null,
          popularity: 6,
        },
      });

      const result = await repository.applyFavoritesDelta(
        recipe._id.toString(),
        -1,
      );

      expect(result?.stats.favoritesCount).toBe(1);
      expect(result?.stats.popularity).toBe(3);
    });

    it("should not allow favoritesCount to go below zero", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      const result = await repository.applyFavoritesDelta(
        recipe._id.toString(),
        -1,
      );

      expect(result?.stats.favoritesCount).toBe(0);
      expect(result?.stats.popularity).toBe(0);
    });
  });

  describe("applyCommentsDelta", () => {
    it("should increment commentsCount and recalculate popularity", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      const result = await repository.applyCommentsDelta(
        recipe._id.toString(),
        1,
      );

      expect(result?.stats.commentsCount).toBe(1);
      expect(result?.stats.popularity).toBe(2);
    });

    it("should not allow commentsCount to go below zero", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      const result = await repository.applyCommentsDelta(
        recipe._id.toString(),
        -1,
      );

      expect(result?.stats.commentsCount).toBe(0);
    });
  });

  describe("applyRatingCreated", () => {
    it("should add first rating and compute averageRating", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
      });

      const result = await repository.applyRatingCreated(
        recipe._id.toString(),
        4,
      );

      expect(result?.stats.ratingCount).toBe(1);
      expect(result?.stats.ratingSum).toBe(4);
      expect(result?.stats.averageRating).toBe(4);
      expect(result?.stats.popularity).toBe(21);
    });

    it("should add second rating and update average", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 1,
          ratingSum: 4,
          averageRating: 4,
          popularity: 21,
        },
      });

      const result = await repository.applyRatingCreated(
        recipe._id.toString(),
        5,
      );

      expect(result?.stats.ratingCount).toBe(2);
      expect(result?.stats.ratingSum).toBe(9);
      expect(result?.stats.averageRating).toBe(4.5);
      expect(result?.stats.popularity).toBe(24.5);
    });
  });

  describe("applyRatingUpdated", () => {
    it("should update rating sum and average", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 2,
          ratingSum: 9,
          averageRating: 4.5,
          popularity: 24.5,
        },
      });

      const result = await repository.applyRatingUpdated(
        recipe._id.toString(),
        4,
        5,
      );

      expect(result?.stats.ratingCount).toBe(2);
      expect(result?.stats.ratingSum).toBe(10);
      expect(result?.stats.averageRating).toBe(5);
      expect(result?.stats.popularity).toBe(27);
    });
  });

  describe("applyRatingDeleted", () => {
    it("should remove rating and update average", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 2,
          ratingSum: 9,
          averageRating: 4.5,
          popularity: 24.5,
        },
      });

      const result = await repository.applyRatingDeleted(
        recipe._id.toString(),
        5,
      );

      expect(result?.stats.ratingCount).toBe(1);
      expect(result?.stats.ratingSum).toBe(4);
      expect(result?.stats.averageRating).toBe(4);
      expect(result?.stats.popularity).toBe(21);
    });

    it("should set averageRating to null when last rating is deleted", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
        stats: {
          favoritesCount: 0,
          commentsCount: 0,
          ratingCount: 1,
          ratingSum: 4,
          averageRating: 4,
          popularity: 21,
        },
      });

      const result = await repository.applyRatingDeleted(
        recipe._id.toString(),
        4,
      );

      expect(result?.stats.ratingCount).toBe(0);
      expect(result?.stats.ratingSum).toBe(0);
      expect(result?.stats.averageRating).toBeNull();
      expect(result?.stats.popularity).toBe(0);
    });
  });

  describe("combined stats update", () => {
    it("should recalculate popularity correctly after multiple deltas", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();
      const recipe = await createDbRecipe({
        author: author._id,
        category: category._id,
        isPublic: true,
        stats: {
          favoritesCount: 2,
          commentsCount: 1,
          ratingCount: 3,
          ratingSum: 12,
          averageRating: 4,
          popularity: 0,
        },
      });

      const result = await repository.applyFavoritesDelta(
        recipe._id.toString(),
        1,
      );

      expect(result?.stats.favoritesCount).toBe(3);
      expect(result?.stats.commentsCount).toBe(1);
      expect(result?.stats.ratingCount).toBe(3);
      expect(result?.stats.averageRating).toBe(4);
      expect(result?.stats.popularity).toBe(34);
    });
  });

  describe("inherited BaseRepository methods", () => {
    it("should create and findById a recipe", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();

      const created = await repository.create({
        title: "New Recipe",
        description: "Desc",
        ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
        instructions: ["Mix"],
        category: category._id.toString(),
        author: author._id.toString(),
        difficulty: "easy",
        mealType: "breakfast",
        cookingTime: 30 as never,
        servings: 2,
        isPublic: true,
        image: { url: "https://example.com/image.jpg" },
      });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.title).toBe("New Recipe");
    });

    it("should delete a recipe by id", async () => {
      const author = await createDbUser();
      const category = await createDbCategory();

      const created = await repository.create({
        title: "To Delete",
        description: "Desc",
        ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
        instructions: ["Mix"],
        category: category._id.toString(),
        author: author._id.toString(),
        difficulty: "easy",
        mealType: "breakfast",
        cookingTime: 30 as never,
        servings: 2,
        isPublic: true,
        image: { url: "https://example.com/image.jpg" },
      });

      const deleted = await repository.delete(created._id.toString());
      expect(deleted).not.toBeNull();

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
