import { z } from "zod";

export const minutesSchema = z.number().int().min(1).brand<"Minutes">();
export const secondsSchema = z.number().int().min(1).brand<"Seconds">();
export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const recipePersistenceSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Minutes = z.infer<typeof minutesSchema>;
export type Seconds = z.infer<typeof secondsSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;

export type RecipePersistence = z.infer<typeof recipePersistenceSchema>;
