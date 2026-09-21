import React, { useState, useEffect } from 'react';
import { ResearchResult } from './ResearchResult';
import { Search, Brain, ArrowRight, RotateCw, AlertTriangle, Sparkles } from 'lucide-react';

interface ResearchAssistantViewProps {
  query: string;
}

export const ResearchAssistantView: React.FC<ResearchAssistantViewProps> = ({ query: initialQuery }) => {
  const [currentQuery, setCurrentQuery] = useState(initialQuery || "Quantum Computing");
  const [searchInput, setSearchInput] = useState(initialQuery || "Quantum Computing");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() })
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (e: any) {
      console.error("Research assistant fetch error:", e);
      setError(e?.message || "Failed to complete research synthesis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setCurrentQuery(initialQuery);
      setSearchInput(initialQuery);
      fetchResearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCurrentQuery(searchInput.trim());
      fetchResearch(searchInput.trim());
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 text-left">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>Multi-Source AI Research Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Cross-Source Synthesis & Fact Verification
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Queries Wikipedia records and indexed web documents in parallel, synthesizes verified answers, highlights disagreements, and cites primary references.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter research topic (e.g., Quantum Computing, Solid-State Batteries, EV Inverters)..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 pl-12 pr-28 py-3.5 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Research</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Current Research Target Pill */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 truncate">
          <span className="text-xs uppercase font-mono text-slate-400">Target Topic:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">"{currentQuery}"</span>
        </div>
        <button
          onClick={() => fetchResearch(currentQuery)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
          title="Re-run synthesis"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent" />
          <p className="text-sm font-medium">
            ANTIQORA AI is aggregating Wikipedia, scholarly data, and web sources for "{currentQuery}"...
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Parallel retrieval and neural source synthesis in progress</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 p-6 text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto" />
          <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          <button
            onClick={() => fetchResearch(currentQuery)}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-xs"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Results View */}
      {!loading && !error && result && (
        <ResearchResult 
          answer={result.answer} 
          keyDetails={result.keyDetails} 
          sourceComparison={result.sourceComparison}
          sources={result.sources}
          wikipedia={result.wikipedia}
        />
      )}
    </div>
  );
};

