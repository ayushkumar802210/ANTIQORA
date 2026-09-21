import React, { useState } from 'react';
import { 
  OfficialWebsiteResult, 
  AppResult, 
  QueryIntentResult 
} from '../types';
import { 
  Globe, 
  ExternalLink, 
  Bookmark, 
  Check, 
  Link2, 
  Share2,
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  Laptop, 
  Apple, 
  Star, 
  Layers, 
  ChevronRight,
  Info
} from 'lucide-react';

interface OfficialDiscoveryCardsProps {
  intentResult: QueryIntentResult | null;
  onSaveWebsite?: (item: any) => void;
  onSaveApp?: (item: any) => void;
  savedItemIds: string[];
  onOpenPreview?: (title: string, url: string, domain: string, description: string) => void;
  filterMode?: 'all' | 'websites' | 'apps';
}

export const OfficialDiscoveryCards: React.FC<OfficialDiscoveryCardsProps> = ({
  intentResult,
  onSaveWebsite,
  onSaveApp,
  savedItemIds,
  onOpenPreview,
  filterMode = 'all'
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!intentResult) return null;

  const { officialWebsite, officialApp, alternateMatches, intent } = intentResult;

  if (!officialWebsite && !officialApp && (!alternateMatches || alternateMatches.length === 0)) {
    return null;
  }

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => {
      setCopiedLink((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const handleShare = async (title: string, url: string, description?: string, id?: string) => {
    const shareData = {
      title,
      text: description ? `${title} — ${description.slice(0, 140)}...` : title,
      url,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        if (id) {
          setCopiedLink(id);
          setTimeout(() => setCopiedLink((curr) => (curr === id ? null : curr)), 2000);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopy(url, id || 'share');
        }
      }
    } else {
      handleCopy(url, id || 'share');
    }
  };

  const showWebsite = filterMode === 'all' || filterMode === 'websites';
  const showApp = filterMode === 'all' || filterMode === 'apps';

  return (
    <div className="space-y-4 mb-6">
      
      {/* Header Intent Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Digital Discovery</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {intent === 'app' ? 'Verified App & Platform' : 'Verified Official Property'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Domain Verification: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Authoritative Registry</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* 1. Official Website Result Card */}
        {showWebsite && officialWebsite && (
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-white to-cyan-500/[0.02] dark:from-slate-900/90 dark:to-cyan-950/[0.15] p-5 sm:p-6 shadow-lg shadow-cyan-500/[0.03] space-y-4 transition-all">
            
            {/* Top row: Icon, Name, Official Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {officialWebsite.icon ? (
                  <img 
                    src={officialWebsite.icon} 
                    alt={officialWebsite.name} 
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Globe className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {officialWebsite.name}
                    </h3>
                    {officialWebsite.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                        <span>Official Website</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Unverified Match</span>
                      </span>
                    )}
                  </div>

                  {/* Clean Domain */}
                  <p className="text-xs font-mono font-medium text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {officialWebsite.domain}
                  </p>
                </div>
              </div>

              {/* Save & Copy Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleShare(officialWebsite.name || officialWebsite.title, officialWebsite.url, officialWebsite.description, officialWebsite.id)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                  title="Share official website"
                  aria-label="Share official website"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopy(officialWebsite.url, officialWebsite.id)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 transition"
                  title={copiedLink === officialWebsite.id ? "Copied!" : "Copy official URL"}
                  aria-label="Copy official URL"
                >
                  {copiedLink === officialWebsite.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </button>

                {onSaveWebsite && (
                  <button
                    onClick={() => onSaveWebsite({
                      id: officialWebsite.id,
                      title: officialWebsite.title,
                      url: officialWebsite.url,
                      domain: officialWebsite.domain,
                      type: 'website',
                      savedAt: new Date().toISOString()
                    })}
                    className={`p-2 rounded-xl border transition ${
                      savedItemIds.includes(officialWebsite.id)
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title={savedItemIds.includes(officialWebsite.id) ? "Saved to bookmarks" : "Save website"}
                    aria-label="Save website bookmark"
                  >
                    {savedItemIds.includes(officialWebsite.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {officialWebsite.description}
            </p>

            {/* Verification Note or Safety Warning */}
            {officialWebsite.safetyWarning ? (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <span>{officialWebsite.safetyWarning}</span>
              </div>
            ) : officialWebsite.verificationReason && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{officialWebsite.verificationReason}</span>
              </div>
            )}

            {/* Open Website Main Button */}
            <div className="pt-1">
              <a
                href={officialWebsite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition"
              >
                <span>Open Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Sub-destinations: Login, Help, Business */}
            {officialWebsite.subDestinations && officialWebsite.subDestinations.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Related Official Portals
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {officialWebsite.subDestinations.map((sub, idx) => (
                    <a
                      key={idx}
                      href={sub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-cyan-500/40 hover:bg-cyan-500/[0.04] transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate">
                          {sub.title}
                        </p>
                        {sub.description && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {sub.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* 2. Official App Result Card */}
        {showApp && officialApp && (
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-white to-indigo-500/[0.02] dark:from-slate-900/90 dark:to-indigo-950/[0.15] p-5 sm:p-6 shadow-lg shadow-indigo-500/[0.03] space-y-4 transition-all">
            
            {/* Top row: App Icon, Name, Developer, Official Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {officialApp.icon ? (
                  <img 
                    src={officialApp.icon} 
                    alt={officialApp.name} 
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {officialApp.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                      <Check className="w-3 h-3" />
                      <span>{officialApp.verificationBadge}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    By <span className="font-semibold text-slate-700 dark:text-slate-300">{officialApp.developer}</span>
                  </p>
                </div>
              </div>

              {/* Share & Save App Bookmark */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleShare(
                    officialApp.name,
                    officialApp.platforms.android?.storeUrl || officialApp.platforms.ios?.storeUrl || window.location.href,
                    officialApp.description,
                    officialApp.id
                  )}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition"
                  title="Share official app"
                  aria-label="Share official app"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {onSaveApp && (
                  <button
                    onClick={() => onSaveApp({
                      id: officialApp.id,
                      title: `${officialApp.name} (Official App)`,
                      url: officialApp.platforms.android?.storeUrl || officialApp.platforms.ios?.storeUrl || '#',
                      domain: 'appstore',
                      type: 'app',
                      savedAt: new Date().toISOString()
                    })}
                    className={`p-2 rounded-xl border transition ${
                      savedItemIds.includes(officialApp.id)
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title={savedItemIds.includes(officialApp.id) ? "Saved to bookmarks" : "Save app"}
                    aria-label="Save app bookmark"
                  >
                    {savedItemIds.includes(officialApp.id) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Platform Badges, Rating & Category */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {officialApp.rating && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{officialApp.rating}</span>
                  {officialApp.reviewsCount && (
                    <span className="text-slate-400 font-normal">({officialApp.reviewsCount})</span>
                  )}
                </div>
              )}

              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-400">
                {officialApp.category}
              </span>

              {officialApp.downloads && (
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-400">
                  {officialApp.downloads}
                </span>
              )}
            </div>

            {/* Supported Platforms Tags */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Platforms:</span>
              {officialApp.platforms.android?.supported && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                  <Smartphone className="w-3 h-3" /> Android
                </span>
              )}
              {officialApp.platforms.ios?.supported && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-medium border border-sky-500/20">
                  <Apple className="w-3 h-3" /> iOS
                </span>
              )}
              {officialApp.platforms.web?.supported && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-medium border border-cyan-500/20">
                  <Globe className="w-3 h-3" /> Web App
                </span>
              )}
              {officialApp.platforms.desktop?.supported && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-medium border border-purple-500/20">
                  <Laptop className="w-3 h-3" /> Desktop
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {officialApp.description}
            </p>

            {/* Store Action Buttons: ONLY show buttons for platforms that actually exist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              {officialApp.platforms.android?.supported && (
                <a
                  href={officialApp.platforms.android.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Play</span>
                </a>
              )}

              {officialApp.platforms.ios?.supported && (
                <a
                  href={officialApp.platforms.ios.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  <Apple className="w-3.5 h-3.5 text-sky-400" />
                  <span>App Store</span>
                </a>
              )}

              {officialApp.platforms.web?.supported && (
                <a
                  href={officialApp.platforms.web.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-500 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Open Web Version</span>
                </a>
              )}

              {officialApp.platforms.desktop?.supported && (
                <a
                  href={officialApp.platforms.desktop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-purple-500 hover:text-purple-400 transition"
                >
                  <Laptop className="w-3.5 h-3.5 text-purple-400" />
                  <span>Desktop App</span>
                </a>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Safety Against Fake Websites & Similar Domains */}
      {alternateMatches && alternateMatches.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Possible Similar Matches & Domain Safety Warning</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ANTIQORA verified the official property above. The following domains have similar names or query patterns but are <strong>NOT verified official websites</strong>:
          </p>
          <div className="space-y-1.5">
            {alternateMatches.map(alt => (
              <div 
                key={alt.id}
                className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-amber-500/20 bg-white/80 dark:bg-slate-900/60 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{alt.name}</span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">{alt.domain}</span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Unverified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{alt.description}</p>
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                  Caution advised
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
