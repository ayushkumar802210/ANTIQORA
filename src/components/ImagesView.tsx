import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageResultItem, fetchPaginatedImages } from '../services/api';
import { 
  Search, 
  ExternalLink, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  BadgeCheck, 
  Loader2,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface ImagesViewProps {
  initialQuery?: string;
  images?: ImageResultItem[];
  isLoading?: boolean;
}

export const ImagesView: React.FC<ImagesViewProps> = ({ 
  initialQuery = '', 
  images: initialImages = [],
  isLoading: initialLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  
  // Image state
  const [imageList, setImageList] = useState<ImageResultItem[]>(initialImages);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Failed images tracking for graceful removal
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  // Lightbox Modal State
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialImages && initialImages.length > 0 && page === 1) {
      setImageList(initialImages);
      setHasMore(initialImages.length >= 6);
    }
  }, [initialImages]);

  // Execute primary search query
  const executeSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    setActiveQuery(trimmed);
    setPage(1);
    setErrorMessage(null);
    setFailedImageIds(new Set());

    if (!trimmed) {
      setImageList([]);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchPaginatedImages(trimmed, 1);
      if (response.results) {
        setImageList(response.results);
        setHasMore(response.hasMore);
        setNextPageToken(response.nextPageToken);
      } else {
        setImageList([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Image search error:", err);
      setErrorMessage("Images are temporarily unavailable.");
      setImageList([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Next Page (Pagination)
  const fetchNextPage = useCallback(async () => {
    if (isFetchingMore || !hasMore || !activeQuery.trim() || isLoading) return;

    setIsFetchingMore(true);
    const nextPage = page + 1;

    try {
      const response = await fetchPaginatedImages(activeQuery, nextPage, nextPageToken);
      if (response.results && response.results.length > 0) {
        setImageList(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const existingUrls = new Set(prev.map(i => (i.imageUrl || i.url || '').toLowerCase()));
          
          const newItems = response.results.filter(item => {
            const urlKey = (item.imageUrl || item.url || '').toLowerCase();
            return !existingIds.has(item.id) && !existingUrls.has(urlKey);
          });

          return [...prev, ...newItems];
        });

        setPage(nextPage);
        setHasMore(response.hasMore);
        setNextPageToken(response.nextPageToken);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching more images:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasMore, activeQuery, isLoading, page, nextPageToken]);

  // Infinite Scroll Hook (~80% depth)
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isFetchingMore || isLoading) return;
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if ((scrollTop + clientHeight) / scrollHeight >= 0.8) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetchingMore, isLoading, fetchNextPage]);

  // Handle Keyword Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchTerm);
  };

  // Filter out images that failed to load
  const validImages = imageList.filter(img => !failedImageIds.has(img.id));

  // Lightbox Navigation
  const activeImage = activeImageIndex !== null ? validImages[activeImageIndex] : null;

  const handlePrevImage = useCallback(() => {
    if (activeImageIndex === null) return;
    setActiveImageIndex(prev => (prev! > 0 ? prev! - 1 : validImages.length - 1));
  }, [activeImageIndex, validImages.length]);

  const handleNextImage = useCallback(() => {
    if (activeImageIndex === null) return;
    setActiveImageIndex(prev => (prev! < validImages.length - 1 ? prev! + 1 : 0));
  }, [activeImageIndex, validImages.length]);

  // Keyboard Navigation for Viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') setActiveImageIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, handlePrevImage, handleNextImage]);

  // Touch Swipe for Mobile Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNextImage(); // Swipe left -> Next
      } else {
        handlePrevImage(); // Swipe right -> Prev
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500">
                <ImageIcon className="w-5 h-5" />
              </span>
              <span>Image Search Gallery</span>
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-3 h-3" />
              Multi-Provider
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            High-resolution photography, official press stills, diagrams, and open media.
          </p>
        </div>

        {/* Dynamic Counter & Keyword Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {validImages.length > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-center sm:text-left">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{validImages.length}</span> results
            </div>
          )}

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search high-res images..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-sm"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </form>
        </div>
      </div>

      {/* Error Banner State */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && validImages.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && validImages.length === 0 && activeQuery && (
        <div className="text-center py-16 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No relevant images found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for broader keywords, product names, or landmarks.
          </p>
        </div>
      )}

      {/* Image Gallery Grid (Mobile: 2 cols, Desktop: Masonry/Grid) */}
      {validImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {validImages.map((img, index) => {
            const displayUrl = img.thumbnailUrl || img.imageUrl || img.url;
            const title = img.title || 'Image Result';
            const sourceName = img.sourceName || img.domain || 'Source';
            const isOfficial = img.isOfficial;

            return (
              <div
                key={`${img.id}-${index}`}
                onClick={() => setActiveImageIndex(index)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Aspect Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src={displayUrl}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => {
                      setFailedImageIds(prev => new Set(prev).add(img.id));
                    }}
                  />

                  {/* Official Source Badge Overlay */}
                  {isOfficial && (
                    <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white shadow-md backdrop-blur-sm">
                      <BadgeCheck className="w-3 h-3" />
                      Official
                    </span>
                  )}

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-xs font-semibold text-slate-900 dark:text-white shadow-lg backdrop-blur-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Preview
                    </span>
                  </div>
                </div>

                {/* Card Content Footer */}
                <div className="p-3 space-y-1 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {title}
                  </p>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <span className="truncate max-w-[110px] text-slate-500 dark:text-slate-400">{sourceName}</span>
                    {img.width && img.height && (
                      <span className="text-[10px] opacity-75">{img.width}x{img.height}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Load More Controls */}
      {hasMore && validImages.length > 0 && (
        <div className="pt-6 pb-8 flex flex-col items-center justify-center space-y-3">
          <button
            onClick={fetchNextPage}
            disabled={isFetchingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm disabled:opacity-50"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                <span>Fetching more images...</span>
              </>
            ) : (
              <span>Load More Images</span>
            )}
          </button>
          
          <p className="text-[11px] text-slate-400">
            Scroll down or tap to retrieve additional verified providers.
          </p>
        </div>
      )}

      {/* Full-Screen Image Lightbox / Viewer Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn"
          onClick={() => setActiveImageIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center space-x-3 truncate mr-4">
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                      {activeImage.title || 'Image Preview'}
                    </h3>
                    {activeImage.isOfficial && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <BadgeCheck className="w-3 h-3" />
                        Official
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>Source: {activeImage.sourceName || activeImage.domain || 'External Website'}</span>
                    {activeImage.width && activeImage.height && (
                      <>
                        <span>•</span>
                        <span>{activeImage.width} × {activeImage.height} px</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {(activeImage.sourceUrl || activeImage.imageUrl || activeImage.url) && (
                  <a
                    href={activeImage.sourceUrl || activeImage.imageUrl || activeImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setActiveImageIndex(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  aria-label="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Display Stage */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-2 sm:p-4 min-h-[300px] max-h-[70vh]">
              <img
                src={activeImage.imageUrl || activeImage.url}
                alt={activeImage.title || 'Full Preview'}
                className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-xl"
              />

              {/* Prev Button */}
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-lg transition"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-lg transition"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-md">
                {activeImage.caption || `Photograph indexed for "${activeQuery}"`}
              </span>
              <span className="flex-shrink-0 text-[11px] text-slate-500">
                {activeImageIndex! + 1} of {validImages.length}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
