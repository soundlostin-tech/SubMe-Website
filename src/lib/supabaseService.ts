import { getSupabase, isSupabaseConfigured } from './supabase';
import { Campaign, UserProfile, WalletTransaction, PayoutClaim, DepositRequest, DepositStatus } from '../types';

/**
 * Maps Supabase snake_case profiles table row to App UserProfile
 */
const mapRowToProfile = (row: any): UserProfile => ({
  id: row.id,
  name: row.name || 'User',
  email: row.email || '',
  role: (row.role as 'user' | 'admin') || 'user',
  handle: row.handle || `@${row.name?.toLowerCase().replace(/\s+/g, '') || 'user'}`,
  avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  channelUrl: row.channel_url || '',
  bugBalance: Number(row.bug_balance ?? 100),
  channelSubscribers: Number(row.channel_subscribers ?? 0),
  referralCode: row.referral_code || `SUB${row.id.slice(0, 4).toUpperCase()}`,
  completedTasksCount: Number(row.completed_tasks_count ?? 0),
  activeCampaignsCount: Number(row.active_campaigns_count ?? 0),
  reputationScore: Number(row.reputation_score ?? 98),
  subscribedChannelIds: Array.isArray(row.subscribed_channel_ids) ? row.subscribed_channel_ids : [],
});

/**
 * Maps Supabase snake_case campaigns table row to App Campaign
 */
