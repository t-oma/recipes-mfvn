import type { CommentDetails } from "@recipes/shared";
import type { RecipeSummaryView } from "@/modules/recipes/recipe.mapper.js";
import { toRecipeSummary } from "@/modules/recipes/recipe.mapper.js";
import type { UserSummaryView } from "@/modules/users/user.mapper.js";
import { toUserSummary } from "@/modules/users/user.mapper.js";

export type CommentDetailsView = {
  _id: string | { toString(): string };
  text: string;
  recipe: RecipeSummaryView;
  author: UserSummaryView;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toCommentDetails(view: CommentDetailsView): CommentDetails {
  return {
    id: view._id.toString(),
    text: view.text,
    recipe: toRecipeSummary(view.recipe),
    author: toUserSummary(view.author),
    createdAt: new Date(view.createdAt).toISOString(),
    updatedAt: new Date(view.updatedAt).toISOString(),
  };
}
