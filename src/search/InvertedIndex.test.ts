import { describe, expect, it } from "vitest";
import { tokenize } from "./InvertedIndex";

describe("Unicode tokenizer", () => {
  it("supports Hindi", () => {
    expect(tokenize("भारत में हिंदी खोज"))
      .toEqual([
        "भारत",
        "में",
        "हिंदी",
        "खोज",
      ]);
  });

  it("supports English", () => {
    expect(tokenize("Google Search"))
      .toEqual([
        "google",
        "search",
      ]);
  });

  it("supports numbers", () => {
    expect(tokenize("AI 2026"))
      .toEqual([
        "ai",
        "2026",
      ]);
  });

  it("handles empty input", () => {
    expect(tokenize("")).toEqual([]);
  });
});
