import { bench, describe } from "vitest";
import { slugify, transliterate } from "./slug.js";

describe("slugify functions performance", () => {
  bench("slugify", () => {
    slugify("Борщ з квашеною капустою".repeat(100));
  });
});

describe("transliterate functions performance", () => {
  bench("transliterate", () => {
    transliterate("Борщ з квашеною капустою".repeat(100));
  });
});
