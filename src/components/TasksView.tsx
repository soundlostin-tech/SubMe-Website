import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  ArrowRight,
  Plus,
  Search,
  LayoutGrid,
  List,
  Coins
} from 'lucide-react';
import { Campaign, UserProfile } from '../types';
import { isPromotionalCampaign } from '../utils/campaignHelper';

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

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

interface TasksViewProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onOpenCreateCampaign: () => void;
  user: UserProfile;
}

export const TasksView: React.FC<TasksViewProps> = ({
  campaigns,
  onSelectCampaign,
  onOpenCreateCampaign,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'shorts' | 'videos' | 'reels'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'popular'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeCampaigns = campaigns.filter(c => {
    if (c.status === 'completed') return false;
    if (user?.completedCampaignIds?.includes(c.id)) return false;
    if (user?.subscribedChannelIds?.includes(c.channelId)) return false;
    return true;
  });

  const shortsCount = activeCampaigns.filter(c => c.isShort).length;
  const videosCount = activeCampaigns.filter(c => !c.isShort && c.platform !== 'instagram').length;
  const reelsCount = activeCampaigns.filter(c => c.platform === 'instagram').length;

  const filteredCampaigns = useMemo(() => {
    let result = activeCampaigns.filter((c) => {
      if (activeTab === 'shorts') return c.isShort;
      if (activeTab === 'videos') return !c.isShort && c.platform !== 'instagram';
      if (activeTab === 'reels') return c.platform === 'instagram';
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.channelName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'latest') {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else if (sortBy === 'popular') {
      result.sort((a, b) => {
        const popB = (b.viewsCount || 0) > 0 ? (b.viewsCount || 0) : (b.currentProgress || 0);
        const popA = (a.viewsCount || 0) > 0 ? (a.viewsCount || 0) : (a.currentProgress || 0);
        if (popB !== popA) return popB - popA;
        return (b.currentProgress || 0) - (a.currentProgress || 0);
      });
    }

    return result;
  }, [activeCampaigns, activeTab, searchQuery, sortBy]);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] text-deep-ocean dark:text-slate-100 min-h-full transition-colors max-w-7xl mx-auto">
      
      {/* 1. Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-deep-ocean dark:text-slate-100">
              Task Directory
            </h1>
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
              {filteredCampaigns.length} Active Tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Browse verified creator tasks, watch authentic videos, verify attention, and claim BUGs (1 BUG = ₹1).
          </p>
        </div>

        <button
          onClick={onOpenCreateCampaign}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create Task</span>
        </button>
      </div>

      {/* 2. Controls Toolbar: Search, Filters, Sort & View Mode */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card">
        
        {/* Format Filter Tabs */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700/80 rounded-lg p-1 bg-slate-50 dark:bg-[#16222F] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                : 'text-slate-500 hover:text-deep-ocean dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>All Tasks ({activeCampaigns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'videos'
                ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                : 'text-slate-500 hover:text-deep-ocean dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <YouTubeIcon className="w-3 h-3 text-rose-500" />
            <span>YouTube Videos ({videosCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shorts')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'shorts'
                ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                : 'text-slate-500 hover:text-deep-ocean dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <YouTubeShortsIcon className="w-3 h-3 text-rose-500" />
            <span>Shorts ({shortsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reels')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reels'
                ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                : 'text-slate-500 hover:text-deep-ocean dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <InstagramIcon className="w-3 h-3 text-pink-500" />
            <span>Reels ({reelsCount})</span>
          </button>
        </div>

        {/* Right Controls: Search, Sort & View Mode */}
        <div className="flex items-center gap-2">
          {/* Live Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creator or title..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-deep-ocean dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-mono bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="latest">Latest Tasks</option>
            <option value="oldest">Oldest Tasks</option>
            <option value="popular">Popular Tasks</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-100 dark:bg-[#16222F] text-deep-ocean dark:text-white font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-slate-100 dark:bg-[#16222F] text-deep-ocean dark:text-white font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Compact List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Task Display: Grid View or List View */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-14 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-8 space-y-3 shadow-card">
          <p className="text-sm font-semibold text-deep-ocean dark:text-slate-200">
            {campaigns.length > 0 && activeCampaigns.length === 0
              ? 'All Available Tasks Completed!'
              : 'No tasks match your current filters.'}
          </p>
          <p className="text-xs text-slate-400">
            {campaigns.length > 0 && activeCampaigns.length === 0
              ? 'You have finished all active creator tasks (+5 BUGs per task credited). Completed tasks are removed from your feed. Check back soon for new campaigns or launch your own task!'
              : 'Try adjusting your search query or switching to another category.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-mono font-bold text-blue-600 dark:text-matcha-green hover:underline cursor-pointer"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((camp) => {
            const progressPercent = Math.min(100, Math.round((camp.currentProgress / camp.targetSubscribers) * 100));
            const isUserSubscribed = user.subscribedChannelIds.includes(camp.channelId);

            return (
              <div
                key={camp.id}
                onClick={() => onSelectCampaign(camp)}
                className="rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-card hover:shadow-elevated transition-all cursor-pointer overflow-hidden flex flex-col justify-between group active:scale-[0.99]"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={camp.thumbnailUrl || (camp.youtubeId ? `https://img.youtube.com/vi/${camp.youtubeId}/hqdefault.jpg` : '')}
                    alt={camp.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      if (camp.youtubeId) {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${camp.youtubeId}/0.jpg`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Format Badge */}
                  {camp.platform === 'instagram' ? (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-pink-400 border border-pink-500/40 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      <InstagramIcon className="w-2.5 h-2.5 text-pink-500" />
                      <span>REEL</span>
                    </span>
                  ) : camp.isShort ? (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-rose-400 border border-rose-500/40 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      <YouTubeShortsIcon className="w-2.5 h-2.5 text-rose-500" />
                      <span>SHORT</span>
                    </span>
                  ) : null}

                  {/* Reward Pill */}
                  {isPromotionalCampaign(camp) ? (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/90 text-white border border-amber-600 text-[10px] font-mono font-bold backdrop-blur-xs shadow-2xs">
                      Tasks Not Available
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-800 dark:text-[#C7DFA3] border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-mono font-bold backdrop-blur-xs shadow-2xs">
                      <span>+{camp.rewardBugs.toFixed(0)} BUGs</span>
                    </span>
                  )}

                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300">
                    {camp.watchDurationSec === 180 ? '3 Min' : `${camp.watchDurationSec || 180}s`}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={camp.channelAvatar}
                        alt={camp.channelName}
                        className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {camp.channelName}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-deep-ocean dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-matcha-green transition-colors line-clamp-2 leading-snug">
                      {camp.title}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">
                        {camp.platform === 'instagram' ? 'Followers:' : 'Subscribers:'}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {camp.currentProgress} / {camp.targetSubscribers} ({progressPercent}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#0B1118] overflow-hidden border border-slate-200/80 dark:border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-deep-ocean dark:bg-slate-600"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-0.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-slate-400">
                      {camp.category}
                    </span>

                    <div className="flex items-center gap-1 text-deep-ocean dark:text-[#C7DFA3] font-bold group-hover:translate-x-0.5 transition-all text-xs bg-slate-100 dark:bg-[#16222F] px-2.5 py-1 rounded-md">
                      <span>
                        {isPromotionalCampaign(camp) 
                          ? 'Showcase Preview' 
                          : isUserSubscribed 
                          ? (camp.platform === 'instagram' ? 'Following' : 'Subscribed') 
                          : (camp.platform === 'instagram' ? 'Open Reel Task' : camp.isShort ? 'Watch Short' : 'Watch Task')}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT LIST VIEW */
        <div className="rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-card">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-[#16222F] text-[10.5px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/90 dark:border-slate-800 whitespace-nowrap">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Video &amp; Creator</th>
                <th className="py-2.5 px-4 font-semibold hidden sm:table-cell">Format</th>
                <th className="py-2.5 px-4 font-semibold hidden md:table-cell">Goal Progress</th>
                <th className="py-2.5 px-4 font-semibold">Watch Time</th>
                <th className="py-2.5 px-4 font-semibold">Reward</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filteredCampaigns.map((camp) => {
                const progressPercent = Math.min(100, Math.round((camp.currentProgress / camp.targetSubscribers) * 100));
                return (
                  <tr
                    key={camp.id}
                    onClick={() => onSelectCampaign(camp)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={camp.thumbnailUrl || (camp.youtubeId ? `https://img.youtube.com/vi/${camp.youtubeId}/hqdefault.jpg` : '')}
                          alt={camp.title}
                          className="w-14 h-9 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            if (camp.youtubeId) {
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${camp.youtubeId}/0.jpg`;
                            }
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-deep-ocean dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-matcha-green truncate max-w-xs md:max-w-sm">
                            {camp.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>{camp.channelName}</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden sm:table-cell font-mono">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {camp.platform === 'instagram' ? 'Reel' : camp.isShort ? 'Short' : 'Video 16:9'}
                      </span>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell font-mono">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{camp.currentProgress}</span>
                          <span>{camp.targetSubscribers}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-[#0B1118] rounded-full overflow-hidden">
                          <div className="h-full bg-deep-ocean dark:bg-slate-600 rounded-full" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                        {camp.watchDurationSec === 180 ? '3 Min' : `${camp.watchDurationSec || 180}s`}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {isPromotionalCampaign(camp) ? (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          Quota Closed
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600 dark:text-[#C7DFA3]">
                          +{camp.rewardBugs} BUGs
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCampaign(camp);
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-subtle ${
                          isPromotionalCampaign(camp)
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white'
                        }`}
                      >
                        {isPromotionalCampaign(camp) ? 'Showcase' : 'Start'}
                      </button>
                    </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
