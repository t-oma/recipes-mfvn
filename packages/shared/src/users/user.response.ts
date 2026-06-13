import { z } from "zod";
import { persistenceFieldsSchema } from "../common/persistence.js";

export const userSummarySchema = z
  .object({
    email: z.string(),
    name: z.string(),
  })
  .extend(persistenceFieldsSchema.pick({ id: true }).shape);

export const userDetailsSchema = z
  .object({
    email: z.string(),
    name: z.string(),
  })
  .extend(persistenceFieldsSchema.shape);

export type UserRole = "user" | "admin";

export type UserSummary = z.infer<typeof userSummarySchema>;
export type UserDetails = z.infer<typeof userDetailsSchema>;