const mapRowToCampaign = (row: any): Campaign => ({
  id: row.id,
  youtubeId: row.youtube_id,
  videoUrl: row.video_url,
  title: row.title,
  channelName: row.channel_name,
  channelAvatar: row.channel_avatar || '',
  channelId: row.channel_id,
  subscribersCount: Number(row.subscribers_count ?? 0),
  currentProgress: Number(row.current_progress ?? 0),
  targetSubscribers: Number(row.target_subscribers ?? 50),
  rewardBugs: Number(row.reward_bugs ?? 2),
  watchDurationSec: Number(row.watch_duration_sec ?? 180),
  thumbnailUrl: row.thumbnail_url || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`,
  platform: row.platform || 'youtube',
  isShort: Boolean(row.is_short),
  question: row.question,
  options: Array.isArray(row.options) ? row.options : (typeof row.options === 'string' ? JSON.parse(row.options) : []),
  correctAnswerIndex: Number(row.correct_answer_index ?? 0),
  isVip: Boolean(row.is_vip),
  category: row.category || 'Tech & Dev',
  viewsCount: Number(row.views_count ?? 0),
  likesCount: Number(row.likes_count ?? 0),
  uploadedAt: row.uploaded_at || 'Recently',
  status: row.status || 'active',
  description: row.description || '',
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  creatorId: row.creator_id,
});

/**
 * Fetch all registered profiles from Supabase
 */
export const fetchProfilesFromDb = async (): Promise<UserProfile[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('[Supabase] fetchProfiles error:', error?.message);
      return null;
    }
    return data.map(mapRowToProfile);
  } catch (err) {
    console.warn('[Supabase] fetchProfiles exception:', err);
    return null;
  }
};

/**
 * Upsert user profile to Supabase
 */
export const upsertProfileToDb = async (profile: UserProfile): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      handle: profile.handle,
      avatar: profile.avatar,
      channel_url: profile.channelUrl,
      bug_balance: profile.bugBalance,
      channel_subscribers: profile.channelSubscribers,
      referral_code: profile.referralCode,
      completed_tasks_count: profile.completedTasksCount,
      active_campaigns_count: profile.activeCampaignsCount,
      reputation_score: profile.reputationScore,
      subscribed_channel_ids: profile.subscribedChannelIds,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase] upsertProfile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] upsertProfile exception:', err);
    return false;
  }
};

/**
 * Fetch all active campaigns from Supabase
 */
export const fetchCampaignsFromDb = async (): Promise<Campaign[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('[Supabase] fetchCampaigns error:', error?.message);
      return null;
    }
    return data.map(mapRowToCampaign);
  } catch (err) {
    console.warn('[Supabase] fetchCampaigns exception:', err);
    return null;
  }
};

/**
 * Insert new campaign into Supabase
 */
export const createCampaignInDb = async (campaign: Campaign): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('campaigns').insert({
      id: campaign.id,
      youtube_id: campaign.youtubeId,
      video_url: campaign.videoUrl,
      title: campaign.title,
      channel_name: campaign.channelName,
      channel_avatar: campaign.channelAvatar,
      channel_id: campaign.channelId,
      subscribers_count: campaign.subscribersCount,
      current_progress: campaign.currentProgress,
      target_subscribers: campaign.targetSubscribers,
      reward_bugs: campaign.rewardBugs,
      watch_duration_sec: campaign.watchDurationSec,
      thumbnail_url: campaign.thumbnailUrl,
      platform: campaign.platform || 'youtube',
      is_short: campaign.isShort,
      question: campaign.question,
      options: campaign.options,
      correct_answer_index: campaign.correctAnswerIndex,
      is_vip: campaign.isVip,
      category: campaign.category,
      views_count: campaign.viewsCount,
      likes_count: campaign.likesCount,
      uploaded_at: campaign.uploadedAt,
      status: campaign.status,
      description: campaign.description,
      creator_id: campaign.creatorId,
    });

    if (error) {
      console.warn('[Supabase] createCampaign error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] createCampaign exception:', err);
    return false;
  }
};

/**
 * Update campaign progress
 */
export const updateCampaignProgressInDb = async (
  campaignId: string,
  currentProgress: number,
  subscribersCount: number,
  status: string
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('campaigns')
      .update({
        current_progress: currentProgress,
        subscribers_count: subscribersCount,
        status: status,
      })
      .eq('id', campaignId);

    if (error) {
      console.warn('[Supabase] updateCampaignProgress error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateCampaignProgress exception:', err);
    return false;
  }
};

/**
 * Fetch transactions for a user
 */
export const fetchTransactionsFromDb = async (userId: string): Promise<WalletTransaction[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase] fetchTransactions error:', error?.message);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: Number(row.amount),
      description: row.description,
      category: row.category,
      utrRef: row.utr_ref,
      hash: row.hash,
      campaignTitle: row.campaign_title,
      timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      timeStr: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
    }));
  } catch (err) {
    console.warn('[Supabase] fetchTransactions exception:', err);
    return null;
  }
};

/**
 * Record a transaction in Supabase
 */
export const recordTransactionInDb = async (tx: WalletTransaction): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('wallet_transactions').insert({
      id: tx.id,
      user_id: tx.userId || 'usr_creator_primary',
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category || 'reward',
      utr_ref: tx.utrRef || null,
      hash: tx.hash || null,
      campaign_title: tx.campaignTitle || null,
    });

    if (error) {
      console.warn('[Supabase] recordTransaction error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] recordTransaction exception:', err);
    return false;
  }
};

/**
 * Record task completion (verifiable attention proof)
 */
export const recordTaskCompletionInDb = async (completion: {
  id: string;
  campaignId: string;
  viewerId: string;
  rewardBugs: number;
  sessionNonce?: string;
  sha256Hash?: string;
}): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('task_completions').insert({
      id: completion.id,
      campaign_id: completion.campaignId,
      viewer_id: completion.viewerId,
      reward_bugs: completion.rewardBugs,
      session_nonce: completion.sessionNonce || null,
      sha256_hash: completion.sha256Hash || null,
    });

    if (error) {
      console.warn('[Supabase] recordTaskCompletion error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] recordTaskCompletion exception:', err);
    return false;
  }
};

/**
 * Fetch all deposit requests from Supabase
 */
export const fetchDepositRequestsFromDb = async (): Promise<DepositRequest[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('deposit_requests')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase] fetchDepositRequests error:', error?.message);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userHandle: row.user_handle,
      userEmail: row.user_email || undefined,
      amount: Number(row.amount),
      utr: row.utr,
      status: row.status as DepositStatus,
      screenshotUrl: row.screenshot_url || undefined,
      requestedAt: row.requested_at,
      timestamp: Number(row.timestamp),
      reviewedAt: row.reviewed_at || undefined,
      reviewedBy: row.reviewed_by || undefined,
      notes: row.notes || undefined,
    }));
  } catch (err) {
    console.warn('[Supabase] fetchDepositRequests exception:', err);
    return null;
  }
};

/**
 * Insert a new deposit request (Pending admin verification)
 */
export const createDepositRequestInDb = async (request: DepositRequest): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('deposit_requests').insert({
      id: request.id,
      user_id: request.userId,
      user_name: request.userName,
      user_handle: request.userHandle,
      user_email: request.userEmail || null,
      amount: request.amount,
      utr: request.utr,
      status: request.status,
      screenshot_url: request.screenshotUrl || null,
      requested_at: request.requestedAt,
      timestamp: request.timestamp,
      reviewed_at: request.reviewedAt || null,
      reviewed_by: request.reviewedBy || null,
      notes: request.notes || null,
    });

    if (error) {
      console.warn('[Supabase] createDepositRequest error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] createDepositRequest exception:', err);
    return false;
  }
};

/**
 * Update deposit request status (Approved/Credited or Rejected by Admin)
 */
export const updateDepositRequestStatusInDb = async (
  requestId: string,
  status: DepositStatus,
  reviewedBy?: string,
  notes?: string
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('deposit_requests')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy || 'Admin',
        notes: notes || null,
      })
      .eq('id', requestId);

    if (error) {
      console.warn('[Supabase] updateDepositRequestStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] updateDepositRequestStatus exception:', err);
    return false;
  }
};
