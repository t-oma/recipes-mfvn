import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserDetails,
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

export function refresh(): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    body: {},
  });
}

export function logout(): Promise<void> {
  return apiClient<void>("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function getCurrentUser(): Promise<UserDetails> {
  return apiClient<UserDetails>("/api/users/me");
}
