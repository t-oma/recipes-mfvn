import type {
  CategoryDetails,
  CategoryListItem,
  CategorySummary,
  Image,
} from "@recipes/shared";

export type CategorySummaryView = {
  _id: string | { toString(): string };
  name: string;
  slug: string;
  image: Image;
};

export type CategoryListItemView = CategorySummaryView & {
  recipeCount?: number;
};

export type CategiryDetailsView = CategoryListItemView & {
  description?: string;
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

export function toCategoryListItem(
  view: CategoryListItemView,
): CategoryListItem {
  return {
    ...toCategorySummary(view),
    recipeCount: view.recipeCount ?? 0,
  };
}

export function toCategoryDetails(view: CategiryDetailsView): CategoryDetails {
  return {
    ...toCategoryListItem(view),
    description: view.description,
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
