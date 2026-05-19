import { z } from "zod";

export const minutesSchema = z.number().int().min(1).brand<"Minutes">();
export const secondsSchema = z.number().int().min(1).brand<"Seconds">();
export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export type Minutes = z.infer<typeof minutesSchema>;
export type Seconds = z.infer<typeof secondsSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
