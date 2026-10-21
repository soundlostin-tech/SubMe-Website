import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
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
  Check,
  ExternalLink,
  Lock,
  Unlock,
  Copy,
  Award,
  Zap
} from 'lucide-react';
import { Campaign, UserProfile } from '../types';
import { computeAttentionHash, generateNonce } from '../utils/crypto';
import { playSuccessFanfare, playCoinSound, playTickSound } from '../utils/audio';
import { isPromotionalCampaign } from '../utils/campaignHelper';

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

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
  onVerificationSuccess?: (campaign: Campaign, reward: number, hash: string) => void;
  onBackToFeed: () => void;
  hasSubscribed: boolean;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  campaign,
  allCampaigns,
  user,
  onSelectCampaign,
  onTriggerVerification,
  onVerificationSuccess,
  onBackToFeed,
  hasSubscribed,
}) => {
  // Timer & active tab state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(campaign.watchDurationSec || 180);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isTabFocused, setIsTabFocused] = useState<boolean>(true);
  const [isReadyToVerify, setIsReadyToVerify] = useState<boolean>(false);
  const [sessionNonce, setSessionNonce] = useState<string>('');

  // 2-Step Verification Gatekeeper State:
  // Step 1: User must click subscribe/follow to open creator's channel on YT/IG
  // Step 2: MCQ question unlocks ONLY after Step 1 is clicked
  const [hasClickedSubscribe, setHasClickedSubscribe] = useState<boolean>(hasSubscribed);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isClaimed, setIsClaimed] = useState<boolean>(hasSubscribed);
  const [attentionHash, setAttentionHash] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Likes & Social
  const [likesCount, setLikesCount] = useState<number>(campaign.likesCount || 104);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isNotAvailableModalOpen, setIsNotAvailableModalOpen] = useState<boolean>(false);

  const verificationSectionRef = useRef<HTMLDivElement>(null);
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
      text: 'Watched the full 3 minutes, subscribed to the channel, and answered the creator quiz! Instant BUGs received.',
      time: '12m ago',
      verified: true,
    },
    {
      id: 'c2',
      author: 'Aman Verma',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      text: 'Super clean flow! Step 1 redirects to YouTube to subscribe, then Step 2 unlocks the MCQ.',
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
    setHasClickedSubscribe(hasSubscribed);
    setSelectedOption(null);
    setQuizError(null);
    setIsClaimed(hasSubscribed);
    setAttentionHash('');
  }, [campaign.id, hasSubscribed]);

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
          playSuccessFanfare();
          return 0;
        }
        playTickSound();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isPlaying, isTabFocused]);

  // Handle YouTube / Instagram Redirection & Unlock Step 2 MCQ
  const handleSubscribeRedirect = () => {
    let targetUrl = campaign.videoUrl;
    if (!targetUrl || targetUrl.trim() === '') {
      if (campaign.platform === 'instagram') {
        const cleanName = campaign.channelName.replace('@', '').trim();
        targetUrl = `https://www.instagram.com/${cleanName}`;
      } else if (campaign.youtubeId) {
        targetUrl = `https://www.youtube.com/watch?v=${campaign.youtubeId}`;
      } else {
        targetUrl = 'https://www.youtube.com';
      }
    }

    // Open creator's YouTube channel/video in new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // Mark subscribed & unlock Step 2 MCQ
    setHasClickedSubscribe(true);
    setQuizError(null);
    playTickSound();

    // Smooth scroll down to the MCQ quiz section
    setTimeout(() => {
      verificationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // Submit Answer to Creator's MCQ Quiz
  const handleSubmitQuiz = async () => {
    if (selectedOption === null) {
      setQuizError('Please select an answer option above.');
      return;
    }

    if (selectedOption !== campaign.correctAnswerIndex) {
      setQuizError('Incorrect answer. Please re-check the video and choose the correct answer to verify attention.');
      return;
    }

    setQuizError(null);
    setIsSubmittingQuiz(true);

    const timestamp = Date.now();
    const hash = await computeAttentionHash({
      campaignId: campaign.id,
      viewerId: user.id,
      nonce: sessionNonce,
      timestamp,
      watchDurationSec: campaign.watchDurationSec || 180,
      answerIndex: selectedOption,
    });

    setTimeout(() => {
      setIsSubmittingQuiz(false);
      setIsClaimed(true);
      setAttentionHash(hash);

      playSuccessFanfare();
      playCoinSound();

      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#31465A', '#89B9E6', '#C7DFA3', '#ffffff', '#10B981'],
      });

      if (onVerificationSuccess) {
        onVerificationSuccess(campaign, campaign.rewardBugs, hash);
      }
    }, 800);
  };

  const handleCopyHash = () => {
    if (!attentionHash) return;
    navigator.clipboard.writeText(attentionHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

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
        verified: isClaimed || hasSubscribed,
      },
      ...comments,
    ]);
    setNewComment('');
  };

  const duration = campaign.watchDurationSec || 180;
  const progressPercentage = Math.round(((duration - secondsRemaining) / duration) * 100);
  const recommendedTasks = allCampaigns.filter((c) => c.id !== campaign.id);

  return (
    <div className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl mx-auto space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] text-slate-800 dark:text-slate-100 min-h-full transition-colors font-['Plus_Jakarta_Sans',sans-serif]">
      
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
            <span>Attention Verification Engine</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Main Watch Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Player Frame */}
          {campaign.platform === 'instagram' ? (
            <div className="relative w-full max-w-sm mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
              {(() => {
                const instaCode = campaign.videoUrl?.match(/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i)?.[1];
                return instaCode ? (
                  <div className="relative w-full h-full flex flex-col justify-between">
                    <iframe
                      src={`https://www.instagram.com/reel/${instaCode}/embed/`}
                      title={campaign.title}
                      className="w-full h-full border-0"
                      allowFullScreen
                      scrolling="no"
                    />
                    <div className="absolute top-2 right-2 z-20">
                      <a
                        href={campaign.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-pink-600/90 hover:bg-pink-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-subtle backdrop-blur-xs"
                      >
                        <span>Open App</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={campaign.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80'}
                      alt={campaign.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/50 pointer-events-none" />

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

                    <div className="relative z-10 mx-auto w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                      <InstagramIcon className="w-6 h-6 text-pink-400" />
                    </div>

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
                  </>
                );
              })()}
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
            isClaimed
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50 dark:border-emerald-700/60'
              : isReadyToVerify
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
                  {isClaimed ? (
                    <span className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 dark:text-[#C7DFA3] uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#C7DFA3]" />
                      TASK VERIFIED &amp; REWARD CLAIMED (+{campaign.rewardBugs} BUGs)
                    </span>
                  ) : !isReadyToVerify ? (
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
                      3-MIN WATCH COMPLETE • READY FOR VERIFICATION
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isClaimed
                    ? `Great job! You have completed watching, subscribed to ${campaign.channelName}, and verified the quiz.`
                    : isReadyToVerify
                    ? isPromotional
                      ? 'Yeh showcase task user attention aur platform preview ke liye hai. Is task ki reward quota complete ho chuki hai.'
                      : '3 minutes completed! Follow Step 1 below to subscribe on YouTube, then answer the creator\'s MCQ quiz in Step 2 to claim your BUGs.'
                    : !isTabFocused
                    ? 'Anti-cheat paused the timer. Return to this tab to resume watch verification.'
                    : `Watch for ${formatDuration(secondsRemaining)} (${secondsRemaining}s) more. Channel subscription and MCQ quiz will unlock below once completed.`}
                </p>

                {/* Progress Bar */}
                <div className="w-full sm:w-80 h-1.5 bg-slate-100 dark:bg-[#0E1620] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 mt-2">
                  <div
                    className={`h-full transition-all duration-300 ${isClaimed ? 'bg-emerald-500' : 'bg-deep-ocean dark:bg-slate-500'}`}
                    style={{ width: `${isClaimed ? 100 : progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Trigger Badge / Button */}
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
                ) : isClaimed ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#C7DFA3] font-mono font-bold text-xs uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#C7DFA3]" />
                    <span>+{campaign.rewardBugs} BUGs Claimed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      verificationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-mono font-semibold text-xs uppercase tracking-wider border border-slate-600 cursor-pointer active:scale-95 transition-all shadow-subtle animate-pulse"
                  >
                    <Coins className="w-4 h-4 text-matcha-green" />
                    <span>Step 1: Subscribe &amp; Quiz ↓</span>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* 🎯 DEDICATED INLINE CREATOR SUBSCRIPTION & MCQ VERIFICATION DESK */}
          <div 
            ref={verificationSectionRef}
            id="task-mcq-section"
            className={`p-5 rounded-2xl border transition-all shadow-card space-y-6 ${
              isClaimed
                ? 'bg-emerald-50/30 dark:bg-[#0E1A17] border-emerald-500/50 dark:border-emerald-700/60'
                : isReadyToVerify
                ? 'bg-white dark:bg-[#131D28] border-slate-300 dark:border-slate-700 ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-[#131D28] border-slate-200 dark:border-slate-800 opacity-90'
            }`}
          >
            {/* Desk Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isClaimed
                    ? 'bg-emerald-500 text-white'
                    : isReadyToVerify
                    ? 'bg-deep-ocean dark:bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isClaimed ? <Check className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-tight flex items-center gap-2">
                    <span>Task Verification &amp; Reward Desk</span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#C7DFA3] border border-emerald-200 dark:border-emerald-800/60">
                      +{campaign.rewardBugs} BUGs (₹{campaign.rewardBugs})
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {isClaimed
                      ? '✓ Attention Proof Verified & Settled to your wallet.'
                      : isReadyToVerify
                      ? 'Step 1: Subscribe on YouTube/Instagram ➔ Step 2: Answer Creator Quiz'
                      : 'Watch video for 3 full minutes to unlock subscription & quiz.'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  isClaimed
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#C7DFA3] border-emerald-300'
                    : isReadyToVerify
                    ? hasClickedSubscribe
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}>
                  {isClaimed
                    ? 'Status: Verified'
                    : isReadyToVerify
                    ? hasClickedSubscribe
                      ? 'Step 2: Answer Quiz'
                      : 'Step 1: Subscribe Pending'
                    : 'Watch In Progress'}
                </span>
              </div>
            </div>

            {/* STEP 1: SUBSCRIBE TO CREATOR */}
            <div className={`p-4 rounded-xl border transition-all ${
              hasClickedSubscribe || isClaimed
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                : isReadyToVerify
                ? 'bg-slate-50/70 dark:bg-[#0E1620] border-slate-300 dark:border-slate-700 ring-1 ring-slate-400 dark:ring-slate-600'
                : 'bg-slate-50/40 dark:bg-[#0E1620]/40 border-slate-200 dark:border-slate-800/80 opacity-60'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={campaign.channelAvatar}
                      alt={campaign.channelName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      {campaign.platform === 'instagram' ? (
                        <InstagramIcon className="w-3 h-3 text-pink-500" />
                      ) : (
                        <YouTubeIcon className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs uppercase font-mono text-slate-500 dark:text-slate-400">
                        STEP 1 OF 2:
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {campaign.platform === 'instagram' ? 'Follow on Instagram' : 'Subscribe on YouTube'}
                      </span>
                      {(hasClickedSubscribe || isClaimed) && (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {campaign.channelName} &bull; {campaign.subscribersCount.toLocaleString()} {campaign.platform === 'instagram' ? 'Followers' : 'Subscribers'}
                    </p>
                  </div>
                </div>

                {/* Step 1 Action Button */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {hasClickedSubscribe || isClaimed ? (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{campaign.platform === 'instagram' ? 'Followed on Instagram' : 'Subscribed on YouTube'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSubscribeRedirect}
                        className="px-2 py-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
                        title="Re-open creator page"
                      >
                        <span>Re-open</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : isReadyToVerify ? (
                    <button
                      type="button"
                      onClick={handleSubscribeRedirect}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-card cursor-pointer transition-all active:scale-95"
                    >
                      {campaign.platform === 'instagram' ? (
                        <>
                          <InstagramIcon className="w-4 h-4 text-white" />
                          <span>Follow @{campaign.channelName} on Instagram</span>
                        </>
                      ) : (
                        <>
                          <YouTubeIcon className="w-4 h-4 text-white" />
                          <span>Subscribe to {campaign.channelName} on YouTube</span>
                        </>
                      )}
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-mono flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlocks after 3 min video</span>
                    </div>
                  )}
                </div>
              </div>

              {!hasClickedSubscribe && !isClaimed && isReadyToVerify && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-mono mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5">
                  <span className="font-bold">👉 Action Required:</span>
                  <span>Click the red button above to open {campaign.platform === 'instagram' ? 'Instagram' : 'YouTube'} and subscribe. The creator quiz will unlock below immediately!</span>
                </p>
              )}
            </div>

            {/* STEP 2: ATTENTION VERIFICATION QUIZ (MCQ) */}
            <div className={`p-4 sm:p-5 rounded-xl border transition-all ${
              isClaimed
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-800'
                : hasClickedSubscribe
                ? 'bg-white dark:bg-[#0E1620] border-emerald-500/50 dark:border-emerald-600/50 shadow-subtle'
                : 'bg-slate-50/50 dark:bg-[#0E1620]/30 border-slate-200 dark:border-slate-800/80 opacity-60'
            }`}>
              
              {/* Step 2 Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase font-mono text-slate-500 dark:text-slate-400">
                    STEP 2 OF 2:
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase font-mono">
                    Attention Verification Quiz (MCQ)
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {isClaimed ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#C7DFA3] border border-emerald-300">
                      ✓ Correct &amp; Claimed
                    </span>
                  ) : hasClickedSubscribe ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-[#C7DFA3] border border-emerald-500/30 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked (Subscribe in Step 1 first)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Locked Teaser View when not yet subscribed */}
              {!hasClickedSubscribe && !isClaimed ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    MCQ Question is Hidden Until You Complete Step 1
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Creator ne task setup karte waqt attention MCQ configure kiya hai. Jaise hi aap upar Step 1 me channel ko subscribe karenge, ye question unlock ho jayega!
                  </p>
                </div>
              ) : isClaimed ? (
                /* Claimed Success Certificate View */
                <div className="pt-3 space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-emerald-700 dark:text-[#C7DFA3] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#C7DFA3]" />
                        <span>Attention Nonce Verified Successfully</span>
                      </span>
                      <span className="text-xs font-bold font-mono text-emerald-600 dark:text-[#C7DFA3]">
                        +{campaign.rewardBugs} BUGs
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                      Q: {campaign.question || 'Verified human attention challenge'}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                      Answer: {campaign.options?.[selectedOption ?? campaign.correctAnswerIndex] || 'Correct answer verified'}
                    </p>
                  </div>

                  {/* SHA-256 Attention Proof Hash */}
                  {attentionHash && (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>SHA-256 Attention Proof Hash:</span>
                        <button
                          type="button"
                          onClick={handleCopyHash}
                          className="flex items-center gap-1 text-emerald-600 hover:underline cursor-pointer"
                        >
                          {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedHash ? 'Copied' : 'Copy Proof'}</span>
                        </button>
                      </div>
                      <code className="block text-slate-900 dark:text-white font-bold break-all select-all">
                        {attentionHash}
                      </code>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onBackToFeed}
                      className="px-4 py-2 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Tasks Feed</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Unlocked Active MCQ Form View */
                <div className="pt-3 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-[#C7DFA3] font-bold uppercase tracking-wider block">
                      Creator's Attention Question:
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {campaign.question || 'What is the main topic covered in this video?'}
                    </p>
                  </div>

                  {/* MCQ Options List */}
                  <div className="space-y-2">
                    {campaign.options?.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedOption(idx);
                            setQuizError(null);
                          }}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-deep-ocean dark:text-white font-bold shadow-subtle ring-1 ring-emerald-500'
                              : 'bg-slate-50 dark:bg-[#131D28] hover:bg-slate-100 dark:hover:bg-[#16222F] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Error Alert */}
                  {quizError && (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{quizError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Answer correctly to mint {campaign.rewardBugs} BUGs (₹{campaign.rewardBugs}) to your wallet
                    </span>

                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={selectedOption === null || isSubmittingQuiz}
                      className="px-6 py-2.5 rounded-xl bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-card cursor-pointer transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingQuiz ? (
                        <span>Validating Nonce &amp; Computing Proof...</span>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 text-[#C7DFA3]" />
                          <span>Submit Answer &amp; Claim +{campaign.rewardBugs} BUGs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

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

              {/* Channel Subscribe Button */}
              <button
                onClick={handleSubscribeRedirect}
                className={`px-3.5 py-1.5 rounded-lg font-mono font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle ${
                  hasClickedSubscribe || hasSubscribed || isClaimed
                    ? 'bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {hasClickedSubscribe || hasSubscribed || isClaimed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />
                    <span>{campaign.platform === 'instagram' ? 'Following' : 'Subscribed'}</span>
                  </>
                ) : (
                  <>
                    {campaign.platform === 'instagram' ? (
                      <InstagramIcon className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <YouTubeIcon className="w-3.5 h-3.5 text-white" />
                    )}
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
