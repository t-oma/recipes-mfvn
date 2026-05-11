import type { CategoryWithComputed } from "@recipes/shared";

export type CategiryView = {
  _id: string | { toString(): string };
  name: string;
  slug: string;
  description?: string;
  image: {
    url: string;
    alt?: string;
  };
  recipeCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toCategory(view: CategiryView): CategoryWithComputed {
  return {
    id: view._id.toString(),
    name: view.name,
    slug: view.slug,
    description: view.description,
    image: {
      ...view.image,
      alt: view.image.alt ?? view.name,
    },
    recipeCount: view.recipeCount ?? 0,
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
