import { z } from "zod";
import { userDetailsSchema } from "../users/user.response.js";

export const authResponseSchema = z.object({
  user: userDetailsSchema,
  token: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
