import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  Laptop, 
  Apple, 
  Check, 
  Star, 
  Download, 
  Info,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  ShieldAlert
} from 'lucide-react';
import { UniversalAppRecord } from '../services/app-discovery/types';

interface UniversalAppCardProps {
  app: UniversalAppRecord;
  isHero?: boolean;
  onSelectCategory?: (category: string) => void;
}

export const UniversalAppCard: React.FC<UniversalAppCardProps> = ({ 
  app, 
  isHero = false,
  onSelectCategory 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = app.officialWebsite || app.androidUrl || app.iosUrl || window.location.href;
    const shareData = {
      title: app.name,
      text: `${app.name} — ${app.description}`,
      url: url,
    };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isVerified = app.verificationStatus === 'verified' && !!app.officialWebsite;
  const isFlagged = app.verificationStatus === 'flagged';
  const hasOfficialWebsite = Boolean(app.officialWebsite);

  const hasAndroid = Boolean(app.androidUrl || app.platforms.includes('Android'));
  const hasIos = Boolean(app.iosUrl || app.platforms.includes('iOS'));
  const hasWindows = Boolean(app.windowsUrl || app.platforms.includes('Windows'));
  const hasWeb = Boolean(app.webUrl || (hasOfficialWebsite && app.platforms.includes('Web')));

  return (
    <div 
      id={`app-card-${app.id}`}
      className={`rounded-2xl border transition-all ${
        isHero 
          ? 'bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-900 dark:to-slate-900/90 border-blue-500/30 dark:border-blue-500/30 shadow-md ring-1 ring-blue-500/10' 
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
      } p-5 sm:p-6`}
    >
      {/* Top Bar: Verification, Category & Rating */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Official Developer Property</span>
            </span>
          ) : isFlagged ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Suspicious / Unverified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Official website could not be verified</span>
            </span>
          )}

          {app.isIndianPriority && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              🇮🇳 India Focus
            </span>
          )}
        </div>

        {/* Rating & Downloads */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {app.rating && (
            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{app.rating}</span>
              {app.reviewsCount && <span className="text-slate-400 font-normal">({app.reviewsCount})</span>}
            </span>
          )}
          {app.downloads && (
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-500">
              <Download className="w-3 h-3" />
              <span>{app.downloads}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main App Header: Logo, Name, Developer, Category */}
      <div className="flex items-start gap-4">
        {/* App Logo */}
        <div className="shrink-0">
          {app.logo ? (
            <img 
              src={app.logo} 
              alt={app.name} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to placeholder styling
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
              {app.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Title, Developer & Category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {app.name}
            </h3>
            {app.price && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {app.price}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
            {app.developer}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => onSelectCategory && onSelectCategory(app.category)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{app.category}</span>
            </button>
            {app.confidence && (
              <span className="text-[11px] text-slate-400">
                • {Math.round(app.confidence * 100)}% confidence
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-3.5 leading-relaxed line-clamp-2">
        {app.description}
      </p>

      {/* Safety Warning (if official website could not be verified or was blocked) */}
      {!isVerified && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Official website could not be verified:</span> We do not link unverified domains or third-party APK mirrors as official download sources to protect you from spoofing or malware.
          </div>
        </div>
      )}

      {/* Platform Checklist as specified in Point 9 */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
          Availability Matrix
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Official Website */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
            hasOfficialWebsite && isVerified
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <Check className={`w-3.5 h-3.5 ${hasOfficialWebsite && isVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Official Website</span>
          </span>

          {/* Android */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
            hasAndroid
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <Check className={`w-3.5 h-3.5 ${hasAndroid ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Android</span>
          </span>

          {/* iPhone */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
            hasIos
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <Check className={`w-3.5 h-3.5 ${hasIos ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>iPhone / iOS</span>
          </span>

          {/* Web */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
            hasWeb
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <Check className={`w-3.5 h-3.5 ${hasWeb ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Web</span>
          </span>

          {/* Windows */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${
            hasWindows
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800'
          }`}>
            <Check className={`w-3.5 h-3.5 ${hasWindows ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Windows</span>
          </span>
        </div>
      </div>

      {/* Action Buttons: If a platform is not available, hide its button */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Open Official Website Button */}
          {hasOfficialWebsite && isVerified && (
            <a
              id={`btn-official-website-${app.id}`}
              href={app.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Open Official Website</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}

          {/* 2. Open Android Button */}
          {app.androidUrl && (
            <a
              id={`btn-android-${app.id}`}
              href={app.androidUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Open Android</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          {/* 3. Open iPhone Button */}
          {app.iosUrl && (
            <a
              id={`btn-iphone-${app.id}`}
              href={app.iosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Apple className="w-4 h-4 text-slate-900 dark:text-white" />
              <span>Open iPhone</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          {/* 4. Open Web Button */}
          {app.webUrl && (
            <a
              id={`btn-web-${app.id}`}
              href={app.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Laptop className="w-4 h-4 text-sky-600" />
              <span>Open Web</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          {/* Windows Download / Store */}
          {app.windowsUrl && (
            <a
              id={`btn-windows-${app.id}`}
              href={app.windowsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Laptop className="w-4 h-4 text-blue-500" />
              <span>Open Windows</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>

        {/* Share & More Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            id={`btn-share-${app.id}`}
            onClick={handleShare}
            title="Copy Link"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          
          <button
            id={`btn-toggle-details-${app.id}`}
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>{showDetails ? 'Less' : 'More'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Deep Metadata Drawer */}
      {showDetails && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2.5 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Developer: </span>
              <span>{app.developer}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Verification: </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {app.verificationMethod || 'Cross-Store Authoritative Audit'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Supported Languages: </span>
              <span>{(app.languageSupport || ['English']).join(', ')}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Last Verified: </span>
              <span>{new Date(app.lastVerified).toLocaleDateString()}</span>
            </div>
          </div>
          {app.sourceOrigin && (
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700/60">
              Source: {app.sourceOrigin}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
