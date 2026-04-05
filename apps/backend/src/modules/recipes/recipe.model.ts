import type { Difficulty, Minutes, Replace } from "@recipes/shared";
import type { Model, QueryFilter } from "mongoose";
import { model, Schema, Types } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import type { CategoryDocument } from "@/modules/categories/index.js";
import { CATEGORY_MODEL_NAME } from "@/modules/categories/index.js";
import type { UserDocument } from "@/modules/users/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";

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

export interface RecipeModelType extends Model<RecipeDocument> {
  findByIdFull(
    id: string,
    userId?: string,
  ): Promise<
    | (Replace<
        RecipeDocument,
        {
          category: Pick<CategoryDocument, "_id" | "name" | "slug">;
          author: Pick<UserDocument, "_id" | "name" | "email">;
        }
      > & {
        isFavorited: boolean;
      })
    | null
  >;
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

recipeSchema.statics.findByIdFull = async function (
  id: string,
  userId?: string,
) {
  const recipeOid = Types.ObjectId.createFromHexString(id);

  const filter: QueryFilter<RecipeDocument> = {
    _id: recipeOid,
  };
  if (userId) {
    filter.$or = [
      { isPublic: true },
      { author: Types.ObjectId.createFromHexString(userId) },
    ];
  } else {
    filter.isPublic = true;
  }

  const recipe = await this.aggregate<
    Replace<
      RecipeDocument,
      {
        category: Pick<CategoryDocument, "_id" | "name" | "slug">;
        author: Pick<UserDocument, "_id" | "name" | "email">;
      }
    > & {
      isFavorited: boolean;
    }
  >([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
            },
          },
        ],
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
            },
          },
        ],
        as: "author",
      },
    },
    { $unwind: "$author" },
    { $unset: "__v" },
  ]).append(...favoritedPipeline(this, userId));

  if (!recipe.length) {
    return null;
  }

  console.log(recipe);

  return recipe[0];
};

function favoritedPipeline(model: RecipeModelType, userId?: string) {
  if (!userId) {
    return model
      .aggregate([
        {
          $addFields: {
            isFavorited: false,
          },
        },
      ])
      .pipeline();
  }
  const userOid = Types.ObjectId.createFromHexString(userId);

  return model
    .aggregate([
      {
        $lookup: {
          from: "favorites",
          localField: "_id",
          foreignField: "recipe",
          pipeline: [
            {
              $match: {
                user: userOid,
              },
            },
            {
              $project: {
                user: 1,
              },
            },
          ],
          as: "favoritedBy",
        },
      },
      { $unwind: { path: "$favoritedBy", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isFavorited: {
            $eq: ["$favoritedBy.user", userOid],
          },
        },
      },
      { $unset: "favoritedBy" },
    ])
    .pipeline();
}

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const RECIPE_MODEL_NAME = "Recipe";
export const RecipeModel = model<RecipeDocument, RecipeModelType>(
  RECIPE_MODEL_NAME,
  recipeSchema,
);
