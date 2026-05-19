import { z } from "zod";

export const persistenceFieldsSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PersistenceFields = z.infer<typeof persistenceFieldsSchema>;
