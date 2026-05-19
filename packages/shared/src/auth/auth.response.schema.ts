import { z } from "zod";
import { userSchema } from "../users/user.schema.js";

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
