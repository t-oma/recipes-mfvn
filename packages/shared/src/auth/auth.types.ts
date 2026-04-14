import type { z } from "zod";
import type {
  authResponseSchema,
  loginSchema,
  registerSchema,
} from "./auth.schema.js";

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
