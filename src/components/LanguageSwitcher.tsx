import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/languages';
import { SupportedLanguage } from '../types';
import { Languages, Globe, Check, Search, ChevronDown, Sparkles } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
  compact?: boolean;
}

const POPULAR_LANG_CODES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'es', 'fr', 'de', 'ar', 'ja'];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage = 'en',
  onSelectLanguage,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeLang = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🌐'
    };
  }, [currentLanguage]);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const popularLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(l => POPULAR_LANG_CODES.includes(l.code));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onSelectLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="antiqora-language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-xl border transition shadow-xs cursor-pointer select-none ${
          isOpen
            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'
            : 'border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80'
        } ${compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs font-semibold'}`}
        title={`Current Language: ${activeLang.nativeName} (${activeLang.name}). Click to switch explanation & interface language.`}
        aria-label="Language Switcher"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{activeLang.flag}</span>
        <span className="hidden sm:inline font-semibold">{activeLang.nativeName}</span>
        <span className="sm:hidden font-semibold">{activeLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
      </button>

      {/* Language Selection Dropdown Modal */}
      {isOpen && (
        <div 
          id="antiqora-language-dropdown"
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left"
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Languages className="w-4 h-4 text-cyan-500" />
                <span>Choose Language / भाषा चुनें</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-2.5 h-2.5" />
                AI Live Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Dynamically adapts search synthesis, explanations & regional results.
            </p>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language (e.g., Hindi, Español, বাংলা)..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Quick Popular Pills (if not searching) */}
          {!searchQuery && (
            <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
                Popular & Regional:
              </span>
              <div className="flex flex-wrap gap-1">
                {popularLanguages.slice(0, 8).map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelect(l.code)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 border ${
                      currentLanguage === l.code
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-500/30'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full Language List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching languages found
              </div>
            ) : (
              filteredLanguages.map((l: SupportedLanguage) => {
                const isSelected = currentLanguage === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => handleSelect(l.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition ${
                      isSelected
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{l.flag}</span>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                          {l.nativeName}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">
                          {l.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {l.code}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-cyan-500" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Active: {activeLang.name} ({activeLang.nativeName}) — AI Explanation & UI
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
