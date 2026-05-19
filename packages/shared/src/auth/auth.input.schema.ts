import { z } from "zod";

export const registerInputSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim().min(6),
  name: z.string().trim().min(2).max(100),
});

export const loginInputSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim(),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
