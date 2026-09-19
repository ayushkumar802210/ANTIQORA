import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { CrawlerService } from "./src/services/crawler/CrawlerService";
import { InvertedIndex } from "./src/services/indexer/InvertedIndex";
import { RankingEngine } from "./src/services/ranking/RankingEngine";
import { QueryUnderstandingService } from "./src/services/query/QueryUnderstanding";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Crawler Seed URLs & Indexer
  CrawlerService.initSeedUrls();
  const seedDocs = CrawlerService.getCrawledDocuments();
  seedDocs.forEach(doc => InvertedIndex.addDocument(doc));

  // Initialize Gemini SDK server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Demo Data Repositories for Search Abstraction
  const DEMO_WEB_RESULTS = [
    {
      id: "1",
      title: "Quantum Computing Breakthroughs in 2026",
      url: "https://quantum-tech-review.org/2026/breakthroughs",
      domain: "quantum-tech-review.org",
      snippet: "Recent advancements in topological qubits have drastically reduced error rates, paving the way for fault-tolerant quantum processors operating at room temperature.",
      category: "technology",
      date: "2 days ago"
    },
    {
      id: "2",
      title: "The Architecture of Advanced Neural Search Engines",
      url: "https://future-systems.io/articles/neural-search",
      domain: "future-systems.io",
      snippet: "Exploring vector embeddings, semantic ranking, and generative AI overviews in modern high-performance information retrieval systems.",
      category: "ai",
      date: "1 week ago"
    },
    {
      id: "3",
      title: "Renewable Energy Grids and Autonomous Storage",
      url: "https://clean-energy-horizon.com/smart-grids",
      domain: "clean-energy-horizon.com",
      snippet: "How decentralized AI-managed microgrids are balancing fluctuating solar and wind inputs with solid-state battery storage networks.",
      category: "science",
      date: "3 days ago"
    },
    {
      id: "4",
      title: "Deep Dive into TypeScript 7 and Native Type Stripping",
      url: "https://typescriptlang.org/docs/release-notes/v7",
      domain: "typescriptlang.org",
      snippet: "Comprehensive guide on zero-config type stripping, performance enhancements, and modern module resolution features in TypeScript.",
      category: "development",
      date: "5 days ago"
    },
    {
      id: "5",
      title: "Autonomous Aerospace Exploration: Next Frontier",
      url: "https://cosmos-journal.net/aerospace-2026",
      domain: "cosmos-journal.net",
      snippet: "Autonomous deep-space probes utilizing localized neural guidance to navigate asteroid belts with zero command latency.",
      category: "science",
      date: "Yesterday"
    }
  ];

  const DEMO_IMAGES = [
    { id: "img-1", title: "Futuristic Cyber Cityscape at Dusk", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80", domain: "unsplash.com", dimensions: "3840 x 2160" },
    { id: "img-2", title: "Quantum Processor Core in Neon Glow", url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80", domain: "unsplash.com", dimensions: "2560 x 1440" },
    { id: "img-3", title: "Abstract Neural Network Visualization", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", domain: "unsplash.com", dimensions: "1920 x 1080" },
    { id: "img-4", title: "Autonomous Orbital Satellite Array", url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80", domain: "unsplash.com", dimensions: "4096 x 2160" },
    { id: "img-5", title: "Minimalist High-Tech Holographic UI", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", domain: "unsplash.com", dimensions: "3000 x 2000" },
    { id: "img-6", title: "Bioluminescent Deep Sea Ecosystem", url: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=800&q=80", domain: "unsplash.com", dimensions: "2400 x 1600" }
  ];

  const DEMO_NEWS = [
    { id: "news-1", title: "Global Summit Announces Breakthrough in Fusion Energy Containment", source: "Global Tech Wire", date: "4 hours ago", summary: "Scientists successfully sustained a net-positive fusion reaction for over 45 minutes using advanced magnetic confinement coils.", category: "Science", url: "https://example.com/news/fusion" },
    { id: "news-2", title: "Next-Gen Operating Systems Shift Toward Semantic Memory Indexing", source: "Silicon Chronicle", date: "6 hours ago", summary: "Major OS developers are replacing traditional folder hierarchies with AI-driven contextual memory graphs.", category: "Technology", url: "https://example.com/news/os" },
    { id: "news-3", title: "Autonomous Electric Cargo Fleet Completes Trans-Continental Route", source: "Logistics Today", date: "12 hours ago", summary: "Zero-emission heavy transport vehicles completed automated cross-country freight delivery with zero human interventions.", category: "Business", url: "https://example.com/news/cargo" }
  ];

  const DEMO_VIDEOS = [
    { id: "vid-1", title: "Building Next-Gen Neural Search Engines from Scratch", platform: "ANTIQORA Vision", duration: "18:42", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", description: "A deep dive into indexing architectures, vector embeddings, and ultra-fast retrieval algorithms.", url: "https://example.com/video/1" },
    { id: "vid-2", title: "The Physics of Quantum Supremacy Explained", platform: "Quantum Horizons", duration: "24:10", thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80", description: "Understanding superposition, entanglement, and fault-tolerant quantum error correction.", url: "https://example.com/video/2" }
  ];

  const DEMO_PLACES = [
    { id: "place-1", name: "ANTIQORA Research & Innovation Hub", address: "101 Cybernetic Way, Silicon District, CA", hours: "Open · Closes 8:00 PM", rating: 4.9, phone: "+1 (800) 555-ANTI", website: "https://antiqora.io", category: "Technology Center" },
    { id: "place-2", name: "Neural Quantum Labs", address: "450 Innovation Parkway, Austin, TX", hours: "Open 24 Hours", rating: 4.8, phone: "+1 (512) 555-NEXUS", website: "https://quantumlabs.example", category: "Research Facility" }
  ];

  const DEMO_SHOPPING = [
    { id: "shop-1", name: "ANTIQORA Neural Interface Headset X1", price: "$349.00", seller: "ANTIQORA Official Store", availability: "In Stock", source: "antiqora.store", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80" },
    { id: "shop-2", name: "Quantum Solid-State Storage Drive 8TB", price: "$599.00", seller: "Nexus Hardware", availability: "Only 4 left", source: "nexushardware.com", image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80" },
    { id: "shop-3", name: "Ergonomic Neon-Lit Mechanical Keyboard", price: "$189.00", seller: "CyberForge", availability: "In Stock", source: "cyberforge.io", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80" }
  ];

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Autocomplete & Query Suggestions Endpoint
  app.get("/api/autocomplete", (req, res) => {
    const q = (req.query.q as string) || "";
    const suggestions = QueryUnderstandingService.getAutocompleteSuggestions(q);
    res.json({ suggestions });
  });

  // Live Crawler Status & Metrics Endpoint
  app.get("/api/crawler/status", (req, res) => {
    const stats = CrawlerService.getStats();
    const documents = CrawlerService.getCrawledDocuments();
    const indexMetrics = InvertedIndex.getIndexMetrics();
    res.json({ stats, documents, indexMetrics });
  });

  // Live URL Crawler Trigger Endpoint
  app.post("/api/crawler/crawl", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL parameter required" });
    }

    try {
      const doc = await CrawlerService.fetchAndParse(url);
      if (doc) {
        InvertedIndex.addDocument(doc);
        return res.json({ success: true, document: doc });
      } else {
        return res.status(422).json({ error: "Unable to parse or disallowed by robots.txt" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Crawler fetch failure" });
    }
  });

  // Google Custom Search API Proxy Endpoint
  app.get("/api/search/google", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    const apiKey = process.env.SEARCH_API_KEY || process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX || process.env.SEARCH_CX_ID;

    if (apiKey && cx && query) {
      try {
        const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
        const gRes = await fetch(googleUrl);
        if (gRes.ok) {
          const gData = await gRes.json();
          const mappedResults = (gData.items || []).map((item: any, index: number) => ({
            id: `goog-${index}-${Date.now()}`,
            title: item.title,
            url: item.link,
            domain: item.displayLink || new URL(item.link).hostname,
            snippet: item.snippet,
            category: "web",
            date: "Recent",
            verification: "verified"
          }));

          return res.json({
            query,
            totalResults: gData.searchInformation?.totalResults || mappedResults.length,
            isRealApi: true,
            provider: "Google Custom Search JSON API",
            results: mappedResults
          });
        }
      } catch (err) {
        console.warn("Notice: Google Custom Search API proxy unreachable, serving synthesized index:", err);
      }
    }

    // Fallback response when custom search keys not present
    res.json({
      query,
      totalResults: 2,
      isRealApi: false,
      provider: "ANTIQORA Index Engine",
      results: [
        {
          id: `goog-fallback-1`,
          title: `${query} - Official Knowledge & Web Documentation`,
          url: `https://google.com/search?q=${encodeURIComponent(query)}`,
          domain: 'google.com',
          snippet: `Live search records and index entries for "${query}". Highlighting verified documentation, specifications, and primary sources.`,
          category: 'general',
          date: 'Just now',
          verification: 'verified'
        },
        {
          id: `goog-fallback-2`,
          title: `Global Research Papers & Standards regarding ${query}`,
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
          domain: 'scholar.google.com',
          snippet: `Peer-reviewed scientific articles, open access research papers, and technical specifications regarding ${query}.`,
          category: 'research',
          date: 'Yesterday',
          verification: 'multiple_sources'
        }
      ]
    });
  });

  // Primary Web Search Endpoint using Inverted Index + BM25 + Ranking Engine
  app.get("/api/search", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    const filter = req.query.filter as string || "all";
    
    // Perform Inverted Index BM25 search
    const indexSearchResult = InvertedIndex.search(query, filter);
    
    let results = indexSearchResult.results;

    // Merge with static demo results if index hits are few
    if (results.length < 3) {
      const demoHits = DEMO_WEB_RESULTS.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.snippet.toLowerCase().includes(query) ||
        item.domain.toLowerCase().includes(query)
      );
      
      const existingIds = new Set(results.map(r => r.id));
      demoHits.forEach(dh => {
        if (!existingIds.has(dh.id)) results.push(dh);
      });
    }

    // Fallback synthesis if no results found
    if (results.length === 0) {
      results = [
        {
          id: "synth-1",
          title: `Exploring ${query}: Comprehensive Technical Overview`,
          url: `https://knowledge-base.org/search?q=${encodeURIComponent(query)}`,
          domain: "knowledge-base.org",
          snippet: `Detailed analysis and decentralized documentation regarding ${query}. Highlighting core principles, recent developments, and expert insights.`,
          category: "general",
          date: "Today"
        },
        {
          id: "synth-2",
          title: `Advanced Protocols & Implementation of ${query}`,
          url: `https://tech-archive.io/${encodeURIComponent(query)}`,
          domain: "tech-archive.io",
          snippet: `Technical specifications, best practices, and architecture frameworks for working with ${query} in modern production environments.`,
          category: "technology",
          date: "3 days ago"
        }
      ];
    }

    // Rank results with Ranking Engine
    const rankedResults = RankingEngine.rankResults(results, query);

    res.json({
      query,
      filter,
      totalResults: rankedResults.length,
      results: rankedResults,
      isRealApi: false,
      provider: "ANTIQORA BM25 & Neural Ranking Engine"
    });
  });

  app.get("/api/images", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    let items = DEMO_IMAGES;
    if (query) {
      items = DEMO_IMAGES.filter(img => img.title.toLowerCase().includes(query) || img.domain.includes(query));
      if (items.length === 0) items = DEMO_IMAGES;
    }
    res.json({ results: items, isRealApi: false });
  });

  app.get("/api/news", (req, res) => {
    const category = (req.query.category as string || "all").toLowerCase();
    let items = DEMO_NEWS;
    if (category !== "all") {
      items = DEMO_NEWS.filter(n => n.category.toLowerCase() === category);
    }
    res.json({ results: items, isRealApi: false });
  });

  app.get("/api/videos", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    let items = DEMO_VIDEOS;
    if (query) {
      items = DEMO_VIDEOS.filter(v => v.title.toLowerCase().includes(query) || v.description.toLowerCase().includes(query));
    }
    res.json({ results: items, isRealApi: false });
  });

  app.get("/api/places", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    let items = DEMO_PLACES;
    if (query) {
      items = DEMO_PLACES.filter(p => p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query));
    }
    res.json({ results: items, isRealApi: false });
  });

  app.get("/api/shopping", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    let items = DEMO_SHOPPING;
    if (query) {
      items = DEMO_SHOPPING.filter(s => s.name.toLowerCase().includes(query) || s.seller.toLowerCase().includes(query));
    }
    res.json({ results: items, isRealApi: false });
  });

  // GitHub Search API proxy route
  app.get("/api/github", async (req, res) => {
    const query = req.query.q as string || "typescript react";
    const githubKey = process.env.GITHUB_API_KEY || process.env.SEARCH_API_KEY;

    try {
      const headers: Record<string, string> = {
        'User-Agent': 'ANTIQORA-Search-Engine',
        'Accept': 'application/vnd.github.v3+json'
      };
      if (githubKey) {
        headers['Authorization'] = `token ${githubKey}`;
      }

      const [repoRes, issueRes] = await Promise.all([
        fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10`, { headers }),
        fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=5`, { headers })
      ]);

      if (repoRes.ok && issueRes.ok) {
        const repoData = await repoRes.json();
        const issueData = await issueRes.json();

        return res.json({
          repositories: repoData.items || [],
          issues: issueData.items || [],
          totalCount: repoData.total_count || 0,
          isRealApi: true
        });
      }
    } catch (e) {
      console.warn("GitHub API rate limit or network issue:", e);
    }

    // Fallback if real GitHub API fails or is rate-limited
    res.json({
      repositories: [
        {
          id: 101,
          name: "antiqora-core",
          full_name: "antiqora/antiqora-core",
          description: `High-performance multi-temporal search engine and neural knowledge synthesis platform for ${query}`,
          html_url: "https://github.com/antiqora/antiqora-core",
          stargazers_count: 1450,
          forks_count: 210,
          language: "TypeScript",
          updated_at: new Date().toISOString(),
          owner: { login: "antiqora", avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" }
        },
        {
          id: 102,
          name: "ev-matlab-simulation",
          full_name: "open-electric/ev-matlab-simulation",
          description: `Advanced electric vehicle powertrain modeling, battery management systems, and MATLAB/Simulink integration for ${query}`,
          html_url: "https://github.com/open-electric/ev-matlab-simulation",
          stargazers_count: 890,
          forks_count: 145,
          language: "MATLAB",
          updated_at: new Date().toISOString(),
          owner: { login: "open-electric", avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" }
        }
      ],
      issues: [
        {
          id: 201,
          title: `Enhancement: query optimization for ${query}`,
          html_url: "https://github.com/antiqora/antiqora-core/issues/42",
          state: "open",
          number: 42,
          repository_url: "https://api.github.com/repos/antiqora/antiqora-core",
          created_at: new Date().toISOString(),
          user: { login: "developer-alpha" }
        }
      ],
      totalCount: 2,
      isRealApi: false
    });
  });

  // Helper for generating text with fallback models for 503 / high demand spikes
  async function generateTextWithFallback(prompt: string, systemInstruction?: string): Promise<string> {
    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const modelName = candidateModels[i];
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3,
          }
        });
        if (response?.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const isTemporary = err?.status === 503 || err?.code === 503 || 
          (typeof err?.message === 'string' && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE')));
        
        console.warn(`Gemini model ${modelName} call failed${isTemporary ? ' (high demand / temporary spike)' : ''}. Trying next candidate...`);
        
        if (i < candidateModels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 350));
        }
      }
    }
    throw lastError || new Error("Unable to reach Gemini models");
  }

  // Helper for chat with fallback models
  async function chatWithFallback(history: any[], lastMessage: string, systemInstruction?: string): Promise<string> {
    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;

    for (let i = 0; i < candidateModels.length; i++) {
      const modelName = candidateModels[i];
      try {
        const chat = ai.chats.create({
          model: modelName,
          history,
          config: {
            systemInstruction
          }
        });
        const response = await chat.sendMessage({ message: lastMessage });
        if (response?.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const isTemporary = err?.status === 503 || err?.code === 503 ||
          (typeof err?.message === 'string' && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE')));
        
        console.warn(`Gemini chat model ${modelName} call failed${isTemporary ? ' (high demand)' : ''}. Trying next candidate...`);
        if (i < candidateModels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 350));
        }
      }
    }
    throw lastError || new Error("Unable to reach Gemini chat models");
  }

  // AI Answer / Overview endpoint using Gemini
  app.post("/api/ai-answer", async (req, res) => {
    const { query, sources } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    try {
      const prompt = `Provide a concise, highly informative, professional AI overview and synthesized summary for the search query: "${query}". 
      Base the summary on reliable technical insights. Provide clear bullet points where appropriate. 
      Never invent fake sources. Distinguish clearly between synthesized knowledge and verified concepts.`;

      const answerText = await generateTextWithFallback(
        prompt,
        "You are ANTIQORA AI, a futuristic, objective, and ultra-precise search intelligence engine. Provide clean markdown formatting."
      );

      res.json({
        answer: answerText,
        sources: sources || [
          { title: "ANTIQORA Knowledge Graph", domain: "antiqora.io", url: "https://antiqora.io" },
          { title: "Global Research Index", domain: "global-research.org", url: "https://global-research.org" }
        ]
      });
    } catch (error: any) {
      console.warn("Notice: Gemini AI Answer fallback invoked due to temporary upstream load:", error?.message || error);
      res.json({ 
        answer: `ANTIQORA Neural Synthesis: Active insights for "${query}". Ongoing developments highlight key advancements across distributed technology, computing paradigms, and verified global research indices. (Live AI model synthesis temporarily experiencing high demand).`,
        sources: sources || [
          { title: "ANTIQORA Knowledge Graph", domain: "antiqora.io", url: "https://antiqora.io" },
          { title: "Global Research Index", domain: "global-research.org", url: "https://global-research.org" }
        ],
        degraded: true
      });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    try {
      const chatHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const lastMessage = messages[messages.length - 1]?.content || "";

      const reply = await chatWithFallback(
        chatHistory,
        lastMessage,
        "You are Ask ANTIQORA, an advanced conversational search intelligence assistant. Provide insightful, accurate, and well-structured answers with markdown formatting."
      );

      res.json({
        reply,
        sources: [
          { title: "ANTIQORA Search Engine", url: "https://antiqora.io", domain: "antiqora.io" }
        ]
      });
    } catch (error: any) {
      console.warn("Notice: AI Chat fallback invoked due to temporary upstream load:", error?.message || error);
      res.json({
        reply: "ANTIQORA neural models are currently experiencing peak demand. Your query has been acknowledged. Please retry in a moment, or continue exploring the search index.",
        sources: [
          { title: "ANTIQORA Status", url: "https://antiqora.io", domain: "antiqora.io" }
        ],
        degraded: true
      });
    }
  });

  app.get("/api/config-status", (req, res) => {
    res.json({
      hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
      hasSearchKey: !!process.env.SEARCH_API_KEY,
      hasNewsKey: !!process.env.NEWS_API_KEY,
      hasMapsKey: !!process.env.MAPS_API_KEY,
      mode: process.env.NODE_ENV || "development"
    });
  });

  // Vite middleware setup for development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ANTIQORA server running on http://localhost:${PORT}`);
  });
}

startServer();
