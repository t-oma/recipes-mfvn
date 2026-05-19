import type { CategoryDetails, CategorySummary, Image } from "@recipes/shared";

export type CategorySummaryView = {
  _id: string | { toString(): string };
  name: string;
  slug: string;
  image: Image;
};

export type CategiryDetailsView = CategorySummaryView & {
  description?: string;
  recipeCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toCategorySummary(view: CategorySummaryView): CategorySummary {
  return {
    id: view._id.toString(),
    name: view.name,
    slug: view.slug,
    image: {
      ...view.image,
      alt: view.image.alt ?? view.name,
    },
  };
}

export function toCategoryDetails(view: CategiryDetailsView): CategoryDetails {
  return {
    ...toCategorySummary(view),
    description: view.description,
    recipeCount: view.recipeCount ?? 0,
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
