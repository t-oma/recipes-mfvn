import type { Difficulty, Minutes, Replace } from "@recipes/shared";
import type { Model, QueryFilter } from "mongoose";
import { model, Schema, Types } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import type { CategoryDocument } from "@/modules/categories/index.js";
import { CATEGORY_MODEL_NAME } from "@/modules/categories/index.js";
import type { SearchRecipeQuery } from "@/modules/recipes/index.js";
import type { UserDocument } from "@/modules/users/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";
import {
  byFavorited,
  withAuthor,
  withCategories,
  withFavorited,
  withPagination,
  withSort,
} from "./recipe.aggregation.js";
import {
  applyVisibilityFilter,
  buildRecipeFilter,
} from "./recipe-filter.builder.js";

export interface IngredientDocument {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeDocument extends BaseDocument {
  title: string;
  description: string;
  ingredients: IngredientDocument[];
  instructions: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  difficulty: Difficulty;
  cookingTime: Minutes;
  servings: number;
  isPublic: boolean;
}

export interface RecipeDocumentPopulated
  extends Replace<
    RecipeDocument,
    {
      category: Pick<CategoryDocument, "_id" | "name" | "slug">;
      author: Pick<UserDocument, "_id" | "name" | "email">;
    }
  > {
  isFavorited: boolean;
}

export interface RecipeModelType extends Model<RecipeDocument> {
  searchFull(
    query: SearchRecipeQuery,
    userId?: string,
  ): Promise<[RecipeDocumentPopulated[], number] | [null, 0]>;
  findByIdFull(
    id: string,
    userId?: string,
  ): Promise<RecipeDocumentPopulated | null>;
}

const ingredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new Schema<RecipeDocument, RecipeModelType>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ingredients: {
      type: [ingredientSchema],
      required: true,
      validate: {
        validator: (v: IngredientDocument[]) => v.length > 0,
        message: "At least one ingredient required",
      },
    },
    instructions: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one instruction required",
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: CATEGORY_MODEL_NAME,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    cookingTime: { type: Number, required: true, min: 1 },
    servings: { type: Number, required: true, min: 1 },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

recipeSchema.statics.searchFull = async function (
  query: SearchRecipeQuery,
  userId?: string,
) {
  const { page, limit, sort, isFavorited } = query;
  const filter = buildRecipeFilter(query, userId);

  const results = await this.aggregate<{
    recipes: RecipeDocumentPopulated[];
    total: number;
  }>([
    {
      $match: filter,
    },
    { $unset: "__v" },
    ...withFavorited(userId),
    ...byFavorited(isFavorited),
    {
      $facet: {
        recipes: [
          ...withSort(sort),
          ...withPagination(page, limit),
          ...withCategories(),
          ...withAuthor(),
        ],
        total: [{ $count: "count" }],
      },
    },
    { $unwind: "$total" },
    { $set: { total: "$total.count" } },
  ]);

  if (!results.length || !results[0]?.recipes.length) {
    return [[], results[0]?.total ?? 0];
  }

  return [results[0].recipes, results[0].total];
};

recipeSchema.statics.findByIdFull = async function (
  id: string,
  userId?: string,
) {
  const recipeOid = Types.ObjectId.createFromHexString(id);

  const filter: QueryFilter<RecipeDocument> = {
    _id: recipeOid,
  };
  applyVisibilityFilter(filter, userId);

  const recipes = await this.aggregate<RecipeDocumentPopulated>([
    {
      $match: filter,
    },
    { $unset: "__v" },
    ...withCategories(),
    ...withAuthor(),
    ...withFavorited(userId),
  ]);

  if (!recipes.length) {
    return null;
  }

  return recipes[0];
};

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const RECIPE_MODEL_NAME = "Recipe";
export const RecipeModel = model<RecipeDocument, RecipeModelType>(
  RECIPE_MODEL_NAME,
  recipeSchema,
);
