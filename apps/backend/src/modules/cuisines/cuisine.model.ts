import type { Image } from "@recipes/shared";
import type { Model } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";

export interface CuisineDocument extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  image: Image;
}

export type CuisineModelType = Model<CuisineDocument>;

const imageSchema = new Schema<Image>(
  {
    url: { type: String, required: true },
    alt: { type: String, trim: true },
  },
  { _id: false },
);

const cuisineSchema = new Schema<CuisineDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image: { type: imageSchema, required: true },
  },
  {
    timestamps: true,
  },
);

cuisineSchema.pre("validate", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }
});

export const CuisineModel = model<CuisineDocument, CuisineModelType>(
  "Cuisine",
  cuisineSchema,
);

export const cuisinesCollectionName = CuisineModel.collection.name;
