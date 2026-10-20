import { Campaign, FeaturedCreatorBanner } from '../types';
import { createCampaignInDb } from '../lib/supabaseService';

export interface FeaturedChannelConfig {
  id: string;
  name: string;
  channelName: string;
  channelId: string;
  handle: string;
  category: string;
  subscribers: string;
  subscribersCount: number;
  rewardBugs: number;
  watchDurationSec: number;
  campaignId: string;
  defaultAvatar: string;
}

export const TOP_CREATOR_CHANNELS: FeaturedChannelConfig[] = [
  {
    id: 'feat_technogamerzofficial',
    name: 'Techno Gamerz',
    channelName: 'Techno Gamerz',
    channelId: 'UCX8pnu3DYUnx8qy8V_c6oHg',
    handle: 'TechnoGamerzOfficial',
    category: 'Gaming',
    subscribers: '53.4M',
    subscribersCount: 53400000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_technogamerzofficial',
    defaultAvatar: 'https://unavatar.io/youtube/TechnoGamerzOfficial',
  },
  {
    id: 'feat_mrbeast',
    name: 'MrBeast',
    channelName: 'MrBeast',
    channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    handle: 'MrBeast',
    category: 'Entertainment',
    subscribers: '522M',
    subscribersCount: 522000000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_mrbeast',
    defaultAvatar: 'https://unavatar.io/youtube/MrBeast',
  },
  {
    id: 'feat_carryminati',
    name: 'CarryMinati',
    channelName: 'CarryMinati',
    channelId: 'UCj22tfcQrWG7EMEKS0qLeEg',
    handle: 'CarryMinati',
    category: 'Entertainment',
    subscribers: '45.1M',
    subscribersCount: 45100000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_carryminati',
    defaultAvatar: 'https://unavatar.io/youtube/CarryMinati',
  },
  {
    id: 'feat_souravjvlogs',
    name: 'Sourav Joshi Vlogs',
    channelName: 'Sourav Joshi Vlogs',
    channelId: 'UCjvgGbPPn-FgYeguc5nxG4A',
    handle: 'SouravJoshiVlogs7030',
    category: 'Vlogs',
    subscribers: '42.2M',
    subscribersCount: 42200000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_souravjvlogs',
    defaultAvatar: 'https://unavatar.io/youtube/SouravJoshiVlogs7030',
  },
  {
    id: 'feat_totalgaming093',
    name: 'Total Gaming',
    channelName: 'Total Gaming',
    channelId: 'UC5c9VlYTSvBSCaoMu_EI6gQ',
    handle: 'TotalGaming093',
    category: 'Gaming',
    subscribers: '45.9M',
    subscribersCount: 45900000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_totalgaming093',
    defaultAvatar: 'https://unavatar.io/youtube/TotalGaming093',
  },
  {
    id: 'feat_round2hell',
    name: 'Round2Hell',
    channelName: 'Round2Hell',
    channelId: 'UCF_fDSgPpBQuh1MsUTgIARQ',
    handle: 'Round2hell',
    category: 'Entertainment',
    subscribers: '33.8M',
    subscribersCount: 33800000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_round2hell',
    defaultAvatar: 'https://unavatar.io/youtube/Round2hell',
  },
  {
    id: 'feat_ashishchanchlani',
    name: 'Ashish Chanchlani',
    channelName: 'ashish chanchlani vines',
    channelId: 'UC7eHZXheF8nVOfwB2PEslMw',
    handle: 'ashishchanchlanivines',
    category: 'Entertainment',
    subscribers: '30.4M',
    subscribersCount: 30400000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_ashishchanchlani',
    defaultAvatar: 'https://unavatar.io/youtube/ashishchanchlanivines',
  },
  {
    id: 'feat_mythpat',
    name: 'Mythpat',
    channelName: 'Mythpat',
    channelId: 'UCOnnmKlDZ3tJNu848nS9m4Q',
    handle: 'Mythpat',
    category: 'Gaming',
    subscribers: '15.1M',
    subscribersCount: 15100000,
    rewardBugs: 25,
    watchDurationSec: 180,
    campaignId: 'camp_mythpat',
    defaultAvatar: 'https://unavatar.io/youtube/Mythpat',
  },
];

export interface YouTubeLatestVideo {
  videoId: string;
  title: string;
  published: string;
  isShort: boolean;
  thumbnailUrl: string;
}

/**
 * Fetches the latest published video for a YouTube channel using the official public RSS feed
 */
export const fetchLatestVideoFromRss = async (channelId: string): Promise<YouTubeLatestVideo | null> => {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await fetch(proxyUrl, { cache: 'no-cache' });
    if (!response.ok) return null;
    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');

    if (!entries || entries.length === 0) return null;

    const latest = entries[0];
    const videoIdElem = latest.getElementsByTagName('yt:videoId')[0];
    const titleElem = latest.getElementsByTagName('title')[0];
    const publishedElem = latest.getElementsByTagName('published')[0];

    const videoId = videoIdElem ? videoIdElem.textContent?.trim() : '';
    const title = titleElem ? titleElem.textContent?.trim() : '';
    const published = publishedElem ? publishedElem.textContent?.trim() : new Date().toISOString();

    if (!videoId || !title) return null;

    const isShort = title.toLowerCase().includes('#short') || title.toLowerCase().includes('#shorts');
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return {
      videoId,
      title,
      published: published || new Date().toISOString(),
      isShort,
      thumbnailUrl,
    };
  } catch (err) {
    console.warn(`[YouTubeSync] Failed to fetch feed for channel ${channelId}:`, err);
    return null;
  }
};

