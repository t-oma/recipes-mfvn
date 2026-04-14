import { z } from "zod";

export const userSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
