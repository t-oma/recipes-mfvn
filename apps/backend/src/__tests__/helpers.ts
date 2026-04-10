import type { Minutes } from "@recipes/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Types } from "mongoose";
import { vi } from "vitest";
import type { CategoryDocument } from "@/modules/categories/category.model.js";
import type { CommentDocument } from "@/modules/comments/comment.model.js";
import type { RecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { UserDocument, UserRole } from "@/modules/users/user.model.js";

// ── Fastify mocks ──

/**
 * Creates a mock Fastify request.
 *
 * @param overrides - Overrides for the request.
 * @returns A mock Fastify request.
 */
export function createMockRequest(
  overrides: Partial<FastifyRequest> = {},
): FastifyRequest {
  return {
    log: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
    method: "GET",
    url: "/test",
    headers: {},
    ...overrides,
  } as unknown as FastifyRequest;
}

/**
 * Creates a mock Fastify reply.
 *
 * @returns A mock Fastify reply.
 */
export function createMockReply(): FastifyReply {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));
  return {
    status,
    send,
  } as unknown as FastifyReply;
}

// ── Document factories ──

/**
 * Creates new ObjectId.
 *
 * @returns A new ObjectId.
 */
export function createObjectId(): Types.ObjectId {
  return new Types.ObjectId();
}

export function createCategoryDoc(
  overrides: Partial<CategoryDocument> = {},
): CategoryDocument {
  const _id = createObjectId();
  return {
    _id,
    name: "Test Category",
    slug: "test-category",
    description: "A test category",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  } as CategoryDocument;
}

export function createUserDoc(
  overrides: Partial<UserDocument> = {},
): UserDocument {
  const _id = createObjectId();
  return {
    _id,
    email: "test@example.com",
    password: "hashedPassword",
    name: "Test User",
    role: "user",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    comparePassword: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function createRecipeDoc(
  overrides: Partial<RecipeDocument> = {},
): RecipeDocument {
  const _id = createObjectId();
  return {
    _id,
    title: "Test Recipe",
    description: "A test recipe",
    ingredients: [{ name: "Flour", quantity: 200, unit: "g" }],
    instructions: ["Mix ingredients"],
    category: createObjectId(),
    author: createObjectId(),
    difficulty: "easy",
    cookingTime: 30 as Minutes,
    servings: 4,
    isPublic: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function createCommentDoc(
  overrides: Partial<CommentDocument> = {},
): CommentDocument {
  const _id = createObjectId();
  return {
    _id,
    text: "Great recipe!",
    recipe: createObjectId(),
    author: createObjectId(),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

// ── Mongoose model mock factories ──

export function createMockCategoryModel(
  overrides: Record<string, ReturnType<typeof vi.fn>> = {},
) {
  const chainable = {
    sort: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue([]),
  };

  return {
    find: vi.fn().mockReturnValue(chainable),
    create: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn().mockResolvedValue(0),
    exists: vi.fn(),
    ...overrides,
  };
}

export function createMockUserModel(
  overrides: Record<string, ReturnType<typeof vi.fn>> = {},
) {
  const queryChain = {
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(null),
  };

  return {
    findById: vi.fn().mockReturnValue(queryChain),
    findOne: vi.fn().mockReturnValue(queryChain),
    exists: vi.fn(),
    create: vi.fn(),
    ...overrides,
  };
}

export function createMockRecipeModel(
  overrides: Record<string, ReturnType<typeof vi.fn>> = {},
) {
  return {
    findById: vi.fn(),
    searchFull: vi.fn(),
    findByIdFull: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn().mockResolvedValue(0),
    exists: vi.fn(),
    ...overrides,
  };
}

export function createMockCommentModel(
  overrides: Record<string, ReturnType<typeof vi.fn>> = {},
) {
  return {
    findFull: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    ...overrides,
  };
}

export function createMockFavoriteModel(
  overrides: Record<string, ReturnType<typeof vi.fn>> = {},
) {
  return {
    findByUser: vi.fn(),
    create: vi.fn(),
    findOneAndDelete: vi.fn(),
    exists: vi.fn(),
    findOne: vi.fn(),
    ...overrides,
  };
}

// ── Service param builders ──

/**
 * Creates a new initiator.
 *
 * @param id - The initiator's ID.
 * @param role - The initiator's role.
 * @returns A new initiator.
 */
export function initiator(id?: string, role: UserRole = "user") {
  return {
    id: id ?? createObjectId().toString(),
    role,
  };
}

/**
 * Creates a new query params with initiator.
 *
 * @param page - The page number.
 * @param limit - The number of items per page.
 * @param overrides - Overrides for the query params.
 * @returns A new query params.
 */
export function queryParams(
  page = 1,
  limit = 10,
  overrides: Record<string, unknown> = {},
) {
  return {
    query: { page, limit, ...overrides },
    initiator: initiator(),
  };
}
