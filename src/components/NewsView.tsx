import React, { useState, useEffect } from 'react';
import { NewsResultItem } from '../services/api';
import { Newspaper, ExternalLink, Calendar, Tag, AlertCircle, X, Search } from 'lucide-react';

interface NewsViewProps {
  news: NewsResultItem[];
  isLoading?: boolean;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ news, searchQuery = '', onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeStory, setActiveStory] = useState<NewsResultItem | null>(null);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  const categories = ["all", "Science", "Technology", "Business"];

  const filteredNews = selectedCategory === "all" 
    ? news 
    : news.filter(n => n.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>News Intelligence Feed</span>
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Curated intelligence reports, headlines, and domain dispatches.
          </p>
        </div>

        {/* Search Input & Category Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news headlines..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition ${
                  selectedCategory === cat 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:border-cyan-500/40 transition-all duration-300 space-y-4"
          >
            <div className="space-y-3">
              {/* Category, Date */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold">
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>

              {/* Short Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Source & Required Open Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Source: {item.source}
              </span>
              
              <button
                onClick={() => setActiveStory(item)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                title="Read news story"
              >
                <span>Read Story</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Story Detail Preview Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Story Reader
              </span>
              <button
                onClick={() => setActiveStory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">Source: {activeStory.source} • {activeStory.date}</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeStory.title}
              </h3>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              {activeStory.summary}
            </p>

            <button
              onClick={() => setActiveStory(null)}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Close Story
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
