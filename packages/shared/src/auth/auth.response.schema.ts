import { z } from "zod";
import { userDetailsSchema } from "../users/user.response.schema.js";

export const authResponseSchema = z.object({
  user: userDetailsSchema,
  token: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
