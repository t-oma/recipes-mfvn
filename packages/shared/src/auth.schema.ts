import { z } from "zod";
import { userSchema } from "./user.schema.js";

export const registerSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim().min(6),
  name: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
