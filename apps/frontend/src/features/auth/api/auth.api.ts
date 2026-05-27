import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserDetails,
} from "@recipes/shared";
import { http } from "@/shared/api/http";

export function register(body: RegisterInput) {
  return http.post<AuthResponse>("/api/auth/register", {
    body,
  });
}

export function login(body: LoginInput) {
  return http.post<AuthResponse>("/api/auth/login", {
    body,
  });
}

export function refresh() {
  return http.post<AuthResponse>("/api/auth/refresh", {
    body: {},
    credentials: "include",
    withAuth: false,
    skipAuthRefresh: true,
  });
}

export function logout() {
  return http.post<void>("/api/auth/logout", {
    body: {},
    credentials: "include",
  });
}

export function getCurrentUser() {
  return http.get<UserDetails>("/api/users/me");
}
