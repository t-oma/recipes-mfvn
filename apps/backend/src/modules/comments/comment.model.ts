import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface ICommentDocument extends Document {
  text: string;
  recipe: Types.ObjectId;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>(
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
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const { _id, ...rest } = ret;
        return rest;
      },
    },
    toObject: { virtuals: true },
  },
);

commentSchema.index({ recipe: 1, createdAt: -1 });

export const CommentModel = mongoose.model<ICommentDocument>(
  "Comment",
  commentSchema,
);
