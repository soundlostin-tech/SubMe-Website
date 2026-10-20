import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Coins, 
  Clock, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Check
} from 'lucide-react';
import { Campaign, UserProfile } from '../types';
import { generateNonce } from '../utils/crypto';
import { playTickSound } from '../utils/audio';
import { isPromotionalCampaign } from '../utils/campaignHelper';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3" ry="3"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YouTubeShortsIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.94c-1.84.96-2.53 3.23-1.56 5.06 1 1.87 3.27 2.54 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25zM10 14.65v-5.3L15 12l-5 2.65z"/>
  </svg>
);

interface WatchPageProps {
  campaign: Campaign;
  allCampaigns: Campaign[];
  user: UserProfile;
  onSelectCampaign: (c: Campaign) => void;
  onTriggerVerification: (campaign: Campaign, sessionNonce: string) => void;
  onBackToFeed: () => void;
  hasSubscribed: boolean;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  campaign,
  allCampaigns,
  user,
  onSelectCampaign,
  onTriggerVerification,
  onBackToFeed,
  hasSubscribed,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(campaign.watchDurationSec || 180);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isTabFocused, setIsTabFocused] = useState<boolean>(true);
  const [isReadyToVerify, setIsReadyToVerify] = useState<boolean>(false);
  const [sessionNonce, setSessionNonce] = useState<string>('');
  const [likesCount, setLikesCount] = useState<number>(campaign.likesCount || 104);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isNotAvailableModalOpen, setIsNotAvailableModalOpen] = useState(false);

  const isPromotional = isPromotionalCampaign(campaign);

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const [comments, setComments] = useState<Array<{ id: string; author: string; avatar: string; text: string; time: string; verified: boolean }>>([
    {
      id: 'c1',
      author: 'Rohit Kumar',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: 'Watched the full 3 minutes and answered the question easily! +25 BUGs received immediately.',
      time: '12m ago',
      verified: true,
    },
    {
      id: 'c2',
      author: 'Aman Verma',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      text: 'Great platform! Real viewers watch genuine videos and earn instant rewards.',
      time: '1h ago',
      verified: true,
    },
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const nonce = generateNonce(12);
    setSessionNonce(nonce);
    setSecondsRemaining(campaign.watchDurationSec || 180);
    setIsReadyToVerify(false);
    setIsPlaying(true);
  }, [campaign.id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabFocused(!document.hidden);
    };

    const handleBlur = () => setIsTabFocused(false);
    const handleFocus = () => setIsTabFocused(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      setIsReadyToVerify(true);
      return;
    }

    if (!isPlaying || !isTabFocused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReadyToVerify(true);
          return 0;
        }
        playTickSound();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isPlaying, isTabFocused]);

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(likesCount - 1);
      setHasLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setHasLiked(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      {
        id: `c_${Date.now()}`,
        author: user.name,
        avatar: user.avatar,
        text: newComment.trim(),
        time: 'Just now',
        verified: hasSubscribed,
      },
      ...comments,
    ]);
    setNewComment('');
  };

  const duration = campaign.watchDurationSec || 180;
  const progressPercentage = Math.round(((duration - secondsRemaining) / duration) * 100);

  const recommendedTasks = allCampaigns.filter((c) => c.id !== campaign.id);

  return (
    <div className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] text-slate-800 dark:text-slate-100 min-h-full transition-colors">
      
      {/* Top Header Breadcrumb */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={onBackToFeed}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131D28] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-subtle"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Engine Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Main Watch Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Player Frame */}
          {campaign.platform === 'instagram' ? (
            <div className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
              <img
                src={campaign.thumbnailUrl}
                alt={campaign.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/50 pointer-events-none" />

              {/* Top Reel Header */}
              <div className="relative z-10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-mono font-bold text-pink-400 border border-pink-500/30">
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>REEL</span>
                </div>
                {campaign.videoUrl && (
                  <a
                    href={campaign.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-subtle"
                  >
                    <span>Open in Instagram</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                )}
              </div>

              {/* Center Play Icon */}
              <div className="relative z-10 mx-auto w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                <InstagramIcon className="w-6 h-6 text-pink-400" />
              </div>

              {/* Bottom Reel Details */}
              <div className="relative z-10 p-4 space-y-1.5 text-white">
                <div className="flex items-center gap-2">
                  <img
                    src={campaign.channelAvatar}
                    alt={campaign.channelName}
                    className="w-8 h-8 rounded-full border border-white/30 object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {campaign.channelName}
                    </p>
                    <p className="text-[10px] text-pink-300 font-mono">Instagram Creator</p>
                  </div>
                </div>
                <p className="text-xs font-medium line-clamp-2 leading-snug">
                  {campaign.title}
                </p>
              </div>
            </div>
          ) : campaign.isShort ? (
            <div className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-card">
              <iframe
                src={`https://www.youtube.com/embed/${campaign.youtubeId}?autoplay=1&enablejsapi=1&loop=1&playlist=${campaign.youtubeId}`}
                title={campaign.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-rose-400 border border-rose-500/30 pointer-events-none">
                <YouTubeShortsIcon className="w-3 h-3 text-rose-500" />
                <span>SHORTS (9:16)</span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-card">
              <iframe
                src={`https://www.youtube.com/embed/${campaign.youtubeId}?autoplay=1&enablejsapi=1`}
                title={campaign.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          {/* Attention Verification HUD Bar */}
          <div className={`p-4 rounded-xl border transition-all shadow-card ${
            isReadyToVerify
              ? isPromotional
                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400/50 dark:border-amber-700/50'
                : 'bg-white dark:bg-[#131D28] border-emerald-500/50 dark:border-emerald-700/60'
              : !isTabFocused
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/50'
              : 'bg-white dark:bg-[#131D28] border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {!isReadyToVerify ? (
                    isTabFocused ? (
                      <span className="flex items-center gap-2 text-xs font-mono font-bold text-deep-ocean dark:text-matcha-green uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-deep-ocean dark:bg-matcha-green animate-pulse" />
                        ATTENTION VERIFIER RUNNING
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                        <AlertCircle className="w-4 h-4" />
                        PAUSED: PLEASE KEEP TAB ACTIVE
                      </span>
                    )
                  ) : isPromotional ? (
                    <span className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" />
                      PROMOTIONAL PREVIEW • TASKS NOT AVAILABLE
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 dark:text-matcha-green uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-matcha-green" />
                      {campaign.platform === 'instagram' 
                        ? `ACTION TIME COMPLETE (${duration >= 60 ? `${Math.floor(duration / 60)} Min` : `${duration}s`})`
                        : `WATCH TIME COMPLETE (${duration >= 60 ? `${Math.floor(duration / 60)} Min` : `${duration}s`})`}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isReadyToVerify
                    ? isPromotional
                      ? 'Yeh showcase task user attention aur platform preview ke liye hai. Is task ki reward quota complete ho chuki hai (Tasks Not Available).'
                      : 'Watch goal reached! Click below to answer the simple quiz question and claim your BUGs.'
                    : !isTabFocused
                    ? 'Anti-cheat paused the timer. Return to this tab to resume watch verification.'
                    : campaign.platform === 'instagram'
                    ? `Engage on Instagram for ${formatDuration(secondsRemaining)} (${secondsRemaining}s) more to complete verification.`
                    : `Watch for ${formatDuration(secondsRemaining)} (${secondsRemaining}s) more to complete attention verification.`}
                </p>

                {/* Progress Bar */}
                <div className="w-full sm:w-80 h-1.5 bg-slate-100 dark:bg-[#0E1620] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 mt-2">
                  <div
                    className="h-full transition-all duration-300 bg-deep-ocean dark:bg-slate-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Trigger */}
              <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                {!isReadyToVerify ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDuration(secondsRemaining)}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({secondsRemaining}s)</span>
                  </div>
                ) : isPromotional ? (
                  <button
                    onClick={() => setIsNotAvailableModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-mono font-semibold text-xs uppercase tracking-wider border border-amber-500/40 cursor-pointer active:scale-95 transition-all shadow-subtle"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Tasks Not Available</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onTriggerVerification(campaign, sessionNonce)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-mono font-semibold text-xs uppercase tracking-wider border border-slate-600 cursor-pointer active:scale-95 transition-all shadow-subtle"
                  >
                    <Coins className="w-4 h-4 text-matcha-green" />
                    <span>Answer Quiz &amp; Claim +{campaign.rewardBugs} BUGs</span>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Video Title */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {campaign.title}
          </h1>

          {/* Channel Bar & Social Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-200/80 dark:border-slate-800/80">
            
            {/* Channel Info & Subscribe */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={campaign.channelAvatar}
                  alt={campaign.channelName}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{campaign.channelName}</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {campaign.subscribersCount.toLocaleString()} {campaign.platform === 'instagram' ? 'Followers' : 'Subscribers'}
                  </p>
                </div>
              </div>

              {/* Subscribe / Follow Button */}
              <button
                onClick={() => {
                  if (isReadyToVerify) {
                    onTriggerVerification(campaign, sessionNonce);
                  }
                }}
                disabled={hasSubscribed}
                className={`px-3.5 py-1.5 rounded-lg font-mono font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle ${
                  hasSubscribed
                    ? 'bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-default'
                    : isReadyToVerify
                    ? 'bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white'
                    : 'bg-slate-100 dark:bg-[#16222F] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {hasSubscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />
                    <span>{campaign.platform === 'instagram' ? 'Following' : 'Subscribed'}</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-3.5 h-3.5 text-deep-ocean dark:text-matcha-green" />
                    <span>
                      {campaign.platform === 'instagram' 
                        ? `Follow (+${campaign.rewardBugs} BUGs)` 
                        : `Subscribe (+${campaign.rewardBugs} BUGs)`}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Like & Share */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-subtle">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-[#16222F] transition-colors cursor-pointer ${
                    hasLiked ? 'text-deep-ocean dark:text-matcha-green' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{likesCount.toLocaleString()}</span>
                </button>
                <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />
                <button className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#16222F] transition-colors cursor-pointer">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#131D28] hover:bg-slate-200 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-subtle"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedUrl ? 'Copied' : 'Share'}</span>
              </button>
            </div>

          </div>

          {/* Description Box */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 space-y-2 text-xs md:text-sm shadow-card">
            <div className="flex items-center gap-3 font-mono text-slate-500 dark:text-slate-400 text-xs">
              <span>{campaign.viewsCount.toLocaleString()} views</span>
              <span>•</span>
              <span>{campaign.uploadedAt}</span>
              <span>•</span>
              <span className="text-deep-ocean dark:text-matcha-green font-bold uppercase">{campaign.category}</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {campaign.description}
            </p>
          </div>

          {/* Comments Section */}
          <div className="space-y-3.5 pt-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <span>Verified Viewer Thoughts</span>
              <span className="text-xs text-slate-400 font-normal">
                ({comments.length})
              </span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Post verified feedback on this video..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 transition-colors pr-10 shadow-subtle"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-2 p-1 text-deep-ocean dark:text-matcha-green disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-2">
              {comments.map((comm) => (
                <div key={comm.id} className="flex gap-2.5 p-3 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800/80 shadow-subtle">
                  <img
                    src={comm.avatar}
                    alt={comm.author}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900 dark:text-white">{comm.author}</span>
                      {comm.verified && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 font-mono text-[9px] uppercase font-bold">
                          <Check className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">{comm.time}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Sidebar Recommended Tasks (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
            <h3 className="font-bold text-xs uppercase text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-deep-ocean dark:text-matcha-green" />
              <span>Next Tasks in Queue</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{recommendedTasks.length} queued</span>
          </div>

          <div className="space-y-2.5">
            {recommendedTasks.slice(0, 7).map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectCampaign(rec)}
                className="flex gap-2.5 p-2 rounded-xl bg-white dark:bg-[#131D28] hover:bg-slate-50 dark:hover:bg-[#16222F] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-subtle group"
              >
                <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                  <img
                    src={rec.thumbnailUrl || `https://img.youtube.com/vi/${rec.youtubeId}/hqdefault.jpg`}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-slate-300">
                    {rec.watchDurationSec === 180 ? '3 Min' : `${rec.watchDurationSec || 180}s`}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-deep-ocean dark:group-hover:text-matcha-green line-clamp-2 leading-tight">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{rec.channelName}</p>
                  
                  <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                    <span className="text-emerald-700 dark:text-[#C7DFA3] font-bold">
                      +{rec.rewardBugs} BUGs
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {rec.currentProgress}/{rec.targetSubscribers}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Promotional Tasks Not Available Modal */}
      {isNotAvailableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-black/85 backdrop-blur-xs animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
          <div 
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131D28] border border-amber-300 dark:border-amber-700/60 p-6 shadow-elevated space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-subtle">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                Promotional Showcase Task
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Tasks Not Available
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Yeh task platform par new users ko attract karne aur attention system ka showcase dikhane ke liye add kiya gaya hai. Is showcase task ki reward quota limit poori ho chuki hai (Tasks Not Available).
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-1">
                <p className="font-semibold text-deep-ocean dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />
                  Real BUGs (₹1 INR) kaise earn karein?
                </p>
                <p>Task Directory me jakar registered platform creators ke banaye gaye real tasks ko watch aur verify karein. Un sabhi par instant live payouts available hain!</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setIsNotAvailableModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsNotAvailableModalOpen(false);
                  onBackToFeed();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Browse Community Tasks</span>
                <ArrowRight className="w-3.5 h-3.5 text-matcha-green" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
