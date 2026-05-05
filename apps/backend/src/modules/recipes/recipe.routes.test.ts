import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeader, createTestApp } from "@/__tests__/build-test-app.js";
import { recipeRoutes } from "@/modules/recipes/recipe.routes.js";

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/common/utils/jwt.js", () => ({ verifyToken }));

describe("recipeRoutes", () => {
  const mockRecipeService = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockCommentService = {
    findByRecipe: vi.fn(),
    findByAuthor: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  };

  const userId = "507f1f77bcf86cd799439011";
  const adminId = "507f1f77bcf86cd799439022";
  const recipeId = "507f1f77bcf86cd799439033";
  const commentId = "507f1f77bcf86cd799439044";

  const validRecipe = {
    id: recipeId,
    title: "Test Recipe",
    description: "A delicious test recipe",
    ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
    instructions: ["Mix ingredients", "Bake it well"],
    category: {
      id: "507f1f77bcf86cd799439055",
      name: "Desserts",
      slug: "desserts",
    },
    author: { id: userId, email: "chef@test.com", name: "Chef" },
    difficulty: "easy" as const,
    cookingTime: 30,
    servings: 4,
    isPublic: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    isFavorited: false,
    userRating: null,
    averageRating: null,
    ratingCount: 0,
  };

  const paginatedResult = {
    items: [validRecipe],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildApp() {
    const app = createTestApp();
    app.register(recipeRoutes, {
      service: mockRecipeService,
      commentService: mockCommentService,
      prefix: "/api/recipes",
    });
    return app;
  }

  describe("GET /api/recipes", () => {
    it("should return paginated recipes for unauthenticated user", async () => {
      const app = buildApp();
      mockRecipeService.findAll.mockResolvedValue(paginatedResult);

      const response = await app.inject({
        method: "GET",
        url: "/api/recipes?page=1&limit=10",
      });

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.findAll).toHaveBeenCalledWith({
        query: expect.objectContaining({ page: 1, limit: 10 }),
        initiator: { id: undefined, role: undefined },
      });
      const body = JSON.parse(response.payload);
      expect(body.items).toHaveLength(1);
    });

    it("should return paginated recipes for authenticated user", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockRecipeService.findAll.mockResolvedValue(paginatedResult);

      const response = await app.inject({
        method: "GET",
        url: "/api/recipes",
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.findAll).toHaveBeenCalledWith({
        query: expect.any(Object),
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 400 for invalid query params", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "GET",
        url: "/api/recipes?page=abc",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/recipes/:id", () => {
    it("should return recipe by id", async () => {
      const app = buildApp();
      mockRecipeService.findById.mockResolvedValue(validRecipe);

      const response = await app.inject({
        method: "GET",
        url: `/api/recipes/${recipeId}`,
      });

      if (response.statusCode !== 200) {
        console.log(
          "GET /api/recipes/:id response:",
          response.statusCode,
          JSON.parse(response.payload),
        );
      }

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.findById).toHaveBeenCalledWith(recipeId, {
        initiator: { id: undefined, role: undefined },
      });
      const body = JSON.parse(response.payload);
      expect(body.title).toBe("Test Recipe");
    });

    it("should return 400 for invalid id", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "GET",
        url: "/api/recipes/invalid-id",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when recipe not found", async () => {
      const app = buildApp();
      mockRecipeService.findById.mockRejectedValue(
        Object.assign(new Error("Recipe not found"), {
          statusCode: 404,
          code: "NOT_FOUND",
        }),
      );

      const response = await app.inject({
        method: "GET",
        url: `/api/recipes/${recipeId}`,
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /api/recipes", () => {
    it("should create recipe when authenticated", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockRecipeService.create.mockResolvedValue(validRecipe);

      const payload = {
        title: "New Recipe",
        description: "A new recipe description",
        ingredients: [{ name: "Flour", quantity: 100, unit: "g" }],
        instructions: ["Mix all ingredients together"],
        category: "507f1f77bcf86cd799439055",
        difficulty: "easy",
        cookingTime: 20,
        servings: 2,
        isPublic: true,
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/recipes",
        payload,
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      if (response.statusCode !== 201) {
        console.log(
          "POST /api/recipes response:",
          response.statusCode,
          JSON.parse(response.payload),
        );
      }

      expect(response.statusCode).toBe(201);
      expect(mockRecipeService.create).toHaveBeenCalledWith({
        data: payload,
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "POST",
        url: "/api/recipes",
        payload: {},
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid body", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/recipes",
        payload: { title: "AB" },
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PATCH /api/recipes/:id", () => {
    it("should update recipe when authenticated", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockRecipeService.update.mockResolvedValue({
        ...validRecipe,
        title: "Updated",
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/api/recipes/${recipeId}`,
        payload: { title: "Updated" },
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(200);
      expect(mockRecipeService.update).toHaveBeenCalledWith(recipeId, {
        data: { title: "Updated", isPublic: true },
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "PATCH",
        url: `/api/recipes/${recipeId}`,
        payload: {},
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 for invalid id", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });

      const response = await app.inject({
        method: "PATCH",
        url: "/api/recipes/bad-id",
        payload: {},
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/recipes/:id", () => {
    it("should delete recipe when authenticated", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockRecipeService.delete.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}`,
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(204);
      expect(mockRecipeService.delete).toHaveBeenCalledWith(recipeId, {
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/${recipeId}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /api/recipes/:id/comments", () => {
    it("should return comments for recipe", async () => {
      const app = buildApp();
      mockCommentService.findByRecipe.mockResolvedValue({
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/recipes/${recipeId}/comments`,
      });

      expect(response.statusCode).toBe(200);
      expect(mockCommentService.findByRecipe).toHaveBeenCalledWith(recipeId, {
        query: expect.any(Object),
        initiator: { id: undefined, role: undefined },
      });
    });

    it("should return 400 for invalid recipe id", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "GET",
        url: "/api/recipes/bad-id/comments",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/recipes/:id/comments", () => {
    it("should create comment when authenticated", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockCommentService.create.mockResolvedValue({
        id: commentId,
        text: "Great!",
        recipe: { id: recipeId, title: "Test" },
        author: { id: userId, email: "user@test.com", name: "User" },
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      });

      const response = await app.inject({
        method: "POST",
        url: `/api/recipes/${recipeId}/comments`,
        payload: { text: "Great!" },
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(201);
      expect(mockCommentService.create).toHaveBeenCalledWith(recipeId, {
        data: { text: "Great!" },
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "POST",
        url: `/api/recipes/${recipeId}/comments`,
        payload: { text: "Hi" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /api/recipes/comments/:id", () => {
    it("should delete comment when authenticated", async () => {
      const app = buildApp();
      verifyToken.mockReturnValue({
        userId,
        email: "user@test.com",
        role: "user",
      });
      mockCommentService.delete.mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/comments/${commentId}`,
        headers: authHeader({ userId, email: "user@test.com", role: "user" }),
      });

      expect(response.statusCode).toBe(204);
      expect(mockCommentService.delete).toHaveBeenCalledWith(commentId, {
        initiator: { id: userId, role: "user" },
      });
    });

    it("should return 401 when not authenticated", async () => {
      const app = buildApp();
      const response = await app.inject({
        method: "DELETE",
        url: `/api/recipes/comments/${commentId}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
