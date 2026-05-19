import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "@recipes/shared";
import { apiClient } from "@/shared/api/client";

export function register(body: RegisterInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/auth/register", {
    method: "POST",
    body,
  });
}

export function login(body: LoginInput): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    body,
  });
}

export function getCurrentUser(): Promise<User> {
  return apiClient<User>("/api/users/me");
}
