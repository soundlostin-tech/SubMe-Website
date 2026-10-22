import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2,
  Radio,
  Coins,
  ShieldCheck,
  Zap, 
  Play, 
  Tv, 
  Sparkles,
  Heart
} from 'lucide-react';
import { Campaign, UserProfile, FeaturedCreatorBanner } from '../types';
import { FEATURED_CREATORS, FEATURED_SHORTS } from '../data/mockData';
import { isTaskExpired } from '../utils/campaignHelper';

const YouTubeShortsIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.94c-1.84.96-2.53 3.23-1.56 5.06 1 1.87 3.27 2.54 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zM10 14.65v-5.3L15 12l-5 2.65z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

interface HomeViewProps {
  onNavigate: (tabId: string) => void;
  onSelectCampaign: (campaign: Campaign) => void;
  user: UserProfile;
  campaigns: Campaign[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectCampaign,
  user,
  campaigns,
}) => {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Auto-advance banner every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % FEATURED_CREATORS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const currentFeatured = FEATURED_CREATORS[activeBannerIndex];

  const handleOpenFeaturedCampaign = (creator: FeaturedCreatorBanner) => {
    const matchedCamp = filteredCampaigns.find(
      (c) => c.id === creator.campaignId || c.channelName.toLowerCase().includes(creator.name.toLowerCase())
    );
    if (matchedCamp) {
      onSelectCampaign(matchedCamp);
    } else if (filteredCampaigns.length > 0) {
      onSelectCampaign(filteredCampaigns[0]);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (c.status === 'completed' || c.status === 'expired' || isTaskExpired(c)) return false;
    if (user?.completedCampaignIds?.includes(c.id)) return false;
    if (user?.subscribedChannelIds?.includes(c.channelId)) return false;
    return true;
  });

  // VIP priority: VIP tasks appear at the very top!
  filteredCampaigns.sort((a, b) => {
    const aVip = a.isVip ? 1 : 0;
    const bVip = b.isVip ? 1 : 0;
    if (bVip !== aVip) return bVip - aVip;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const availableShortsAndReels = [
    ...campaigns.filter(c => (c.isShort || c.platform === 'instagram') && c.status !== 'completed' && c.status !== 'expired' && !isTaskExpired(c)),
    ...FEATURED_SHORTS,
  ].filter((item, index, self) => 
    self.findIndex(t => t.id === item.id) === index &&
    !user?.completedCampaignIds?.includes(item.id) &&
    !user?.subscribedChannelIds?.includes(item.channelId) &&
    !isTaskExpired(item)
  );

  availableShortsAndReels.sort((a, b) => {
    const aVip = a.isVip ? 1 : 0;
    const bVip = b.isVip ? 1 : 0;
    if (bVip !== aVip) return bVip - aVip;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] text-deep-ocean dark:text-slate-100 min-h-full transition-colors max-w-7xl mx-auto">
      
      {/* 1. Header Bar: Matching Reference Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-deep-ocean dark:text-slate-100">
              Creator Command Center
            </h1>
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
              1 BUG = ₹1 INR
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time creator tasks, verified watch attention, and instant liquid settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('create-task')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Task</span>
          </button>

          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D28] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-subtle transition-colors cursor-pointer active:scale-95"
          >
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <span>All Tasks ({campaigns.length})</span>
          </button>
        </div>
      </div>


      {/* 3. CINEMATIC HERO SPOTLIGHT: 16:9 Aspect Ratio with Reference-Grade Scrim */}
      <div 
        onClick={() => handleOpenFeaturedCampaign(currentFeatured)}
        className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video group cursor-pointer shadow-card"
      >
        <img
          src={`https://img.youtube.com/vi/${currentFeatured.youtubeId}/maxresdefault.jpg`}
          onError={(e) => {
            e.currentTarget.src = `https://img.youtube.com/vi/${currentFeatured.youtubeId}/hqdefault.jpg`;
          }}
          alt={currentFeatured.name}
          className="w-full h-full object-cover object-center group-hover:scale-101 transition-transform duration-500"
        />

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

        {/* Editorial Content Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end pointer-events-none">
          <div className="space-y-2 max-w-2xl">
            {/* Creator Attribution */}
            <div className="flex items-center gap-2.5">
              <img
                src={currentFeatured.avatar}
                alt={currentFeatured.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/40 shadow-sm"
              />
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  {currentFeatured.channelName}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C7DFA3] shrink-0" />
                <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">
                  &bull; {currentFeatured.subscribers} Subscribers
                </span>
              </div>
            </div>

            {/* Video Headline */}
            <h2 className="text-sm sm:text-lg md:text-xl font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
              {currentFeatured.tagline}
            </h2>

            {/* Reward & Watch CTA Row */}
            <div className="pt-1 flex flex-wrap items-center gap-2 pointer-events-auto">
              <span className="px-3 py-1 rounded-md bg-black/85 backdrop-blur-md text-[#C7DFA3] border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>+{currentFeatured.rewardBugs} BUGs (₹{currentFeatured.rewardBugs})</span>
              </span>

              <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-slate-300 border border-white/20 text-xs font-mono">
                {currentFeatured.watchDurationSec === 180 ? '3 Min Watch Time' : `${currentFeatured.watchDurationSec}s Watch Time`}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenFeaturedCampaign(currentFeatured);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-deep-ocean hover:bg-deep-ocean-dark text-white font-semibold text-xs shadow-subtle transition-all active:scale-95 cursor-pointer ml-auto sm:ml-0"
              >
                <Play className="w-3 h-3 fill-current text-white" />
                <span>Start Watch Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Prev/Next Navigation Controls */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveBannerIndex((prev) => (prev === 0 ? FEATURED_CREATORS.length - 1 : prev - 1));
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/70 hover:bg-black text-slate-200 flex items-center justify-center border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg z-10"
          title="Previous Featured Video"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveBannerIndex((prev) => (prev + 1) % FEATURED_CREATORS.length);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-black/70 hover:bg-black text-slate-200 flex items-center justify-center border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg z-10"
          title="Next Featured Video"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="font-mono text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
            {activeBannerIndex + 1} / {FEATURED_CREATORS.length}
          </span>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN DASHBOARD COMPOSITION (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Curated Tasks & Feed */}
        <div className="lg:col-span-8 space-y-5">
          
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            
            {/* Header: Curated Watch Tasks */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-deep-ocean dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-slate-400" />
                  <span>Curated Watch Tasks</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Watch video, pass 1 attention question, and claim BUGs immediately.
                </p>
              </div>

              <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-50 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto">
                {filteredCampaigns.length} Active Tasks
              </span>
            </div>

            {/* Task Row Items */}
            <div className="space-y-2.5">
              {filteredCampaigns.slice(0, 7).map((camp) => {
                const progressPercent = Math.min(100, Math.round((camp.currentProgress / camp.targetSubscribers) * 100));
                return (
                  <div
                    key={camp.id}
                    onClick={() => onSelectCampaign(camp)}
                    className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#0E1620] hover:bg-slate-50/80 dark:hover:bg-[#16222F] border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-subtle"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Card Thumbnail: 9:16 for Shorts/Reels, 16:9 for Widescreen */}
                      <div className={`relative ${camp.isShort || camp.platform === 'instagram' ? 'w-10 h-16 aspect-[9/16]' : 'w-16 h-10 aspect-video'} rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-200 dark:border-slate-800`}>
                        <img
                          src={camp.thumbnailUrl || (camp.youtubeId ? `https://img.youtube.com/vi/${camp.youtubeId}/hqdefault.jpg` : '')}
                          alt={camp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            if (camp.youtubeId) {
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${camp.youtubeId}/0.jpg`;
                            }
                          }}
                        />
                        {(camp.isShort || camp.platform === 'instagram') && (
                          <span className={`absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-black/85 text-[7px] font-mono font-bold border ${
                            camp.platform === 'instagram' ? 'text-pink-400 border-pink-500/40' : 'text-rose-400 border-rose-500/40'
                          }`}>
                            {camp.platform === 'instagram' ? 'REEL' : 'SHORT'}
                          </span>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-slate-300">
                          {camp.watchDurationSec === 180 ? '3m' : `${camp.watchDurationSec || 180}s`}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-deep-ocean dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-matcha-green truncate transition-colors">
                            {camp.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{camp.channelName}</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                      <div className="text-left sm:text-right font-mono">
                        <span className="text-xs font-bold text-emerald-600 dark:text-[#C7DFA3] block">
                          +{camp.rewardBugs} BUGs
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {camp.currentProgress}/{camp.targetSubscribers} Subs ({progressPercent}%)
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCampaign(camp);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-subtle flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 hover:text-deep-ocean dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>View Full Task Directory ({campaigns.length} Tasks)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Rapid Operations, Shorts Rail & Security Sentinel */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Rapid Operations Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-bold uppercase text-deep-ocean dark:text-slate-100 font-mono">
                Rapid Operations
              </h3>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <button
                onClick={() => onNavigate('create-task')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C7DFA3]" />
                  <span>Deploy Watch Task</span>
                </div>
                <kbd className="text-[10px] bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-slate-400">
                  ⌘2
                </kbd>
              </button>

              <button
                onClick={() => onNavigate('tasks')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Tv className="w-3.5 h-3.5 text-blue-500" />
                  <span>Browse Available Tasks</span>
                </div>
                <kbd className="text-[10px] bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-slate-400">
                  ⌘3
                </kbd>
              </button>

              <button
                onClick={() => onNavigate('wallet')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C7DFA3]" />
                  <span>Top Up Liquid Vault</span>
                </div>
                <kbd className="text-[10px] bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-slate-400">
                  ⌘4
                </kbd>
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Creator Profile &amp; Referrals</span>
                </div>
                <kbd className="text-[10px] bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-slate-400">
                  ⌘5
                </kbd>
              </button>
            </div>
          </div>

          {/* Trending Shorts Shelf (Vertical 9:16 Mini Grid) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <YouTubeShortsIcon className="w-3.5 h-3.5 text-rose-500" />
                <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                <h3 className="text-xs font-bold uppercase text-deep-ocean dark:text-slate-100 font-mono">
                  Shorts &amp; Reels (9:16)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-[#C7DFA3] font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/40">
                +5 BUGs
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {availableShortsAndReels.slice(0, 4).map((item) => {
                const isInsta = item.platform === 'instagram';
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectCampaign(item)}
                    className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 cursor-pointer transition-all flex flex-col justify-between p-2 select-none shadow-subtle"
                  >
                    <img
                      src={item.thumbnailUrl || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : '')}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        if (item.youtubeId) {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.youtubeId}/0.jpg`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`px-1.5 py-0.2 rounded bg-black/75 text-[9px] font-mono font-bold border ${
                        isInsta ? 'text-pink-400 border-pink-500/30' : 'text-rose-400 border-rose-500/30'
                      }`}>
                        {isInsta ? 'REEL' : 'SHORT'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-black/70 text-[#C7DFA3] text-[9px] font-mono font-bold">
                        +5 BUGs
                      </span>
                    </div>

                    <div className="relative z-10 space-y-0.5 text-white">
                      <p className="text-[10px] font-semibold line-clamp-2 leading-tight">
                        {item.title}
                      </p>
                      <span className="text-[9px] font-mono text-slate-300 block truncate">
                        {item.channelName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Sentinel Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 font-mono">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase text-deep-ocean dark:text-slate-100">
                  Security Sentinel
                </h3>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-bold">
                SECURE
              </span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Cryptographic attention audit telemetry for @{user.handle.replace('@', '')}
            </p>

            <div className="space-y-2 text-[10px] pt-1">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>AUDIT EVENT</span>
                  <span>08:01 PM</span>
                </div>
                <div className="flex items-center justify-between font-bold text-deep-ocean dark:text-slate-200">
                  <span className="truncate max-w-[150px]">Verification Nonce Passed</span>
                  <span className="text-emerald-600 dark:text-[#C7DFA3]">VERIFIED</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>LIQUID SETTLEMENT</span>
                  <span>ONLINE</span>
                </div>
                <div className="flex items-center justify-between font-bold text-deep-ocean dark:text-slate-200">
                  <span>NPCI Switch Peg 1:1</span>
                  <span className="text-blue-500 font-bold">INR PEGGED</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
