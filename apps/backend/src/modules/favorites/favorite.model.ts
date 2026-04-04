import type { Types } from "mongoose";
import { model, Schema } from "mongoose";

export interface FavoriteDocument {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  recipe: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toObject: { virtuals: true },
  },
);

favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });
favoriteSchema.index({ user: 1, createdAt: -1 });

export const FavoriteModel = model<FavoriteDocument>(
  "Favorite",
  favoriteSchema,
);
