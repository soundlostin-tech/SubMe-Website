/**
 * Standalone YouTube Daily Automation Script
 * Fetches the latest daily videos for top creators from YouTube RSS feeds
 * and syncs them directly to the SubMe Supabase database.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://elyhwhqsapymjzoqtcdz.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseWh3aHFzYXB5bWp6b3F0Y2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTE3MTcsImV4cCI6MjEwODA2NzcxN30.liFA9IMNsVPphtLY9tu4-KA9K9WN1n7VZ6djwcZy2YM';

const TOP_CHANNELS = [
  {
    name: 'Techno Gamerz',
    channelId: 'UCX8pnu3DYUnx8qy8V_c6oHg',
    campaignId: 'camp_technogamerzofficial',
    category: 'Gaming',
    subscribersCount: 53400000,
    rewardBugs: 25,
    handle: 'TechnoGamerzOfficial',
  },
  {
    name: 'MrBeast',
    channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    campaignId: 'camp_mrbeast',
    category: 'Entertainment',
    subscribersCount: 522000000,
    rewardBugs: 25,
    handle: 'MrBeast',
  },
  {
    name: 'CarryMinati',
    channelId: 'UCj22tfcQrWG7EMEKS0qLeEg',
    campaignId: 'camp_carryminati',
    category: 'Entertainment',
    subscribersCount: 45100000,
    rewardBugs: 25,
    handle: 'CarryMinati',
  },
  {
    name: 'Sourav Joshi Vlogs',
    channelId: 'UCjvgGbPPn-FgYeguc5nxG4A',
    campaignId: 'camp_souravjvlogs',
    category: 'Vlogs',
    subscribersCount: 42200000,
    rewardBugs: 25,
    handle: 'SouravJoshiVlogs7030',
  },
  {
    name: 'Total Gaming',
    channelId: 'UC5c9VlYTSvBSCaoMu_EI6gQ',
    campaignId: 'camp_totalgaming093',
    category: 'Gaming',
    subscribersCount: 45900000,
    rewardBugs: 25,
    handle: 'TotalGaming093',
  },
  {
    name: 'Round2Hell',
    channelId: 'UCF_fDSgPpBQuh1MsUTgIARQ',
    campaignId: 'camp_round2hell',
    category: 'Entertainment',
    subscribersCount: 33800000,
    rewardBugs: 25,
    handle: 'Round2hell',
  },
  {
    name: 'Ashish Chanchlani',
    channelId: 'UC7eHZXheF8nVOfwB2PEslMw',
    campaignId: 'camp_ashishchanchlani',
    category: 'Entertainment',
    subscribersCount: 30400000,
    rewardBugs: 25,
    handle: 'ashishchanchlanivines',
  },
  {
    name: 'Mythpat',
    channelId: 'UCOnnmKlDZ3tJNu848nS9m4Q',
    campaignId: 'camp_mythpat',
    category: 'Gaming',
    subscribersCount: 15100000,
    rewardBugs: 25,
    handle: 'Mythpat',
  },
];

async function fetchLatestVideo(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'SubMeAutomation/1.0' } });
    if (!res.ok) return null;
    const xml = await res.text();

    const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/g);

    if (videoIdMatch && titleMatch && titleMatch.length > 1) {
      const videoId = videoIdMatch[1];
      // First <title> is channel name, second is the newest video title
      const videoTitle = titleMatch[1].replace(/<\/?title>/g, '');
      return {
        videoId,
        title: videoTitle,
        isShort: videoTitle.toLowerCase().includes('#short'),
      };
    }
  } catch (err) {
    console.error(`Error fetching channel ${channelId}:`, err.message);
  }
  return null;
}

async function runDailySync() {
  console.log(`[YouTube Automation] Starting daily sync at ${new Date().toISOString()}...`);
  let synced = 0;

  for (const ch of TOP_CHANNELS) {
    const latest = await fetchLatestVideo(ch.channelId);
    if (!latest) continue;

    console.log(`[Synced] ${ch.name}: Newest Video "${latest.title}" (${latest.videoId})`);

    const campaignPayload = {
      id: ch.campaignId,
      youtube_id: latest.videoId,
      video_url: `https://www.youtube.com/watch?v=${latest.videoId}`,
      title: latest.title,
      channel_name: ch.name,
      channel_avatar: `https://unavatar.io/youtube/${ch.handle}`,
      channel_id: ch.channelId,
      subscribers_count: ch.subscribersCount,
      current_progress: 32,
      target_subscribers: 50,
      reward_bugs: ch.rewardBugs,
      watch_duration_sec: 180,
      thumbnail_url: `https://img.youtube.com/vi/${latest.videoId}/maxresdefault.jpg`,
      platform: 'youtube',
      is_short: latest.isShort,
      question: `What is the main highlight of this ${ch.name} video?`,
      options: [latest.title.slice(0, 48), 'General vlog', 'Challenge', 'Reaction'],
      correct_answer_index: 0,
      is_vip: true,
      category: ch.category,
      views_count: 350000,
      likes_count: 28000,
      uploaded_at: 'Today (Automated Daily Sync)',
      status: 'active',
      description: `Daily real-time video update for ${ch.name}. (Showcase preview quota closed)`,
      creator_id: 'featured_promotional',
    };

    try {
      const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/campaigns`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(campaignPayload),
      });

      if (upsertRes.ok) {
        synced++;
      } else {
        const txt = await upsertRes.text();
        console.warn(`Supabase upsert warning for ${ch.name}:`, txt);
      }
    } catch (e) {
      console.error(`DB error for ${ch.name}:`, e.message);
    }
  }

  console.log(`[YouTube Automation] Daily sync complete! Successfully updated ${synced}/${TOP_CHANNELS.length} channels.`);
}

runDailySync();
