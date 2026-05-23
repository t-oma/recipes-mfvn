import type { AuthResponse, LoginInput, RegisterInput } from "@recipes/shared";
import { ConflictError, UnauthorizedError } from "@/common/errors.js";
import type { Logger } from "@/common/logger.js";
import type { PasswordService } from "@/common/passwords/password.service.js";
import { signToken } from "@/common/utils/jwt.js";
import { toUserDetails } from "@/modules/users/user.mapper.js";
import type { UserRepository } from "@/modules/users/user.repository.js";

export interface AuthService {
  register(data: RegisterInput): Promise<AuthResponse>;
  login(data: LoginInput): Promise<AuthResponse>;
}

type UserRepositoryPort = Pick<UserRepository, "findOne" | "exists" | "create">;
type LoggerPort = Pick<Logger, "error" | "warn" | "info">;

export function createAuthService(
  userRepository: UserRepositoryPort,
  passwordService: PasswordService,
  log: LoggerPort,
): AuthService {
  return {
    register: async (data) => {
      const exists = await userRepository.exists({ email: data.email });
      if (exists) {
        log.warn(
          { email: data.email },
          "Registration attempt with existing email",
        );
        throw new ConflictError("Email already in use");
      }

      const password = await passwordService.hash(data.password);
      const user = await userRepository.create({
        ...data,
        password,
      });
      const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        user: toUserDetails(user),
        token,
      };
    },
    login: async (data) => {
      const user = await userRepository.findOne(
        { email: data.email },
        { select: "+password" },
      );
      if (
        !user ||
        !(await passwordService.verify(data.password, user.password))
      ) {
        log.warn({ email: data.email }, "Failed login attempt");
        throw new UnauthorizedError("Invalid email or password");
      }

      const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        user: toUserDetails(user),
        token,
      };
    },
  };
}
