import type {
  CuisineDetails,
  CuisineListItem,
  CuisineSummary,
  Image,
} from "@recipes/shared";

export type CuisineSummaryView = {
  _id: string | { toString(): string };
  name: string;
  slug: string;
  image: Image;
};

export type CuisineListItemView = CuisineSummaryView & {
  recipeCount?: number;
};

export type CuisineDetailsView = CuisineListItemView & {
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toCuisineSummary(view: CuisineSummaryView): CuisineSummary {
  return {
    id: view._id.toString(),
    name: view.name,
    slug: view.slug,
    image: {
      ...view.image,
      alt: view.image.alt ?? `${view.name} cuisine`,
    },
  };
}

export function toCuisineListItem(view: CuisineListItemView): CuisineListItem {
  return {
    ...toCuisineSummary(view),
    recipeCount: view.recipeCount ?? 0,
  };
}

export function toCuisineDetails(view: CuisineDetailsView): CuisineDetails {
  return {
    ...toCuisineListItem(view),
    description: view.description,
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
