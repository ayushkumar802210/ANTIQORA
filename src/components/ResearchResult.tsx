import React from 'react';
import { ExternalLink, BookOpen, Globe, CheckCircle2, GitCompare, Sparkles } from 'lucide-react';

export interface SourceItem {
  name: string;
  title: string;
  url: string;
  excerpt?: string;
  date?: string;
  type?: 'Official' | 'Wikipedia' | 'Web' | 'News' | string;
}

export interface ResearchResultProps {
  answer?: string;
  keyDetails?: string[];
  sourceComparison?: string;
  sources?: SourceItem[];
  wikipedia?: { title: string; url: string; summary: string } | null;
}

export const ResearchResult: React.FC<ResearchResultProps> = ({ 
  answer = "", 
  keyDetails = [], 
  sourceComparison, 
  sources = [], 
  wikipedia 
}) => {
  const safeDetails = Array.isArray(keyDetails) ? keyDetails : [];
  const safeSources = Array.isArray(sources) ? sources : [];

  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      {/* Primary Synthesized Answer */}
      {answer && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Synthesized Answer
            </h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
            {answer}
          </p>
        </section>
      )}

      {/* Key Details */}
      {safeDetails.length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 backdrop-blur-sm shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Key Technical Details
            </h2>
          </div>
          <ul className="space-y-2.5">
            {safeDetails.map((detail, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                <span className="leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Source Comparison */}
      {sourceComparison && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-cyan-50/50 dark:bg-cyan-950/20 p-6 border-l-4 border-l-cyan-500 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <GitCompare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Source Comparison & Verification
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {sourceComparison}
          </p>
        </section>
      )}

      {/* Wikipedia Section */}
      {wikipedia && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-amber-500/5 dark:bg-amber-500/10 p-6 border-l-4 border-l-amber-500 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Wikipedia Knowledge Base
              </h2>
            </div>
            <a
              href={wikipedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Open Entry <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {wikipedia.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            {wikipedia.summary}
          </p>
        </section>
      )}

      {/* Sources Grid */}
      {safeSources.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Verified Sources & Citations
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeSources.map((source, index) => (
              <div 
                key={index} 
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 hover:border-cyan-500/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {source.name || 'Web Source'}
                    </span>
                    {source.type && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {source.type}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                    {source.title}
                  </p>
                </div>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1.5 mt-3 font-medium transition"
                >
                  <span>Visit Article</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

