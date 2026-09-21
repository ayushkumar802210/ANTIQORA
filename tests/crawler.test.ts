import { describe, expect, it } from "vitest";
import { fetchAndParse } from "../src/services/crawler/CrawlerService";

describe("CrawlerService", () => {
  it("does not index a noindex page", async () => {
    global.fetch = async () =>
      new Response(`
        <html>
          <head>
            <meta name="robots" content="noindex">
          </head>
          <body>
            Secret page
          </body>
        </html>
      `, {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      });

    const result = await fetchAndParse(
      "https://example.com/private"
    );

    expect(result.isNoIndex).toBe(true);
    expect(result.indexed).toBe(false);
  });
});
