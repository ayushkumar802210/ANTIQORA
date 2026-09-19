import React, { useState, useEffect } from 'react';
import { ResearchPaper } from '../types';
import { searchResearch } from '../services/api';
import { BookOpen, Search, ExternalLink, Bookmark, Award, FileText, Check, Copy } from 'lucide-react';

interface ResearchViewProps {
  initialQuery?: string;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ initialQuery = 'Quantum Computing' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);

  const fetchPapers = async (q: string) => {
    setLoading(true);
    try {
      const data = await searchResearch(q);
      setPapers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchPapers(query.trim());
    }
  };

  const handleCopyDoi = (doi: string) => {
    navigator.clipboard.writeText(doi);
    setCopiedDoi(doi);
    setTimeout(() => setCopiedDoi(null), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-left">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Academic & Research Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Peer-Reviewed Literature & Semantic Citations
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Search scholarly papers, extract verified experimental findings, inspect DOI citations, and review methodology.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex max-w-2xl gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scientific papers, authors, DOIs..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 pl-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            Search Papers
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Querying global scholarly archives...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <p className="text-slate-500">No papers found for "{query}". Try a broader technical term.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {papers.map((paper) => (
            <article
              key={paper.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:border-cyan-500/40 transition text-left"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {paper.journal} · {paper.year}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {paper.citationsCount} Citations
                  </span>
                  {paper.doi && (
                    <button
                      onClick={() => handleCopyDoi(paper.doi!)}
                      className="flex items-center gap-1 text-slate-400 hover:text-cyan-500 transition"
                      title="Copy DOI identifier"
                    >
                      {copiedDoi === paper.doi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>DOI: {paper.doi}</span>
                    </button>
                  )}
                </div>
              </div>

              <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {paper.title}
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Authors: {paper.authors.join(', ')}
              </p>

              <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3.5 border border-slate-200 dark:border-slate-800/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Abstract</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {paper.abstract}
                </p>
              </div>

              {paper.keyFindings && paper.keyFindings.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
                    Verified Key Findings:
                  </p>
                  <ul className="space-y-1.5">
                    {paper.keyFindings.map((finding, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-cyan-500 font-bold">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
