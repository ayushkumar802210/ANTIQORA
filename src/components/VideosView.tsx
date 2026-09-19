import React, { useState } from 'react';
import { VideoResultItem } from '../services/api';
import { Video, Play, ExternalLink, Clock, AlertCircle, X } from 'lucide-react';

interface VideosViewProps {
  videos: VideoResultItem[];
}

export const VideosView: React.FC<VideosViewProps> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoResultItem | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Video Multimedia Index</span>
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Demo Content
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Demonstration video metadata and simulated streams.
          </p>
        </div>
      </div>

      {/* Demo Disclaimer */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Demo Content: Video results are sample multimedia demonstrations for Phase 1 interface validation. Real video indexing and streaming APIs will be connected in Phase 2.</span>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="flex flex-col sm:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm hover:border-cyan-500/40 transition"
          >
            {/* Thumbnail Placeholder */}
            <div 
              onClick={() => setSelectedVideo(vid)}
              className="relative sm:w-56 h-48 sm:h-auto bg-slate-950 flex-shrink-0 cursor-pointer group"
            >
              <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
              <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-amber-400 border border-amber-500/30">
                Demo Result
              </span>

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shadow-lg">
                  <Play className="w-5 h-5 fill-slate-950" />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{vid.duration}</span>
              </div>
            </div>

            {/* Content & Open Button */}
            <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                    Source: {vid.platform}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {vid.duration}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {vid.title}
                </h3>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {vid.description}
                </p>
              </div>

              {/* Required Open Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Demo Video Stream</span>
                <button
                  onClick={() => setSelectedVideo(vid)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                  title="Open demo video"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Demo Video Stream Player
              </span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-slate-800">
              <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="relative z-10 text-center p-4">
                <div className="w-14 h-14 rounded-full bg-cyan-500 text-slate-950 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-cyan-500/30">
                  <Play className="w-7 h-7 fill-slate-950 ml-0.5" />
                </div>
                <p className="text-sm font-bold text-white">{selectedVideo.title}</p>
                <p className="text-xs text-slate-300 mt-1">Duration: {selectedVideo.duration} • Source: {selectedVideo.platform}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This is a simulated video playback container for Phase 1. In Phase 2, embedded media APIs will stream live video content directly.
            </p>

            <button
              onClick={() => setSelectedVideo(null)}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Close Video Player
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
