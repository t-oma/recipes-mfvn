import type { Model, Types } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";
import { RECIPE_MODEL_NAME } from "@/modules/recipes/index.js";
import { USER_MODEL_NAME } from "@/modules/users/index.js";

export interface CommentDocument extends BaseDocument {
  text: string;
  recipe: Types.ObjectId;
  author: Types.ObjectId;
}

export interface CommentModelType extends Model<CommentDocument> {}

const commentSchema = new Schema<CommentDocument, CommentModelType>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: RECIPE_MODEL_NAME,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ recipe: 1, createdAt: -1 });

export const COMMENT_MODEL_NAME = "Comment";
export const CommentModel = model<CommentDocument, CommentModelType>(
  COMMENT_MODEL_NAME,
  commentSchema,
);
