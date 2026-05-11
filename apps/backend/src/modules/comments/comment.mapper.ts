import type { Comment } from "@recipes/shared";

export type CommentView = {
  _id: string | { toString(): string };
  text: string;
  recipe: {
    _id: string | { toString(): string };
    title: string;
  };
  author: {
    _id: string | { toString(): string };
    email: string;
    name: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toComment(view: CommentView): Comment {
  return {
    id: view._id.toString(),
    text: view.text,
    recipe: {
      id: view.recipe._id.toString(),
      title: view.recipe.title,
    },
    author: {
      id: view.author._id.toString(),
      email: view.author.email,
      name: view.author.name,
    },
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
