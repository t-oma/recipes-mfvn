import bcrypt from "bcryptjs";
import type { Types } from "mongoose";
import { model, Schema } from "mongoose";

export interface UserDocument {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
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
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const USER_MODEL_NAME = "User";
export const UserModel = model<UserDocument>(USER_MODEL_NAME, userSchema);
