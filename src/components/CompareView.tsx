import React, { useState, useEffect } from 'react';
import { ComparisonData } from '../types';
import { compareEntities } from '../services/api';
import { GitCompare, ArrowRight, CheckCircle2, Award, Zap, HelpCircle } from 'lucide-react';

interface CompareViewProps {
  initialA?: string;
  initialB?: string;
  initialTopic?: string;
}

export const CompareView: React.FC<CompareViewProps> = ({
  initialA = 'Quantum Computing',
  initialB = 'Classical Supercomputing'
}) => {
  const [entityA, setEntityA] = useState(initialA);
  const [entityB, setEntityB] = useState(initialB);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  const samplePairs = [
    { a: 'Quantum Computing', b: 'Classical Supercomputing' },
    { a: 'Solid-State Batteries', b: 'Lithium-Ion Batteries' },
    { a: 'Rust Language', b: 'C++ Systems Programming' },
    { a: 'Decentralized Energy Grids', b: 'Centralized Grid Utility' }
  ];

  const handleCompare = async (a: string, b: string) => {
    if (!a.trim() || !b.trim()) return;
    setLoading(true);
    try {
      const data = await compareEntities(a.trim(), b.trim());
      setComparison(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCompare(initialA, initialB);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-left">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <GitCompare className="w-4 h-4" />
          <span>Multi-Dimensional Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Side-by-Side Architectural & Metric Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Evaluate technologies, models, standards, and systems across formal engineering, economic, and future longevity criteria.
        </p>

        {/* Input Pair Form */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-3xl">
          <input
            type="text"
            value={entityA}
            onChange={(e) => setEntityA(e.target.value)}
            placeholder="Primary Subject (e.g. Rust)"
            className="w-full sm:flex-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VS</span>
          <input
            type="text"
            value={entityB}
            onChange={(e) => setEntityB(e.target.value)}
            placeholder="Comparison Subject (e.g. C++)"
            className="w-full sm:flex-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm"
          />
          <button
            onClick={() => handleCompare(entityA, entityB)}
            className="w-full sm:w-auto rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            Compare
          </button>
        </div>

        {/* Preset suggestions */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick comparison presets:</span>
          {samplePairs.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEntityA(p.a);
                setEntityB(p.b);
                handleCompare(p.a, p.b);
              }}
              className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition"
            >
              {p.a} vs {p.b}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Synthesizing comparative benchmark matrix...</p>
        </div>
      ) : comparison ? (
        <div className="space-y-6 text-left">
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-slate-900/60 p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-2">
              Executive Evaluation Summary
            </h2>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {comparison.summary}
            </p>
          </div>

          {/* Side-by-Side Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="p-4 font-semibold w-1/4">Evaluation Vector</th>
                  <th className="p-4 font-semibold w-5/12 text-cyan-600 dark:text-cyan-400">{comparison.entityA}</th>
                  <th className="p-4 font-semibold w-5/12 text-indigo-600 dark:text-indigo-400">{comparison.entityB}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {comparison.criteria.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div>{row.aspect}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-normal">{row.category}</span>
                    </td>
                    <td className={`p-4 ${row.verdict === 'A' ? 'bg-cyan-500/5 dark:bg-cyan-500/10 font-medium' : ''}`}>
                      <div className="flex items-start gap-1.5">
                        {row.verdict === 'A' && <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />}
                        <span>{row.entityAVal}</span>
                      </div>
                    </td>
                    <td className={`p-4 ${row.verdict === 'B' ? 'bg-indigo-500/5 dark:bg-indigo-500/10 font-medium' : ''}`}>
                      <div className="flex items-start gap-1.5">
                        {row.verdict === 'B' && <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />}
                        <span>{row.entityBVal}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendation */}
          {comparison.recommendation && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Decision & Architectural Recommendation</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {comparison.recommendation}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
