import type { Difficulty, Minutes } from "@recipes/shared";
import type { Types } from "mongoose";
import { model, Schema } from "mongoose";

export interface IngredientDocument {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeDocument {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IngredientDocument>(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new Schema<RecipeDocument>(
  {
    title: { type: String, required: true, trim: true, index: "text" },
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
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    toObject: { virtuals: true },
  },
);

recipeSchema.index({ title: "text", description: "text" });
recipeSchema.index({ category: 1, createdAt: -1 });

export const RecipeModel = model<RecipeDocument>("Recipe", recipeSchema);
