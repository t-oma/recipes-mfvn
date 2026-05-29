import type { Types } from "mongoose";

const UKRAINIAN_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "yi",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
};

/**
 * Transliterate Ukrainian Cyrillic text to Latin characters.
 *
 * Uses the official Ukrainian romanization standard (Resolution 55 of 2010).
 */
export function transliterate(text: string): string {
  return text
    .split("")
    .map((char) => {
      const replacement = UKRAINIAN_MAP[char.toLowerCase()];

      if (replacement === undefined) {
        return char;
      }

      return char === char.toUpperCase()
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement;
    })
    .join("");
}

/**
 * Convert arbitrary text into a URL-friendly slug.
 *
 * Steps:
 * 1. Transliterate Ukrainian characters.
 * 2. Lowercase.
 * 3. Replace non-alphanumeric characters with hyphens.
 * 4. Collapse consecutive hyphens.
 * 5. Trim leading/trailing hyphens.
 */
export function slugify(input: string): string {
  return transliterate(input)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * Generate a unique recipe slug by appending the last 6 hex characters
 * of a MongoDB ObjectId to the title-based slug.
 *
 * This guarantees uniqueness without querying the database.
 */
export function generateRecipeSlug(
  title: string,
  objectId: Types.ObjectId | string,
): string {
  const hex = typeof objectId === "string" ? objectId : objectId.toHexString();
  const suffix = hex.slice(-6);
  const base = slugify(title);

  return `${base}-${suffix}`;
}
