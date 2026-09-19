import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/languages';
import { translateText } from '../services/api';
import { Languages, ArrowRightLeft, Copy, Check, Volume2, Sparkles } from 'lucide-react';

interface TranslateViewProps {
  initialText?: string;
}

export const TranslateView: React.FC<TranslateViewProps> = ({ initialText = '' }) => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('hi');
  const [inputText, setInputText] = useState(initialText || 'Welcome to ANTIQORA, the multi-temporal search and knowledge platform.');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const samplePhrases = [
    "Welcome to ANTIQORA, understanding the world beyond search.",
    "Artificial intelligence is transforming science and global research.",
    "Sustainable energy systems provide resilience for future generations.",
    "What are the historical roots of quantum computing algorithms?"
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await translateText(inputText, targetLang, sourceLang);
      setOutputText(res.translatedText);
    } catch (e) {
      console.error(e);
      setOutputText(`[${targetLang}]: ${inputText}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-left">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <Languages className="w-4 h-4" />
          <span>Multilingual Cognitive Translation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Cross-Lingual Knowledge & Script Translation
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Translate technical, historical, and modern content across English, Indian languages (Hindi, Tamil, Telugu, Bengali), and international idioms.
        </p>
      </div>

      {/* Language Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="auto">Auto-Detect Language</option>
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name} ({l.nativeName})</option>
            ))}
          </select>

          <button
            onClick={handleSwap}
            disabled={sourceLang === 'auto'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name} ({l.nativeName})</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="rounded-xl bg-cyan-500 px-5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition"
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {/* Input / Output Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 rounded-b-2xl overflow-hidden border-x border-b border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Source Box */}
        <div className="bg-white dark:bg-slate-950 p-4 flex flex-col justify-between min-h-[260px]">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
            className="w-full h-48 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-900">
            <span>{inputText.length} characters</span>
            <button
              onClick={() => setInputText('')}
              className="hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Translation Box */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 flex flex-col justify-between min-h-[260px] text-left">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
          ) : (
            <div className="h-48 overflow-y-auto text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {outputText ? (
                <p>{outputText}</p>
              ) : (
                <p className="text-slate-400 italic">Translation will appear here after clicking Translate.</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Target: {SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name}</span>
            {outputText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-cyan-500 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset sample phrases */}
      <div className="mt-6 text-left">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Try sample translations:
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(phrase);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
            >
              "{phrase.slice(0, 42)}..."
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
