import { describe, expect, it } from "vitest";
import { 
  sanitizeSearchText, 
  decodeHtmlEntities, 
  stripHtmlTags, 
  removeTechnicalArtifacts, 
  cleanDomain, 
  cleanTitle, 
  cleanSnippet, 
  normalizeSearchResult 
} from "../src/services/textSanitizer";

describe("Text Sanitizer & Content Normalization", () => {
  it("decodes HTML entities correctly", () => {
    expect(decodeHtmlEntities("&quot;WhatsApp Help Center&#039;s language&quot;"))
      .toBe('"WhatsApp Help Center\'s language"');

    expect(decodeHtmlEntities("Google Search&amp;nbsp;&lt;b&gt;Engine&lt;/b&gt; &#8211; 2026"))
      .toBe("Google Search <b>Engine</b> – 2026");

    expect(decodeHtmlEntities("whatsapp&#039;s &amp; instagram&#039;s"))
      .toBe("whatsapp's & instagram's");
  });

  it("strips HTML tags and attributes", () => {
    expect(stripHtmlTags("<b>WhatsApp</b> <span>Messenger</span> <a href='#'>App</a>").trim())
      .toBe("WhatsApp   Messenger   App");
  });

  it("removes technical artifacts and crawl metadata", () => {
    expect(removeTechnicalArtifacts("WhatsApp Messenger APKs. Retrieved April 14, 2024. Archived from the original.").trim())
      .toBe("WhatsApp Messenger APKs.");

    expect(removeTechnicalArtifacts("Google Search [1][2] Indexed Web Results"))
      .toBe("Google Search Web Results");
  });

  it("sanitizes search text completely", () => {
    expect(sanitizeSearchText("&quot;WhatsApp Help Center&#039;s language&quot;"))
      .toBe('"WhatsApp Help Center\'s language"');

    expect(sanitizeSearchText("WhatsApp 2021. &quot;WhatsApp Messenger APKs&quot;. APKMirror. Retrieved April 14, 2024."))
      .toBe('WhatsApp 2021. "WhatsApp Messenger APKs". APKMirror.');
  });

  it("cleans domain names cleanly", () => {
    expect(cleanDomain("https://www.whatsapp.com/download/"))
      .toBe("whatsapp.com");

    expect(cleanDomain("https://hi.wikipedia.org/wiki/%E0%A4%AE%E0%A4%BF%E0%A4%B8%E0%A4%BE%E0%A4%8 me"))
      .toBe("hi.wikipedia.org");
  });

  it("cleans titles cleanly", () => {
    expect(cleanTitle("&quot;WhatsApp Messenger APKs&quot; - whatsapp.com", "whatsapp.com"))
      .toBe("WhatsApp Messenger APKs");
  });

  it("cleans snippets into natural sentences", () => {
    expect(cleanSnippet("WhatsApp - WhatsApp is a free messaging app. Retrieved May 2024.", "WhatsApp"))
      .toBe("WhatsApp is a free messaging app.");
  });

  it("normalizes a full search result object safely", () => {
    const rawItem = {
      id: "raw_1",
      title: "&quot;WhatsApp Messenger APKs&quot;.",
      url: "https://www.whatsapp.com/android",
      domain: "www.whatsapp.com",
      snippet: "whatsapp&#039;s official app. Retrieved April 14, 2024. [1]",
      date: "Retrieved April 14, 2024",
      verified: true
    };

    const normalized = normalizeSearchResult(rawItem);

    expect(normalized.title).toBe("WhatsApp Messenger APKs");
    expect(normalized.domain).toBe("whatsapp.com");
    expect(normalized.snippet).toBe("whatsapp's official app.");
    expect(normalized.date).toBe(""); // technical date stripped
    expect(normalized.verified).toBe(true);
    expect(normalized.title).not.toContain("&quot;");
    expect(normalized.snippet).not.toContain("&#039;");
    expect(normalized.snippet).not.toContain("Retrieved");
  });

  it("supports Hindi queries and Devanagari text without corruption", () => {
    const hindiInput = "भारत में &quot;हिंदी&quot; खोज engine &#8211; 2026";
    expect(sanitizeSearchText(hindiInput)).toBe("भारत में \"हिंदी\" खोज engine – 2026");
  });
});
