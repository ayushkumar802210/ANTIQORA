import React, { useState } from 'react';
import { 
  PersonEntity, 
  PersonSocialProfile, 
  PersonPhotoItem, 
  PersonVideoItem, 
  PersonNewsItem, 
  PersonDisambiguationOption 
} from '../../services/entityResolution/types';
import { 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  Instagram, 
  Twitter, 
  Youtube, 
  Facebook, 
  Linkedin, 
  Sparkles, 
  Trophy, 
  Film, 
  Building2, 
  Landmark, 
  Music, 
  Calendar, 
  Newspaper, 
  Video, 
  Image as ImageIcon, 
  Share2, 
  ShieldCheck, 
  ChevronRight, 
  UserCheck, 
  AlertCircle
} from 'lucide-react';

interface PersonKnowledgePanelProps {
  entity: PersonEntity;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  onSelectDisambiguation?: (entityId: string, name: string) => void;
}

export const PersonKnowledgePanel: React.FC<PersonKnowledgePanelProps> = ({
  entity,
  activeTab = 'all',
  onSelectTab,
  onSelectDisambiguation
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedMediaTab, setSelectedMediaTab] = useState<'overview' | 'news' | 'photos' | 'videos' | 'social' | 'bio'>('overview');

  if (!entity) return null;

  // Render Disambiguation View if name matches multiple people
  if (entity.isDisambiguationRequired && entity.disambiguationOptions) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-6 shadow-lg mb-8 space-y-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Multiple Public Figures Found</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Search query matches multiple verified entities. Please select the specific person you wish to view:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {entity.disambiguationOptions.map((option: PersonDisambiguationOption) => (
            <button
              key={option.entityId}
              onClick={() => onSelectDisambiguation?.(option.entityId, option.name)}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-left transition group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 font-bold text-sm">
                {option.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition flex items-center gap-1">
                  <span>{option.name}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {option.profession}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case 'x': return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
      case 'youtube': return <Youtube className="w-3.5 h-3.5 text-red-500" />;
      case 'facebook': return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      case 'linkedin': return <Linkedin className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full space-y-6 mb-8">
      {/* 1. Main Knowledge Panel Header Card */}
      <div className="rounded-2xl border border-cyan-500/20 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-md dark:shadow-2xl relative overflow-hidden">
        {/* Subtle Background Radial Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Profile Avatar / Photo */}
          <div className="relative shrink-0">
            {entity.profilePhoto ? (
              <img 
                src={entity.profilePhoto} 
                alt={entity.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-md bg-slate-100 dark:bg-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-extrabold text-2xl sm:text-3xl shadow-inner">
                {entity.fullName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-md" title="Verified Entity">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* Name & Primary Meta */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Universal Entity Index
              </span>
              {entity.country && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  📍 {entity.country}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{entity.fullName}</span>
              <CheckCircle2 className="w-5 h-5 text-cyan-500 fill-cyan-500/20 shrink-0" />
            </h1>

            <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              {entity.profession}
              {entity.organizationTeamCompany && ` • ${entity.organizationTeamCompany}`}
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 pt-1">
              {entity.shortDescription}
            </p>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            {entity.officialWebsite && (
              <a
                href={entity.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition shadow-xs"
              >
                <span>Official Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition"
              title="Share Entity"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Verified Social Profiles Bar */}
        {entity.socialProfiles && entity.socialProfiles.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Verified Social Profiles & Official Handles
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {entity.socialProfiles.map((profile: PersonSocialProfile) => (
                <a
                  key={profile.id}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-cyan-500/40 text-xs transition shrink-0 group"
                >
                  {getPlatformIcon(profile.platform)}
                  <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-cyan-500 transition">
                    {profile.handle}
                  </span>
                  {profile.verificationBadge === 'verified' ? (
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-500/10 px-1 py-0.2 rounded">
                      Unconfirmed
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Category-Specific Data Modules */}
      {/* Sports / Athlete Data */}
      {entity.primaryCategory === 'sports' && entity.sportsData && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Career Statistics & Match Record</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {entity.sportsData.sport} {entity.sportsData.position ? `• ${entity.sportsData.position}` : ''}
            </span>
          </div>

          {/* Stats Grid */}
          {entity.sportsData.stats && entity.sportsData.stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {entity.sportsData.stats.map((stat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{stat.label}</span>
                  <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Highlights */}
          {entity.sportsData.careerHighlights && entity.sportsData.careerHighlights.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Key Milestones</span>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                {entity.sportsData.careerHighlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Entertainment / Actor Data */}
      {entity.primaryCategory === 'entertainment' && entity.entertainmentData && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Film className="w-4 h-4 text-purple-400" />
            <span>Notable Filmography & Achievements</span>
          </h3>
          {entity.entertainmentData.topMoviesSeries && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {entity.entertainmentData.topMoviesSeries.map((movie, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{movie.title}</span>
                    {movie.role && <span className="text-slate-500 text-[11px] block">Role: {movie.role}</span>}
                  </div>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-bold">{movie.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Politics / Public Official */}
      {entity.primaryCategory === 'politics' && entity.politicianData && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-500" />
            <span>Public Office & Governance</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Office</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{entity.politicianData.currentOffice || 'Public Official'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Political Affiliation</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{entity.politicianData.politicalParty || 'Independent / State'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Business / Entrepreneur */}
      {entity.primaryCategory === 'business' && entity.businessData && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Corporate Leadership & Ventures</span>
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {entity.businessData.role} at <span className="font-bold text-cyan-500">{entity.businessData.company}</span>
          </p>
        </div>
      )}

      {/* 4. Sub-Navigation Tabs: Media, News, Videos, Timeline */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setSelectedMediaTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition ${selectedMediaTab === 'overview' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Overview
          </button>
          {entity.news && entity.news.length > 0 && (
            <button
              onClick={() => setSelectedMediaTab('news')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${selectedMediaTab === 'news' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Latest News ({entity.news.length})</span>
            </button>
          )}
          {entity.videos && entity.videos.length > 0 && (
            <button
              onClick={() => setSelectedMediaTab('videos')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${selectedMediaTab === 'videos' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos & Interviews ({entity.videos.length})</span>
            </button>
          )}
          {entity.photos && entity.photos.length > 0 && (
            <button
              onClick={() => setSelectedMediaTab('photos')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${selectedMediaTab === 'photos' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({entity.photos.length})</span>
            </button>
          )}
        </div>

        {/* Real News Grid */}
        {(selectedMediaTab === 'overview' || selectedMediaTab === 'news') && entity.news && entity.news.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Newspaper className="w-3.5 h-3.5 text-cyan-500" />
              <span>Real-time Verified News</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entity.news.map((item: PersonNewsItem) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-cyan-500/40 transition group space-y-2 block"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{item.publisher}</span>
                    <span className="text-slate-400">{item.date}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition line-clamp-2">
                    {item.headline}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.snippet}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Real Video Cards */}
        {(selectedMediaTab === 'overview' || selectedMediaTab === 'videos') && entity.videos && entity.videos.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-red-500" />
              <span>Official Channels & Interviews</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entity.videos.map((vid: PersonVideoItem) => (
                <a
                  key={vid.id}
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-red-500/40 transition group flex gap-3 items-center"
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                    <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    {vid.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 py-0.2 rounded font-bold">
                        {vid.duration}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-400 transition line-clamp-2">
                      {vid.title}
                    </h5>
                    <p className="text-[10px] text-slate-500">{vid.channel}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Photos Gallery */}
        {(selectedMediaTab === 'overview' || selectedMediaTab === 'photos') && entity.photos && entity.photos.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Commons Gallery</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {entity.photos.map((photo: PersonPhotoItem) => (
                <a
                  key={photo.id}
                  href={photo.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group block bg-slate-100 dark:bg-slate-950"
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-36 object-cover group-hover:scale-105 transition" />
                  <div className="p-2 text-[10px] text-slate-500 truncate">
                    {photo.title}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
