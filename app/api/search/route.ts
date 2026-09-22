/**
 * Search Orchestrator API Route (/app/api/search/route.ts)
 * Implements intent classification via Gemini, parallel provider fetching via Promise.allSettled
 * across Google Custom Search/Web, YouTube/Videos, News, Images, and Apps,
 * complete with server-side pagination handling and token management.
 */

import { GoogleGenAI } from "@google/genai";
import { orchestrateSearch } from "../../../lib/search/orchestrator";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
});

export interface SearchRequestParams {
  query: string;
  type?: string;
  page?: number;
  pageSize?: number;
  pageToken?: string;
}

export async function handleSearchRequest(params: SearchRequestParams) {
  const { query, type = "all", page = 1, pageSize = 20, pageToken } = params;
  const rawQuery = (query || "").trim();

  if (!rawQuery) {
    return {
      query: "",
      type,
      page: 1,
      pageSize,
      intent: "GENERAL",
      aiOverview: "",
      results: [],
      hasMore: false,
      nextPageToken: undefined,
      errors: []
    };
  }

  let intent = "GENERAL_QUESTION";
  let aiOverview = "";
  const errors: string[] = [];

  // 1. Intent Classification & AI Overview via Gemini (Page 1 only)
  if (page === 1 && process.env.GEMINI_API_KEY) {
    try {
      const aiRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze search query: "${rawQuery}". Return JSON with:
        {
          "intent": "PERSON" | "COMPANY" | "PRODUCT" | "VIDEO" | "NEWS" | "IMAGE" | "GENERAL_QUESTION",
          "aiOverview": "A concise 2-3 sentence factual overview summarizing the query topic."
        }`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      if (aiRes.text) {
        const parsed = JSON.parse(aiRes.text);
        intent = parsed.intent || "GENERAL_QUESTION";
        aiOverview = parsed.aiOverview || "";
      }
    } catch (err: any) {
      errors.push(`Gemini analysis notice: ${err.message}`);
    }
  }

  // 2. Delegate to orchestrateSearch
  const orchestrated = await orchestrateSearch({
    query: rawQuery,
    type,
    page,
    pageSize,
    pageToken
  });

  return {
    ...orchestrated,
    intent,
    aiOverview,
    errors: [...errors, ...orchestrated.errors.map(e => `${e.provider}: ${e.message}`)]
  };
}

// Next.js / Web Standard Route Handler Handler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const type = searchParams.get('type') || searchParams.get('tab') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '20', 10);
    const pageToken = searchParams.get('pageToken') || undefined;

    const data = await handleSearchRequest({
      query,
      type,
      page: isNaN(page) ? 1 : page,
      pageSize: isNaN(pageSize) ? 20 : pageSize,
      pageToken
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error("Route GET handler error:", err);
    return new Response(JSON.stringify({
      error: "Search orchestrator failed",
      message: err.message,
      results: [],
      hasMore: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
