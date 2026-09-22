import React, { useEffect, useRef } from 'react';
import { X, ExternalLink, Clock, Film } from 'lucide-react';
import { VideoResultItem } from '../services/api';

interface VideoPlayerModalProps {
  video: VideoResultItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dedicated cleanup function to pause all media and clear video/iframe sources
  const stopAllPlayback = () => {
    if (!containerRef.current) return;

    // Pause and clear all HTML5 video and audio elements
    const mediaElements = containerRef.current.querySelectorAll<HTMLMediaElement>('video, audio');
    mediaElements.forEach((media) => {
      try {
        media.pause();
        media.currentTime = 0;
        media.removeAttribute('src');
        media.load();
      } catch (e) {
        // Ignore potential state errors on unmounted elements
      }
    });

    // Clear iframe src attributes to immediately destroy YouTube and embedded media streams
    const iframes = containerRef.current.querySelectorAll<HTMLIFrameElement>('iframe');
    iframes.forEach((iframe) => {
      try {
        iframe.src = 'about:blank';
      } catch (e) {
        // Ignore iframe access errors
      }
    });
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        stopAllPlayback();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Effect to perform explicit cleanup when the modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopAllPlayback();
    }
    return () => {
      stopAllPlayback();
    };
  }, [isOpen]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !video) return null;

  const handleClose = () => {
    stopAllPlayback();
    onClose();
  };

  // Extract embed URL safely for YouTube and other sources
  const getEmbedUrl = (url: string, thumbnail?: string): string | null => {
    if (!url) return null;
    if (url.includes('youtube.com/results') || url.includes('/results?search_query=')) {
      return null;
    }
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
    if (thumbnail) {
      const thumbMatch = thumbnail.match(/\/vi\/([a-zA-Z0-9_-]{11})\//i);
      if (thumbMatch && thumbMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${thumbMatch[1]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
      }
    }
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
      return url;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(video.url, video.thumbnail);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center space-x-3 truncate mr-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex-shrink-0">
              <Film className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-semibold text-neutral-100 truncate">
                {video.title}
              </h3>
              <p className="text-xs text-neutral-400 flex items-center space-x-2">
                <span>{video.platform || video.channel || 'YouTube'}</span>
                {video.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {video.duration}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {video.url && (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
                title="Open original video source"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player / Embed Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl && embedUrl.includes('embed') ? (
            <iframe
              key={video.url}
              src={embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : embedUrl && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(embedUrl) ? (
            <video
              key={video.url}
              src={embedUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <iframe
              key={video.url}
              src={embedUrl || video.url}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Footer Description */}
        {video.description && (
          <div className="p-4 sm:p-5 bg-neutral-900/90 border-t border-neutral-800 text-xs sm:text-sm text-neutral-300 overflow-y-auto max-h-32">
            <p className="font-medium text-neutral-200 mb-1">About this video:</p>
            <p className="text-neutral-400 leading-relaxed">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
