import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocumentWithoutUpdate } from "@/common/types/mongoose.js";
import { RECIPE_MODEL_NAME } from "@/modules/recipes/recipe.model.js";
import { USER_MODEL_NAME } from "@/modules/users/user.model.js";

export interface RecipeRatingDocument extends BaseDocumentWithoutUpdate {
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  value: number;
}

export interface RecipeRatingModelType extends Model<RecipeRatingDocument> {}

const recipeRatingSchema = new Schema<
  RecipeRatingDocument,
  RecipeRatingModelType
>(
  {
    user: { type: Schema.Types.ObjectId, ref: USER_MODEL_NAME, required: true },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: RECIPE_MODEL_NAME,
      required: true,
    },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  {
    collection: "recipeRatings",
    timestamps: { createdAt: true, updatedAt: false },
  },
);

recipeRatingSchema.index({ user: 1, recipe: 1 }, { unique: true });

export const RECIPE_RATING_MODEL_NAME = "RecipeRating";
export const RecipeRatingModel = model<
  RecipeRatingDocument,
  RecipeRatingModelType
>(RECIPE_RATING_MODEL_NAME, recipeRatingSchema);
