import React, { useState, useRef } from 'react';
import { FileText, Upload, X, Sparkles, CheckCircle2, BookOpen, Search } from 'lucide-react';
import { analyzeDocument } from '../services/api';

interface DocumentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchWithDoc: (query: string) => void;
}

export const DocumentSearchModal: React.FC<DocumentSearchModalProps> = ({
  isOpen,
  onClose,
  onSearchWithDoc
}) => {
  const [docText, setDocText] = useState('');
  const [docName, setDocName] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    keyFindings: string[];
    answer: string;
    citations: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setDocText(reader.result as string);
        setResult(null);
      };
      reader.readAsText(file);
    }
  };

  const handleSampleDoc = (title: string, text: string) => {
    setDocName(title);
    setDocText(text);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!docText) return;
    setLoading(true);
    try {
      const res = await analyzeDocument(docText, query || "Summarize main findings and structure");
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ANTIQORA Document & Paper Intelligence</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload or Text Paste Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {docName ? `Loaded: ${docName}` : 'Upload report / research paper or paste text:'}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse file (.txt, .md, .pdf)</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.json,.pdf,.doc"
              className="hidden"
            />
          </div>

          <textarea
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder="Paste text excerpt or research paper content here..."
            rows={5}
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Sample Document buttons */}
        {!docText && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Load sample research papers:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSampleDoc(
                  "Quantum_Error_Mitigation_2026.txt",
                  "TITLE: Autonomous Quantum Error Mitigation in Fault-Tolerant Topologies\nAUTHORS: Dr. E. Vance et al.\nABSTRACT: We demonstrate a 40% reduction in qubit decoherence using real-time topological feedback loops. Benchmarks on 1024-qubit processors indicate stable coherence times exceeding 450 microseconds at 15mK temperatures."
                )}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs hover:border-cyan-500 transition"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">Quantum Error Mitigation</span>
                <span className="text-[10px] text-slate-500">IEEE Paper Abstract</span>
              </button>
              <button
                type="button"
                onClick={() => handleSampleDoc(
                  "Solid_State_Battery_Whitepaper.txt",
                  "TITLE: High-Density Silicon-Anode Solid-State Battery Trajectories\nABSTRACT: Evaluation of ceramic and polymer composite electrolytes shows 520 Wh/kg specific energy density, retaining 89% capacity after 1500 fast-charge cycles."
                )}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs hover:border-cyan-500 transition"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">Solid-State Battery Trajectory</span>
                <span className="text-[10px] text-slate-500">Energy Whitepaper</span>
              </button>
            </div>
          </div>
        )}

        {/* Query Input & Trigger */}
        {docText && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a specific question about this document..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition whitespace-nowrap shadow-md"
              >
                {loading ? 'Synthesizing...' : 'Analyze Document'}
              </button>
            </div>

            {/* Results Output */}
            {result && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-indigo-500/20 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Document Synthesis & Key Citations</span>
                  </span>
                  <button
                    onClick={() => {
                      onSearchWithDoc(docName || 'Document analysis');
                      onClose();
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Explore related topics in Search →
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {result.summary}
                </p>

                {result.keyFindings && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Key Empirical Findings:</span>
                    <ul className="space-y-1 list-disc list-inside text-xs text-slate-600 dark:text-slate-300">
                      {result.keyFindings.map((finding, i) => (
                        <li key={i}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.answer && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400 block mb-1">Answer to Query:</span>
                    <p>{result.answer}</p>
                  </div>
                )}

                {result.citations && result.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.citations.map((cit, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                        {cit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
