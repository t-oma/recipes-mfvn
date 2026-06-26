import { describe, expect, it } from "vitest";
import {
  createDbCuisine,
  createDbRecipe,
  createDbUser,
} from "@/__tests__/db-factories.js";
import { CuisineModel } from "./cuisine.model.js";
import { CuisineRepository } from "./cuisine.repository.js";

describe("CuisineRepository", () => {
  const repository = new CuisineRepository(CuisineModel);

  describe("findMany", () => {
    it("should return cuisines with correct recipeCount", async () => {
      const cuisineA = await createDbCuisine({ name: "Italian" });
      const cuisineB = await createDbCuisine({ name: "Mexican" });
      const user = await createDbUser();

      await createDbRecipe({ cuisine: cuisineA._id, author: user._id });
      await createDbRecipe({ cuisine: cuisineA._id, author: user._id });
      await createDbRecipe({ cuisine: cuisineB._id, author: user._id });

      const [items, total] = await repository.findMany({
        sort: "name",
        order: "asc",
        page: 1,
        limit: 10,
      });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);

      const italian = items.find((c) => c.name === "Italian");
      const mexican = items.find((c) => c.name === "Mexican");

      expect(italian?.recipeCount).toBe(2);
      expect(mexican?.recipeCount).toBe(1);
    });

    it("should return empty result when no cuisines exist", async () => {
      const [items, total] = await repository.findMany({
        sort: "name",
        order: "asc",
        page: 1,
        limit: 10,
      });

      expect(items).toEqual([]);
      expect(total).toBe(0);
    });

    it("should paginate correctly", async () => {
      await createDbCuisine({ name: "A-Cuisine" });
      await createDbCuisine({ name: "B-Cuisine" });
      await createDbCuisine({ name: "C-Cuisine" });

      const [items, total] = await repository.findMany({
        sort: "name",
        order: "asc",
        page: 2,
        limit: 1,
      });

      expect(total).toBe(3);
      expect(items).toHaveLength(1);
      expect(items[0]?.name).toBe("B-Cuisine");
    });

    it("should sort by name ascending", async () => {
      await createDbCuisine({ name: "Zebra" });
      await createDbCuisine({ name: "Apple" });
      await createDbCuisine({ name: "Mango" });

      const [items] = await repository.findMany({
        sort: "name",
        order: "asc",
        page: 1,
        limit: 10,
      });

      expect(items.map((c) => c.name)).toEqual(["Apple", "Mango", "Zebra"]);
    });

    it("should sort by name descending", async () => {
      await createDbCuisine({ name: "Zebra" });
      await createDbCuisine({ name: "Apple" });
      await createDbCuisine({ name: "Mango" });

      const [items] = await repository.findMany({
        sort: "name",
        order: "desc",
        page: 1,
        limit: 10,
      });

      expect(items.map((c) => c.name)).toEqual(["Zebra", "Mango", "Apple"]);
    });
  });

  describe("inherited BaseRepository methods", () => {
    it("should create and findById a cuisine", async () => {
      const created = await repository.create({
        name: "Test Cuisine",
        slug: "test-cuisine",
        description: "Desc",
        image: { url: "https://example.com/cuisine.jpg" },
      });

      const found = await repository.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.name).toBe("Test Cuisine");
      expect(found?.slug).toBe("test-cuisine");
    });

    it("should update a cuisine", async () => {
      const created = await repository.create({
        name: "Old Name",
        slug: "old-name",
        image: { url: "https://example.com/old.jpg" },
      });

      const updated = await repository.update(created._id.toString(), {
        name: "New Name",
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("New Name");
    });

    it("should delete a cuisine by id", async () => {
      const created = await repository.create({
        name: "To Delete",
        slug: "to-delete",
        image: { url: "https://example.com/del.jpg" },
      });

      const deleted = await repository.delete(created._id.toString());

      expect(deleted).not.toBeNull();
      expect(deleted?.name).toBe("To Delete");

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });
  });
});
