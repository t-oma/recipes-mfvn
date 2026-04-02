import type { AuthResponse, LoginBody, RegisterBody } from "@recipes/shared";
import type { Model } from "mongoose";
import { AppError } from "@/common/errors.js";
import { signToken } from "@/common/utils/jwt.js";
import { toUser } from "@/common/utils/mongo.js";
import type { IUserDocument } from "@/modules/users/user.model.js";

export interface AuthService {
  register(data: RegisterBody): Promise<AuthResponse>;
  login(data: LoginBody): Promise<AuthResponse>;
}

export function createAuthService(
  userModel: Model<IUserDocument>,
): AuthService {
  return {
    register: async (data) => {
      const exists = await userModel.findOne({ email: data.email });
      if (exists) {
        throw new AppError("Email already in use", 409);
      }

      const user = await userModel.create(data);
      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: toUser(user.toObject()),
        token,
      };
    },
    login: async (data) => {
      const user = await userModel
        .findOne({ email: data.email })
        .select("+password");
      if (!user || !(await user.comparePassword(data.password))) {
        throw new AppError("Invalid email or password", 401);
      }

      const token = signToken({ userId: user.id, email: user.email });

      return {
        user: toUser(user.toObject()),
        token,
      };
    },
  };
}
