import { z } from "zod";

export const minutesSchema = z.number().int().min(1).brand<"Minutes">();
export const secondsSchema = z.number().int().min(1).brand<"Seconds">();
export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "beverage",
] as const;
export const mealTypeSchema = z.enum(MEAL_TYPES);

export type Minutes = z.infer<typeof minutesSchema>;
export type Seconds = z.infer<typeof secondsSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type MealType = z.infer<typeof mealTypeSchema>;
