import type { UserRole } from "@recipes/shared";
import type { Model } from "mongoose";
import { model, Schema } from "mongoose";
import type { BaseDocument } from "@/common/types/mongoose.js";

export interface UserDocument extends BaseDocument {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UserModelType extends Model<UserDocument> {}

const userSchema = new Schema<UserDocument, UserModelType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

export const USER_MODEL_NAME = "User";
export const UserModel = model<UserDocument, UserModelType>(
  USER_MODEL_NAME,
  userSchema,
);

export const usersCollectionName = UserModel.collection.name;
