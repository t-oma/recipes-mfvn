import type { Types } from "mongoose";
import { model, Schema } from "mongoose";

export interface CategoryDocument {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  },
);

categorySchema.pre("validate", async function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }
});

export const CategoryModel = model<CategoryDocument>(
  "Category",
  categorySchema,
);
