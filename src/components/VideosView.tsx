import React, { useState } from 'react';
import { VideoResultItem } from '../services/api';
import { Video, Play, ExternalLink, Clock, AlertCircle, X } from 'lucide-react';

interface VideosViewProps {
  videos: VideoResultItem[];
  isLoading?: boolean;
}

const getEmbedUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`;
  }
  if (/\.(mp4|webm|ogg)$/i.test(url)) {
    return url;
  }
  return null;
};

export const VideosView: React.FC<VideosViewProps> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoResultItem | null>(null);

  const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.url) : null;

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
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              HD Media
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Streaming video metadata, educational tutorials, and indexed multimedia content.
          </p>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="flex flex-col sm:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm hover:border-cyan-500/40 transition"
          >
            {/* Thumbnail */}
            <div 
              onClick={() => setSelectedVideo(vid)}
              className="relative sm:w-56 h-48 sm:h-auto bg-slate-950 flex-shrink-0 cursor-pointer group"
            >
              <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

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
                <span className="text-[10px] text-slate-400">Stream Source: {vid.platform}</span>
                <button
                  onClick={() => setSelectedVideo(vid)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                  title="Watch video"
                >
                  <span>Play</span>
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                  {selectedVideo.platform || 'Media Player'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 line-clamp-1">{selectedVideo.title}</h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl">
              {embedUrl ? (
                embedUrl.endsWith('.mp4') ? (
                  <video controls autoPlay className="w-full h-full">
                    <source src={selectedVideo.url} type="video/mp4" />
                  </video>
                ) : (
                  <iframe
                    src={embedUrl}
                    title={selectedVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  <div className="relative z-10 space-y-3">
                    <p className="text-xs font-bold text-white">{selectedVideo.title}</p>
                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
                    >
                      <span>Watch Stream on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-lg">
                {selectedVideo.description}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
