import { z } from "zod";

export const passwordInputSchema = z
  .string()
  .trim()
  .min(6, { message: "Password must be at least 6 characters" });

export const registerInputSchema = z.object({
  email: z.email().trim(),
  password: passwordInputSchema,
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
});

export const loginInputSchema = z.object({
  email: z.email().trim(),
  password: passwordInputSchema,
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
