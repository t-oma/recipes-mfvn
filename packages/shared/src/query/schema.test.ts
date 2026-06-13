import { describe, expect, it } from "vitest";
import { categoryQuerySchema } from "../categories/category.query";
import { cuisineQuerySchema } from "../cuisines/cuisine.query";
import { recipeQuerySchema } from "../recipes/recipe.query";
import { reviewQuerySchema } from "../reviews/review.query";

describe("query sort defaults", () => {
  it("defaults category queries to name ascending", () => {
    expect(categoryQuerySchema.parse({})).toMatchObject({
      sort: "name",
      order: "asc",
    });
  });

  it("defaults cuisine queries to name ascending", () => {
    expect(cuisineQuerySchema.parse({})).toMatchObject({
      sort: "name",
      order: "asc",
    });
  });

  it("defaults recipe queries to createdAt descending", () => {
    expect(recipeQuerySchema.parse({})).toMatchObject({
      sort: "createdAt",
      order: "desc",
    });
  });

  it("defaults review queries to createdAt descending", () => {
    expect(reviewQuerySchema.parse({})).toMatchObject({
      sort: "createdAt",
      order: "desc",
    });
  });
});
