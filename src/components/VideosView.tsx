import React, { useState, useMemo, useEffect } from 'react';
import { VideoResultItem, VideoSummaryResponse, summarizeVideo } from '../services/api';
import { 
  Video, 
  Play, 
  ExternalLink, 
  Clock, 
  X, 
  TrendingUp, 
  Sparkles, 
  Film, 
  Smartphone, 
  RotateCcw, 
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

export type VideoFilterCategory = 'all' | 'latest' | 'popular' | 'long-form' | 'shorts';

interface VideosViewProps {
  videos: VideoResultItem[];
  isLoading?: boolean;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

const getEmbedUrl = (url: string, thumbnail?: string): string | null => {
  if (!url) return null;
  
  if (url.includes('youtube.com/results') || url.includes('/results?search_query=')) {
    return null;
  }

  // Match any YouTube URL formats: watch?v=, youtu.be/, embed/, shorts/, live/, v/
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
  }

  // Fallback to extract video ID from thumbnail URL if present
  if (thumbnail) {
    const thumbMatch = thumbnail.match(/\/vi\/([a-zA-Z0-9_-]{11})\//i);
    if (thumbMatch && thumbMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${thumbMatch[1]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
  }

  // Direct video files
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return url;
  }
  return null;
};

const parseDurationSeconds = (durStr: string): number => {
  if (!durStr) return 0;
  const parts = durStr.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
};

const isShortVideo = (vid: VideoResultItem): boolean => {
  const sec = parseDurationSeconds(vid.duration);
  const plat = (vid.platform || '').toLowerCase();
  const title = (vid.title || '').toLowerCase();
  const desc = (vid.description || '').toLowerCase();
  
  if (sec > 0 && sec <= 120) return true;
  if (plat.includes('reels') || plat.includes('tiktok') || plat.includes('shorts') || plat.includes('clip')) return true;
  if (title.includes('short') || title.includes('reel') || title.includes('viral clip') || title.includes('tiktok')) return true;
  if (desc.includes('short video') || desc.includes('reel') || desc.includes('tiktok')) return true;
  return false;
};

const isLongFormVideo = (vid: VideoResultItem): boolean => {
  const sec = parseDurationSeconds(vid.duration);
  const plat = (vid.platform || '').toLowerCase();
  const title = (vid.title || '').toLowerCase();
  const desc = (vid.description || '').toLowerCase();
  
  if (sec >= 600) return true; // 10 minutes or more
  if (plat.includes('movie') || plat.includes('archive') || plat.includes('broadcast') || plat.includes('documentary')) return true;
  if (title.includes('full movie') || title.includes('interview') || title.includes('analysis') || title.includes('deep dive') || title.includes('podcast') || title.includes('archive') || title.includes('special debate')) return true;
  if (desc.includes('full length') || desc.includes('in-depth') || desc.includes('comprehensive') || desc.includes('complete analysis')) return true;
  return false;
};

const isLatestVideo = (vid: VideoResultItem): boolean => {
  const title = (vid.title || '').toLowerCase();
  const desc = (vid.description || '').toLowerCase();
  const plat = (vid.platform || '').toLowerCase();
  
  const keywords = ['latest', 'breaking', 'news', 'live', 'vlog', 'today', 'recent', '2026', '2025', 'broadcast', 'statement', 'update', 'current'];
  return keywords.some(k => title.includes(k) || desc.includes(k) || plat.includes(k));
};

const isPopularVideo = (vid: VideoResultItem): boolean => {
  const title = (vid.title || '').toLowerCase();
  const desc = (vid.description || '').toLowerCase();
  const plat = (vid.platform || '').toLowerCase();
  const channel = (vid.channel || '').toLowerCase();
  
  const keywords = ['popular', 'official', 'viral', 'review', 'reaction', 'exclusive', 'blockbuster', 'prime time', 'top', 'trending', 'hit', 'spotlight', 'star', 'ytimg'];
  return keywords.some(k => title.includes(k) || desc.includes(k) || plat.includes(k) || channel.includes(k));
};

export const VideosView: React.FC<VideosViewProps> = ({ videos, isLoading, searchQuery = '', onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedVideo, setSelectedVideo] = useState<VideoResultItem | null>(null);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
    }
  };
  const [activeCategory, setActiveCategory] = useState<VideoFilterCategory>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'embed' | 'direct'>('embed');
  const [videoSummaries, setVideoSummaries] = useState<Record<string, VideoSummaryResponse>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.url, selectedVideo.thumbnail) : null;
  const selectedVideoKey = selectedVideo ? (selectedVideo.id || selectedVideo.url || selectedVideo.title) : '';
  const currentSummary = selectedVideoKey ? videoSummaries[selectedVideoKey] : undefined;
  const isSelectedLongForm = selectedVideo ? isLongFormVideo(selectedVideo) : false;

  const handleGenerateSummary = async (video: VideoResultItem, forceRefresh = false) => {
    const key = video.id || video.url || video.title;
    if (!forceRefresh && videoSummaries[key]) {
      return;
    }

    setIsSummarizing(true);
    try {
      const summaryData = await summarizeVideo({
        title: video.title,
        description: video.description,
        duration: video.duration,
        platform: video.platform,
        channel: video.channel,
        url: video.url
      });
      setVideoSummaries(prev => ({
        ...prev,
        [key]: summaryData
      }));
    } catch (err) {
      console.warn("Error generating video summary:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (!selectedVideo || !currentSummary) return;

    const lines = [
      `AI Summary: ${selectedVideo.title}`,
      `Duration: ${selectedVideo.duration} • Channel: ${selectedVideo.channel || selectedVideo.platform}`,
      '',
      `Overview: ${currentSummary.summary}`,
      '',
      'Key Discussion & Takeaways:',
      ...currentSummary.bullets.map(b => `• ${b}`),
      ...(currentSummary.keyTopics && currentSummary.keyTopics.length > 0 ? ['', `Key Topics: ${currentSummary.keyTopics.map(t => `#${t.replace(/^#/, '')}`).join(' ')}`] : []),
      ...(currentSummary.timeSaved ? [`Estimated Time Saved: ${currentSummary.timeSaved}`] : [])
    ];

    if (navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  // Auto-generate AI summary for long-form videos when opened in Quick Look modal
  useEffect(() => {
    if (!selectedVideo) {
      setCopiedSummary(false);
      return;
    }
    const isLong = isLongFormVideo(selectedVideo);
    const key = selectedVideo.id || selectedVideo.url || selectedVideo.title;

    if (isLong && !videoSummaries[key] && !isSummarizing) {
      handleGenerateSummary(selectedVideo);
    }
  }, [selectedVideo]);

  // Open Quick Look Modal directly in-app on click without navigating away
  const handleVideoClick = (vid: VideoResultItem) => {
    setSelectedVideo(vid);
    setCopiedLink(false);
    // If embedding is known to be restricted, default to Direct HD Player to prevent 'video unavailable'
    if (vid.isEmbeddable === false) {
      setPlaybackMode('direct');
    } else {
      setPlaybackMode('embed');
    }
  };

  const handleCategoryToggle = (category: VideoFilterCategory) => {
    if (activeCategory === category && category !== 'all') {
      setActiveCategory('all');
    } else {
      setActiveCategory(category);
    }
  };

  const categoryCounts = useMemo(() => {
    const shorts = videos.filter(isShortVideo).length;
    const longForm = videos.filter(isLongFormVideo).length;
    const latest = videos.filter(isLatestVideo).length;
    const popular = videos.filter(isPopularVideo).length;
    return {
      all: videos.length,
      latest: latest > 0 ? latest : videos.length,
      popular: popular > 0 ? popular : videos.length,
      'long-form': longForm > 0 ? longForm : Math.min(videos.length, 3),
      shorts: shorts > 0 ? shorts : Math.min(videos.length, 2),
    };
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'all') {
      return videos;
    }
    if (activeCategory === 'shorts') {
      const list = videos.filter(isShortVideo);
      if (list.length > 0) return list;
      return [...videos].sort((a, b) => parseDurationSeconds(a.duration) - parseDurationSeconds(b.duration)).slice(0, Math.ceil(videos.length / 2));
    }
    if (activeCategory === 'long-form') {
      const list = videos.filter(isLongFormVideo);
      if (list.length > 0) return list;
      return [...videos].sort((a, b) => parseDurationSeconds(b.duration) - parseDurationSeconds(a.duration)).slice(0, Math.ceil(videos.length / 2));
    }
    if (activeCategory === 'latest') {
      const matched = videos.filter(isLatestVideo);
      if (matched.length > 0) {
        const unmatched = videos.filter(v => !isLatestVideo(v));
        return [...matched, ...unmatched];
      }
      return [...videos].reverse();
    }
    if (activeCategory === 'popular') {
      const matched = videos.filter(isPopularVideo);
      if (matched.length > 0) {
        const unmatched = videos.filter(v => !isPopularVideo(v));
        return [...matched, ...unmatched];
      }
      return videos;
    }
    return videos;
  }, [videos, activeCategory]);

  const currentVideoIndex = useMemo(() => {
    if (!selectedVideo) return -1;
    return filteredVideos.findIndex(v => v.id === selectedVideo.id);
  }, [selectedVideo, filteredVideos]);

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      setSelectedVideo(filteredVideos[currentVideoIndex - 1]);
      setCopiedLink(false);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex >= 0 && currentVideoIndex < filteredVideos.length - 1) {
      setSelectedVideo(filteredVideos[currentVideoIndex + 1]);
      setCopiedLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!selectedVideo) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedVideo.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Keyboard navigation inside Quick Look modal (Escape, Left, Right)
  useEffect(() => {
    if (!selectedVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null);
      } else if (e.key === 'ArrowLeft' && currentVideoIndex > 0) {
        setSelectedVideo(filteredVideos[currentVideoIndex - 1]);
        setCopiedLink(false);
      } else if (e.key === 'ArrowRight' && currentVideoIndex < filteredVideos.length - 1) {
        setSelectedVideo(filteredVideos[currentVideoIndex + 1]);
        setCopiedLink(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo, currentVideoIndex, filteredVideos]);

  const filterOptions: { id: VideoFilterCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'latest', label: 'Latest', icon: Clock },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'long-form', label: 'Long-form', icon: Film },
    { id: 'shorts', label: 'Shorts', icon: Smartphone },
  ];

  return (
    <div id="videos-view-container" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
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
            Streaming video metadata, verified creator reviews, official channels, and indexed multimedia content.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search videos & channels..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </form>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span>{filteredVideos.length} of {videos.length} videos</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div id="video-filter-bar" className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mr-2 px-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter:</span>
          </div>

          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeCategory === opt.id;
            const count = categoryCounts[opt.id];

            return (
              <button
                key={opt.id}
                id={`video-filter-${opt.id}`}
                onClick={() => handleCategoryToggle(opt.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20 font-bold'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60'
                }`}
                title={`Filter by ${opt.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeCategory !== 'all' && (
          <button
            id="video-filter-reset"
            onClick={() => setActiveCategory('all')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Reset filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filter</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-col sm:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden h-48">
              <div className="sm:w-56 h-48 bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              <div className="p-5 flex-1 space-y-3">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Filter State */}
      {!isLoading && filteredVideos.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <Video className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No videos in category "{activeCategory}"</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try switching to another filter or reset to view all available video streams.
          </p>
          <button
            id="video-filter-empty-reset"
            onClick={() => setActiveCategory('all')}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Show All Videos</span>
          </button>
        </div>
      )}

      {/* Video Cards Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVideos.map((vid) => {
            const isShort = isShortVideo(vid);
            const isLong = isLongFormVideo(vid);

            return (
              <div
                key={vid.id}
                id={`video-card-${vid.id}`}
                onClick={() => handleVideoClick(vid)}
                className="flex flex-col sm:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm hover:border-cyan-500/50 hover:shadow-md transition cursor-pointer group"
                title="Click for in-app Quick Look"
              >
                {/* Thumbnail */}
                <div 
                  className="relative sm:w-56 h-48 sm:h-auto bg-slate-950 flex-shrink-0"
                >
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-0.5 text-[10px] font-mono text-white flex items-center gap-1 backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{vid.duration}</span>
                  </div>

                  {/* Category Pill Tag on Thumbnail */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {(vid as any).isAdult && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-600 text-white backdrop-blur-sm shadow-sm">
                        18+ Mature
                      </span>
                    )}
                    {isShort && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-fuchsia-500/90 text-white backdrop-blur-sm shadow-sm">
                        Shorts
                      </span>
                    )}
                    {isLong && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-sm shadow-sm">
                        Long-form
                      </span>
                    )}
                  </div>
                </div>

                {/* Content & Quick Look Action */}
                <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider bg-cyan-500/10 dark:bg-cyan-500/15 px-2 py-0.5 rounded-md">
                        {vid.platform}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {vid.duration}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {vid.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  {/* Quick-Look & Stream Info Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] font-medium">
                      {vid.channel || vid.platform}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-white dark:bg-red-500/15 text-red-600 dark:text-red-400 px-3 py-1.5 text-xs font-bold transition shadow-xs"
                        title="Watch full video directly on YouTube in HD"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch on YouTube</span>
                      </a>

                      <button
                        id={`video-quicklook-btn-${vid.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoClick(vid);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-cyan-500 dark:hover:text-slate-950 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition shadow-xs"
                        title={isLong ? "Quick Look & AI Bulleted Summary" : "Quick Look: In-app playback"}
                      >
                        {isLong ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Quick Look</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick Look</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick-Look Modal (Allows watching content directly within the app without navigating away) */}
      {selectedVideo && (
        <div 
          id="video-quicklook-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn overflow-y-auto"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="w-full max-w-4xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 shadow-2xl space-y-4 text-left overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Quick Look
                    </span>
                    {isSelectedLongForm && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Long-Form • AI Summary</span>
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {selectedVideo.platform}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1 max-w-md sm:max-w-xl">
                    {selectedVideo.title}
                  </h3>
                </div>
              </div>

              {/* Navigation + Close Button */}
              <div className="flex items-center gap-2">
                {/* Watch on YouTube button in header */}
                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm"
                  title="Watch full video on YouTube in HD"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open on YouTube HD</span>
                </a>

                {filteredVideos.length > 1 && (
                  <div className="hidden sm:flex items-center gap-1 mr-2 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <button
                      id="quicklook-prev-btn"
                      onClick={handlePrevVideo}
                      disabled={currentVideoIndex <= 0}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title="Previous video (Arrow Left)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span>{currentVideoIndex + 1}/{filteredVideos.length}</span>
                    <button
                      id="quicklook-next-btn"
                      onClick={handleNextVideo}
                      disabled={currentVideoIndex >= filteredVideos.length - 1}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title="Next video (Arrow Right)"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  id="video-player-close-btn"
                  onClick={() => setSelectedVideo(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition flex items-center justify-center cursor-pointer"
                  title="Close Quick Look (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Stage (In-App Direct Playback) */}
            <div className="px-6 py-1 space-y-2.5">
              {/* Playback Mode Selector */}
              {embedUrl && selectedVideo.isEmbeddable !== false && (
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                    <button
                      onClick={() => setPlaybackMode('embed')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${playbackMode === 'embed' ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                    >
                      In-App Player
                    </button>
                    <button
                      onClick={() => setPlaybackMode('direct')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${playbackMode === 'direct' ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                    >
                      Direct Stream / HD
                    </button>
                  </div>

                  <a
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-red-500 hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open YouTube App</span>
                  </a>
                </div>
              )}

              <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                {embedUrl && playbackMode === 'embed' && selectedVideo.isEmbeddable !== false ? (
                  embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm') ? (
                    <video key={selectedVideo.url + '-video'} controls autoPlay playsInline className="w-full h-full object-contain">
                      <source src={embedUrl} type="video/mp4" />
                      Your browser does not support HTML5 video streaming.
                    </video>
                  ) : (
                    <iframe
                      key={selectedVideo.url + '-iframe'}
                      src={embedUrl}
                      title={selectedVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  )
                ) : (
                  /* High Definition Direct Multimedia Stream Viewer */
                  <div className="relative w-full h-full flex flex-col justify-between p-6 overflow-hidden">
                    <img 
                      src={selectedVideo.thumbnail} 
                      alt={selectedVideo.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/50" />
                    
                    {/* Top status bar inside simulated player */}
                    <div className="relative z-10 flex items-center justify-between text-xs text-white/90">
                      <span className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 font-mono text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span>{selectedVideo.platform || 'YouTube'} • HD Video Stream</span>
                      </span>
                      <span className="bg-black/70 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 font-mono text-xs">
                        {selectedVideo.duration}
                      </span>
                    </div>

                    {/* Central Playback Display */}
                    <div className="relative z-10 text-center space-y-3.5 my-auto max-w-lg mx-auto">
                      <a
                        href={selectedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-2xl transition-all transform hover:scale-105 cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-white" />
                        <span>Play Video Now in HD</span>
                      </a>
                      
                      <div className="space-y-1">
                        <p className="text-base font-bold text-white line-clamp-2 drop-shadow-md">{selectedVideo.title}</p>
                        <p className="text-xs text-slate-300 font-medium">Channel: {selectedVideo.channel || 'Official Stream'}</p>
                      </div>
                    </div>

                    {/* Bottom stream status & share */}
                    <div className="relative z-10 flex items-center justify-between gap-4 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Verified Active Video</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyLink}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Playback Fallback Callout Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-slate-700 dark:text-slate-300 text-xs">
                    Watch in high definition with zero restrictions on YouTube:
                  </span>
                </div>
                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Watch on YouTube in HD</span>
                </a>
              </div>
            </div>

            {/* AI-Driven Bulleted Video Summary Section (Particularly for Long-Form Results) */}
            <div className="px-6 py-1">
              <div className="rounded-2xl border border-cyan-500/25 bg-slate-50/90 dark:bg-slate-950/70 p-4 transition-all shadow-xs">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      AI Video Summary
                      {isSelectedLongForm && (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Long-Form Key Insights
                        </span>
                      )}
                    </span>
                    {currentSummary?.timeSaved && (
                      <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{currentSummary.timeSaved}</span>
                      </span>
                    )}
                  </div>

                  {/* Action controls */}
                  <div className="flex items-center gap-1.5">
                    {currentSummary && (
                      <>
                        <button
                          id="quicklook-copy-summary-btn"
                          onClick={handleCopySummary}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer"
                          title="Copy bullet points to clipboard"
                        >
                          {copiedSummary ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSummary ? 'Copied' : 'Copy Bullets'}</span>
                        </button>
                        <button
                          id="quicklook-refresh-summary-btn"
                          onClick={() => handleGenerateSummary(selectedVideo, true)}
                          disabled={isSummarizing}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          title="Regenerate Summary"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin text-cyan-500' : ''}`} />
                        </button>
                      </>
                    )}
                    <button
                      id="quicklook-toggle-summary-expand-btn"
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      title={isSummaryExpanded ? "Collapse Summary" : "Expand Summary"}
                    >
                      {isSummaryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Summary Content Body */}
                {isSummaryExpanded && (
                  <div>
                    {isSummarizing ? (
                      <div className="py-4 px-2 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 animate-pulse font-medium">
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          <span>Gemini AI is analyzing long-form video content and extracting concise bulleted insights...</span>
                        </div>
                        <div className="space-y-2 pt-1">
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5 animate-pulse" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full animate-pulse" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-11/12 animate-pulse" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 animate-pulse" />
                        </div>
                      </div>
                    ) : currentSummary ? (
                      <div className="space-y-3 pt-1 text-left">
                        {/* 1-sentence overview summary */}
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal bg-cyan-500/5 border border-cyan-500/15 rounded-xl px-3 py-2">
                          <span className="font-semibold text-cyan-700 dark:text-cyan-300 mr-1.5">Overview:</span>
                          {currentSummary.summary}
                        </p>

                        {/* Bullet points */}
                        <div className="space-y-1.5">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span>Key Discussion & Takeaways</span>
                          </h5>
                          <ul className="space-y-2">
                            {currentSummary.bullets.map((bullet, idx) => {
                              const colonIdx = bullet.indexOf(':');
                              const hasLabel = colonIdx > 0 && colonIdx < 35;
                              const label = hasLabel ? bullet.slice(0, colonIdx) : null;
                              const text = hasLabel ? bullet.slice(colonIdx + 1).trim() : bullet;

                              return (
                                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                                  <div>
                                    {label && (
                                      <strong className="font-semibold text-slate-900 dark:text-white mr-1.5">
                                        {label}:
                                      </strong>
                                    )}
                                    <span>{text}</span>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Key topics chips */}
                        {currentSummary.keyTopics && currentSummary.keyTopics.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Topics:</span>
                            {currentSummary.keyTopics.map((topic, tidx) => (
                              <span 
                                key={tidx}
                                className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800"
                              >
                                #{topic.replace(/^#/, '')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Prompt to generate summary */
                      <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {isSelectedLongForm 
                            ? "This is a long-form video. Generate an instant AI-powered bulleted summary to grasp the key takeaways in 30 seconds."
                            : "Generate a concise AI bulleted summary of this video's key points."}
                        </p>
                        <button
                          id="quicklook-trigger-generate-summary-btn"
                          onClick={() => handleGenerateSummary(selectedVideo)}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto shadow-sm cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate AI Summary</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Metadata & Action Bar */}
            <div className="px-6 pb-5 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">Channel: {selectedVideo.channel || selectedVideo.platform}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{selectedVideo.duration}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {selectedVideo.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  id="quicklook-copy-link-btn"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                  title="Copy video URL"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>

                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  title="Open source website in new tab"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  id="quicklook-close-footer-btn"
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
