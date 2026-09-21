import { describe, expect, it } from "vitest";
import { searchWeb } from "../src/services/api";

describe("searchWeb", () => {
  it("does not generate fake results on API failure", async () => {
    global.fetch = async () =>
      new Response(null, {
        status: 500,
      });

    const result = await searchWeb("भारत");

    expect(result.results).toEqual([]);
    expect(result.status).toBe("error");
  });

  it("returns offline state", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    global.fetch = async () => {
      throw new Error("Network error");
    };

    const result = await searchWeb("भारत");

    expect(result.results).toEqual([]);
    expect(result.status).toBe("offline");
  });
});
