export type CampaignStatus = 'active' | 'completed' | 'paused';
export type ThemeMode = 'light' | 'dark';

export interface Campaign {
  id: string;
  youtubeId: string;
  videoUrl: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  channelId: string;
  subscribersCount: number;
  currentProgress: number; // e.g. 38 subscribers acquired
  targetSubscribers: number; // e.g. 50 subscribers
  rewardBugs: number; // e.g. 20.00 BUGs
  watchDurationSec: number; // 30, 45, 60
  thumbnailUrl?: string;
  platform?: 'youtube' | 'instagram';
  isShort?: boolean;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  isVip: boolean;
  category: string;
  viewsCount: number;
  likesCount: number;
  uploadedAt: string;
  status: CampaignStatus;
  description: string;
  createdAt: number;
  creatorId: string;
  isPromotional?: boolean;
}

export type TransactionType = 
  | 'EARNED_TASK'
  | 'CAMPAIGN_LAUNCH'
  | 'VIP_BOOSTER'
  | 'UPI_TOPUP'
  | 'REFERRAL_BOUNTY'
  | 'CAMPAIGN_REFUND';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  timestamp: number;
  description: string;
  userId?: string;
  timeStr?: string;
  category?: 'reward' | 'topup' | 'spend';
  utrRef?: string;
  hash?: string;
  campaignTitle?: string;
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  handle: string;
  avatar: string;
  channelUrl?: string;
  bugBalance: number; // 1 BUG = ₹1 INR
  channelSubscribers: number;
  referralCode: string;
  completedTasksCount: number;
  activeCampaignsCount: number;
  reputationScore: number;
  subscribedChannelIds: string[];
}

export interface VerificationSession {
  campaignId: string;
  viewerId: string;
  startTime: number;
  nonce: string;
  elapsedSec: number;
  requiredSec: number;
  isTabActive: boolean;
  status: 'watching' | 'question_ready' | 'verifying' | 'success' | 'failed';
  sha256Hash?: string;
}

export interface PayoutClaim {
  id: string;
  memberId: string;
  member: string;
  handle: string;
  amount: number;
  vpa: string;
  requestedAt: string;
  status: 'pending' | 'settled';
  utr?: string;
  timestamp: number;
}

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userEmail?: string;
  amount: number; // in INR / BUGs
  utr: string; // 12-digit UTR
  status: DepositStatus;
  requestedAt: string;
  timestamp: number;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface AuditSentinelEvent {
  id: string;
  type: string;
  title: string;
  time: string;
  timestamp: number;
  hash?: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  pts: number;
  refs: number;
  tasksCompleted: number;
  status: string;
  verified: boolean;
}

export interface FeaturedCreatorBanner {
  id: string;
  name: string;
  channelName: string;
  category: string;
  tagline: string;
  subscribers: string;
  subscribersCount: number;
  rewardBugs: number;
  watchDurationSec: number;
  bannerImage: string;
  avatar: string;
  youtubeId: string;
  accentColor: string;
  campaignId: string;
  verifiedBadge: string;
}


