import React, { useState } from 'react';
import { ImageResultItem } from '../services/api';
import { Search, ExternalLink, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImagesViewProps {
  initialQuery: string;
  images: ImageResultItem[];
}

export const ImagesView: React.FC<ImagesViewProps> = ({ initialQuery, images }) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeImage, setActiveImage] = useState<ImageResultItem | null>(null);

  const filteredImages = images.filter(img => 
    img.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    img.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Visual & Image Search</span>
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Demo Content
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Demo placeholder imagery for visual intelligence prototype.
          </p>
        </div>

        <div className="w-full sm:w-auto relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search images by keyword..."
            className="w-full sm:w-72 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Demo Disclaimer Notice */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Demo Content: The imagery shown is placeholder demo content for prototyping purposes. ANTIQORA does not claim ownership of external demo assets.</span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image display */}
            <div 
              onClick={() => setActiveImage(img)}
              className="relative aspect-w-16 aspect-h-10 w-full overflow-hidden bg-slate-950 h-52 cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/40 backdrop-blur-md">
                Demo Result
              </span>
            </div>

            {/* Card Content & Open Button */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{img.title}</p>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">Source: {img.domain}</span>
                  <span className="text-[11px] text-slate-400">{img.dimensions}</span>
                </div>
              </div>

              {/* Required Open Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Demo Image</span>
                <button
                  onClick={() => setActiveImage(img)}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeImage.title}</h3>
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30">
                    Demo Result
                  </span>
                </div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">Source: {activeImage.domain} • {activeImage.dimensions}</p>
              </div>
              <button
                onClick={() => setActiveImage(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden max-h-[60vh]">
              <img src={activeImage.url} alt={activeImage.title} className="max-h-[60vh] object-contain" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Demo image placeholder preview. Live crawler connects in Phase 2.</span>
              <button
                onClick={() => setActiveImage(null)}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                <span>Close Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
