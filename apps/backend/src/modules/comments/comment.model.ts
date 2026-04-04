import type { Types } from "mongoose";
import { model, Schema } from "mongoose";

export interface CommentDocument {
  _id: Types.ObjectId;
  text: string;
  recipe: Types.ObjectId;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  },
);

commentSchema.index({ recipe: 1, createdAt: -1 });

export const CommentModel = model<CommentDocument>("Comment", commentSchema);
