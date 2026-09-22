import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/languages';
import { translateText, TranslationResult } from '../services/api';
import { Languages, ArrowRightLeft, Copy, Check, Volume2, VolumeX, Sparkles, Trash2, ArrowRight } from 'lucide-react';

interface TranslateViewProps {
  initialText?: string;
}

const samplePhrases = [
  { label: "English AI Query", text: "How does artificial intelligence process human language?" },
  { label: "हिन्दी खोज", text: "कृत्रिम बुद्धिमत्ता क्या है और यह कैसे काम करती है?" },
  { label: "Hinglish Question", text: "Computer me ram aur rom me kya antar hai?" },
  { label: "Español", text: "¿Cuáles son las ventajas de las energías renovables?" },
  { label: "বাংলা", text: "কম্পিউটার কিভাবে কাজ করে এবং এর প্রধান অংশগুলো কি কি?" }
];

const quickLanguages = [
  { code: 'en', name: 'English', flag: '🌐' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
];

export const TranslateView: React.FC<TranslateViewProps> = ({ initialText = '' }) => {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('hi');
  const [inputText, setInputText] = useState(initialText || 'Welcome to ANTIQORA, the universal multi-language search and knowledge engine.');
  const [outputText, setOutputText] = useState('');
  const [detectedLangDisplay, setDetectedLangDisplay] = useState<string>('');
  const [pronunciation, setPronunciation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speakingSide, setSpeakingSide] = useState<'source' | 'target' | null>(null);

  // Auto-translate on mount or when initialText changes
  React.useEffect(() => {
    if (inputText.trim()) {
      handleTranslateText(inputText, targetLang, sourceLang);
    }
  }, []);

  const handleTranslateText = async (text: string, target: string, source: string) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res: TranslationResult = await translateText(text, target, source);
      setOutputText(res.translatedText || `[${target}]: ${text}`);
      if (res.detectedLanguage) {
        setDetectedLangDisplay(res.detectedLanguage);
      }
      if (res.pronunciation) {
        setPronunciation(res.pronunciation);
      } else {
        setPronunciation('');
      }
    } catch (e) {
      console.error("Translation failed:", e);
      setOutputText(`[${target}]: ${text}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = () => {
    handleTranslateText(inputText, targetLang, sourceLang);
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') {
      // If auto-detect was active, swap to English as default source
      setSourceLang(targetLang);
      setTargetLang('en');
    } else {
      const tempLang = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempLang);
    }
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
    setDetectedLangDisplay('');
    setPronunciation('');
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, langCode: string, side: 'source' | 'target') => {
    if (!('speechSynthesis' in window)) return;
    if (speakingSide === side) {
      window.speechSynthesis.cancel();
      setSpeakingSide(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingSide(null);
    utterance.onerror = () => setSpeakingSide(null);
    setSpeakingSide(side);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 text-left">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <Languages className="w-4 h-4" />
          <span>Multilingual AI Translation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Cross-Lingual Knowledge & Neural Translation</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Powered
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Translate seamlessly across any language: English, Indian regional scripts (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi), and international languages.
        </p>
      </div>

      {/* Quick Language Target Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">Quick Target:</span>
        {quickLanguages.map((l) => (
          <button
            key={l.code}
            onClick={() => {
              setTargetLang(l.code);
              if (outputText) handleTranslate();
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition border flex items-center gap-1 ${
              targetLang === l.code
                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>

      {/* Language Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source Select */}
          <div className="relative">
            <select
              value={sourceLang}
              onChange={(e) => {
                setSourceLang(e.target.value);
                setDetectedLangDisplay('');
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="auto">Auto-Detect Language</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name} ({l.nativeName})</option>
              ))}
            </select>
          </div>

          {detectedLangDisplay && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold border border-cyan-500/20">
              Detected: {detectedLangDisplay}
            </span>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          {/* Target Select */}
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name} ({l.nativeName})</option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <span>Translate Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Input / Output Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 rounded-b-2xl overflow-hidden border-x border-b border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Source Box */}
        <div className="bg-white dark:bg-slate-950 p-4 flex flex-col justify-between min-h-[280px]">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text in any language..."
            className="w-full h-48 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-900">
            <div className="flex items-center gap-3">
              <span>{inputText.length} characters</span>
              {inputText && (
                <button
                  onClick={() => handleSpeak(inputText, sourceLang === 'auto' ? 'en-US' : sourceLang, 'source')}
                  className="flex items-center gap-1 text-slate-500 hover:text-cyan-500 transition"
                  title="Listen to pronunciation"
                >
                  {speakingSide === 'source' ? <VolumeX className="w-3.5 h-3.5 text-cyan-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{speakingSide === 'source' ? 'Stop' : 'Listen'}</span>
                </button>
              )}
            </div>
            {inputText && (
              <button
                onClick={() => {
                  setInputText('');
                  setOutputText('');
                  setDetectedLangDisplay('');
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Translation Box */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 flex flex-col justify-between min-h-[280px] text-left">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <p className="text-xs text-slate-400">Processing cross-lingual neural translation...</p>
            </div>
          ) : (
            <div className="h-48 overflow-y-auto text-sm text-slate-800 dark:text-slate-200 leading-relaxed pr-1">
              {outputText ? (
                <div>
                  <p className="whitespace-pre-line font-medium text-slate-900 dark:text-slate-100">{outputText}</p>
                  {pronunciation && (
                    <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                      Pronunciation: {pronunciation}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">
                  Translation will appear here instantly. Enter text and click "Translate Now".
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span>Target: {SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name}</span>
              {outputText && (
                <button
                  onClick={() => handleSpeak(outputText, targetLang, 'target')}
                  className="flex items-center gap-1 text-slate-500 hover:text-cyan-500 transition"
                  title="Listen to translation"
                >
                  {speakingSide === 'target' ? <VolumeX className="w-3.5 h-3.5 text-cyan-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{speakingSide === 'target' ? 'Stop' : 'Listen'}</span>
                </button>
              )}
            </div>
            {outputText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-cyan-500 transition shadow-xs"
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
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Try sample queries across languages:
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(phrase.text);
                setOutputText('');
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-xs flex items-center gap-1.5"
            >
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">{phrase.label}:</span>
              <span>"{phrase.text.slice(0, 36)}..."</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
