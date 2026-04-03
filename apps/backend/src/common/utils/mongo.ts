import type {
  Category,
  CategorySummary,
  Comment,
  CommentForRecipe,
  Recipe,
  RecipeSummary,
  Replace,
  User,
  UserSummary,
} from "@recipes/shared";
import type { ICategoryDocument } from "@/modules/categories/category.model.js";
import type { ICommentDocument } from "@/modules/comments/comment.model.js";
import type { IRecipeDocument } from "@/modules/recipes/recipe.model.js";
import type { IUserDocument } from "@/modules/users/user.model.js";

export function toRecipe<T extends IRecipeDocument>(
  doc: Replace<
    T,
    {
      category: Pick<ICategoryDocument, "_id" | "name" | "slug">;
      author: Pick<IUserDocument, "_id" | "name" | "email">;
    }
  >,
  isFavorited: boolean,
): Recipe {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    ingredients: doc.ingredients as Recipe["ingredients"],
    instructions: doc.instructions,
    category: {
      id: doc.category._id.toString(),
      name: doc.category.name,
      slug: doc.category.slug,
    } satisfies CategorySummary,
    author: {
      id: doc.author._id.toString(),
      email: doc.author.email,
      name: doc.author.name,
    } satisfies UserSummary,
    difficulty: doc.difficulty,
    cookingTime: doc.cookingTime,
    servings: doc.servings,
    isPublic: doc.isPublic,
    isFavorited,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toCategory(doc: ICategoryDocument): Category {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toComment<T extends ICommentDocument>(
  doc: Replace<
    T,
    {
      author: Pick<IUserDocument, "_id" | "name" | "email">;
      recipe: Pick<IRecipeDocument, "_id" | "title">;
    }
  >,
): Comment {
  return {
    id: doc._id.toString(),
    text: doc.text,
    recipe: {
      id: doc.recipe._id.toString(),
      title: doc.recipe.title,
    } satisfies RecipeSummary,
    author: {
      id: doc.author._id.toString(),
      email: doc.author.email,
      name: doc.author.name,
    } satisfies UserSummary,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toCommentForRecipe<T extends ICommentDocument>(
  doc: Replace<
    T,
    {
      author: Pick<IUserDocument, "_id" | "name" | "email">;
    }
  >,
): CommentForRecipe {
  return {
    id: doc._id.toString(),
    text: doc.text,
    author: {
      id: doc.author._id.toString(),
      email: doc.author.email,
      name: doc.author.name,
    } satisfies UserSummary,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toUser(doc: IUserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