/**
 * Automated Daily YouTube Sync Engine:
 * - Fetches latest videos for big YouTubers in real time.
 * - Replaces old videos with newly released daily uploads.
 * - Updates campaigns and featured banners.
 * - Removes outdated videos from the showcase pool.
 */
export const syncAllFeaturedCreators = async (
  currentCampaigns: Campaign[],
  currentFeaturedBanners: FeaturedCreatorBanner[]
): Promise<{
  updatedCampaigns: Campaign[];
  updatedBanners: FeaturedCreatorBanner[];
  syncedCount: number;
  syncedDetails: Array<{ creator: string; videoId: string; title: string }>;
}> => {
  const updatedCampaigns = [...currentCampaigns];
  const updatedBanners = [...currentFeaturedBanners];
  const syncedDetails: Array<{ creator: string; videoId: string; title: string }> = [];

  let count = 0;

  for (const creator of TOP_CREATOR_CHANNELS) {
    const latest = await fetchLatestVideoFromRss(creator.channelId);
    if (!latest) continue;

    syncedDetails.push({
      creator: creator.name,
      videoId: latest.videoId,
      title: latest.title,
    });
    count++;

    // 1. Update or replace in featured banners
    const bannerIndex = updatedBanners.findIndex(b => b.id === creator.id || b.name === creator.name);
    if (bannerIndex !== -1) {
      updatedBanners[bannerIndex] = {
        ...updatedBanners[bannerIndex],
        youtubeId: latest.videoId,
        tagline: `${creator.name} • ${latest.title}`,
        bannerImage: latest.thumbnailUrl,
      };
    }

    // 2. Update or replace in campaigns (removes old video, puts latest daily video)
    const campIndex = updatedCampaigns.findIndex(
      c => c.id === creator.campaignId || c.channelName.toLowerCase() === creator.channelName.toLowerCase()
    );

    const now = Date.now();
    const newCampaignItem: Campaign = {
      id: creator.campaignId,
      youtubeId: latest.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${latest.videoId}`,
      title: latest.title,
      channelName: creator.channelName,
      channelAvatar: creator.defaultAvatar,
      channelId: creator.channelId,
      subscribersCount: creator.subscribersCount,
      currentProgress: 32,
      targetSubscribers: 50,
      rewardBugs: creator.rewardBugs,
      watchDurationSec: creator.watchDurationSec,
      thumbnailUrl: latest.thumbnailUrl,
      platform: 'youtube',
      isShort: latest.isShort,
      question: `What is the central focus and topic of this ${creator.name} broadcast?`,
      options: [
        latest.title.slice(0, 48),
        'General Vlog & Background Commentary',
        'Tutorial Walkthrough for Beginners',
        'Official Channel Trailer'
      ],
      correctAnswerIndex: 0,
      isVip: true,
      category: creator.category,
      viewsCount: 250000,
      likesCount: 22000,
      uploadedAt: 'Today (Live Sync)',
      status: 'active',
      description: `Official latest release from ${creator.name}. Synchronized daily from YouTube RSS stream. (Promotional Preview Quota Closed)`,
      createdAt: now,
      creatorId: 'featured_promotional',
      isPromotional: true,
    };

    if (campIndex !== -1) {
      // Replace old video with fresh daily video
      updatedCampaigns[campIndex] = newCampaignItem;
    } else {
      updatedCampaigns.unshift(newCampaignItem);
    }

    // Persist to Supabase if live
    createCampaignInDb(newCampaignItem).catch(() => {});
  }

  // Update last sync timestamp in localStorage
  localStorage.setItem('subme_last_yt_sync', Date.now().toString());
  localStorage.setItem('subme_campaigns_v9', JSON.stringify(updatedCampaigns));

  return {
    updatedCampaigns,
    updatedBanners,
    syncedCount: count,
    syncedDetails,
  };
};

/**
 * Checks if 24 hours have passed since last sync and triggers auto-sync
 */
export const checkAndRunDailyAutoSync = async (
  currentCampaigns: Campaign[],
  currentFeaturedBanners: FeaturedCreatorBanner[],
  onSyncComplete: (campaigns: Campaign[], banners: FeaturedCreatorBanner[]) => void
): Promise<void> => {
  const lastSyncStr = localStorage.getItem('subme_last_yt_sync');
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  if (!lastSyncStr || now - Number(lastSyncStr) > ONE_DAY_MS) {
    try {
      const result = await syncAllFeaturedCreators(currentCampaigns, currentFeaturedBanners);
      if (result.syncedCount > 0) {
        onSyncComplete(result.updatedCampaigns, result.updatedBanners);
      }
    } catch (e) {
      console.warn('[YouTubeSync] Daily auto sync exception:', e);
    }
  }
};
