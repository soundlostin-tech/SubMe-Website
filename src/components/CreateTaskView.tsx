import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  Coins, 
  Check, 
  Tv, 
  Image as ImageIcon,
  Sparkles,
  Play,
  Clock
} from 'lucide-react';
import { Campaign, UserProfile } from '../types';
import { playSuccessFanfare } from '../utils/audio';

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

interface CreateTaskViewProps {
  user: UserProfile;
  onCreateCampaign: (newCampaign: Campaign, totalCost: number) => void;
  onNavigate: (tabId: string) => void;
  campaigns?: Campaign[];
}

export const CreateTaskView: React.FC<CreateTaskViewProps> = ({
  user,
  onCreateCampaign,
  onNavigate,
  campaigns = [],
}) => {
  const [platform, setPlatform] = useState<'youtube' | 'instagram'>('youtube');
  const [isShort, setIsShort] = useState<boolean>(false);
  const [instaActionType, setInstaActionType] = useState<'follow_and_like' | 'follow_only' | 'like_reel'>('follow_and_like');
  
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [channelName, setChannelName] = useState<string>(user.name || '');

  // Computed platform helpers
  const isLongVideo = platform === 'youtube' && !isShort;
  const isShortsVideo = platform === 'youtube' && isShort;
  const isInstagram = platform === 'instagram';

  // Targets & Budget
  const [targetSubscribers, setTargetSubscribers] = useState<number>(50);
  const [isVip, setIsVip] = useState<boolean>(false);
  const watchDurationSec = 180; // Fixed 3 Minutes (180s) across all content types
  const rewardBugs = 5; // Fixed 5 BUGs reward per task completion
  // Pricing: Standard task = 50 BUGs, VIP task = 200 BUGs (Top priority pinned)
  const totalCost = isVip ? 200 : 50;
  const isBalanceSufficient = user.bugBalance >= totalCost;
  
  // Verification quiz
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const extractYouTubeId = (url: string): string => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const extractInstagramCode = (url: string): string => {
    if (!url) return '';
    const match = url.match(/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : '';
  };

  const detectedYtId = platform === 'youtube' ? extractYouTubeId(videoUrl) : '';
  const detectedInstaCode = platform === 'instagram' ? extractInstagramCode(videoUrl) : '';

  useEffect(() => {
    if (platform === 'youtube' && detectedYtId) {
      setThumbnailUrl(`https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`);
    } else if (platform === 'instagram' && detectedInstaCode) {
      setThumbnailUrl(`https://www.instagram.com/p/${detectedInstaCode}/media/?size=l`);
    } else {
      setThumbnailUrl('');
    }
  }, [platform, detectedYtId, detectedInstaCode]);

  const handleTypeChange = (p: 'youtube' | 'instagram', shortFlag: boolean = false) => {
    setPlatform(p);
    setIsShort(shortFlag);
    setErrorMsg(null);
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleDeploy = () => {
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a campaign headline/title.');
      return;
    }

    if (!videoUrl.trim()) {
      setErrorMsg('Please provide a video link.');
      return;
    }

    if (platform === 'youtube' && !detectedYtId) {
      setErrorMsg('Please enter a valid YouTube video or shorts link.');
      return;
    }

    if (!question.trim()) {
      setErrorMsg('Please formulate an attention-verification MCQ question.');
      return;
    }

    const validOptions = options.map(o => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      setErrorMsg('Please provide at least 2 distinct multiple choice options.');
      return;
    }

    if (!isBalanceSufficient) {
      setErrorMsg(`Insufficient BUGs balance. Required: ₹${totalCost}, Available: ₹${user.bugBalance}`);
      return;
    }

    const finalYtId = detectedYtId || (platform === 'youtube' ? 'dQw4w9WgXcQ' : '');
    const autoDetectedThumbnail = platform === 'youtube' && detectedYtId
      ? `https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`
      : platform === 'instagram' && detectedInstaCode
      ? `https://www.instagram.com/p/${detectedInstaCode}/media/?size=l`
      : (thumbnailUrl || (finalYtId ? `https://img.youtube.com/vi/${finalYtId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80'));

    const taskDescription = isInstagram
      ? `Instagram ${instaActionType === 'follow_only' ? 'Follow' : instaActionType === 'like_reel' ? 'Like' : 'Follow & Like'} task deployed by ${user.name}. Open Instagram, engage authentically, and complete verification.`
      : isShortsVideo
      ? `Shorts task deployed by ${user.name}. Watch authentic vertical short and verify.`
      : `Task deployed by ${user.name}. Watch authentic duration and pass anti-cheat verification.`;

    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      youtubeId: finalYtId,
      videoUrl: videoUrl.trim(),
      title: title.trim(),
      channelName: channelName.trim() || user.name || (isInstagram ? 'Instagram Creator' : 'Verified Creator'),
      channelAvatar: user.avatar,
      channelId: `ch_${Date.now()}`,
      subscribersCount: user.channelSubscribers || 1000,
      currentProgress: 0,
      targetSubscribers,
      rewardBugs,
      watchDurationSec,
      thumbnailUrl: autoDetectedThumbnail,
      platform,
      isShort,
      question: question.trim(),
      options: options.map(o => o.trim() || 'Option'),
      correctAnswerIndex,
      isVip,
      category: platform === 'instagram' ? 'Reels' : isShort ? 'Shorts' : 'YouTube Video',
      viewsCount: 0,
      likesCount: 0,
      uploadedAt: 'Just now',
      status: 'active',
      description: taskDescription,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Live for strictly 24 hours
      creatorId: user.id,
    };

    onCreateCampaign(newCamp, totalCost);
    playSuccessFanfare();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#31465A', '#C7DFA3', '#89B9E6', '#ffffff'],
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onNavigate('tasks');
    }, 1800);
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] text-deep-ocean dark:text-slate-100 min-h-full transition-colors max-w-7xl mx-auto">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-deep-ocean dark:text-slate-100">
              Watch Task Creator Studio
            </h1>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#C7DFA3] border border-emerald-200 dark:border-emerald-800/60 uppercase">
              ENGINE V2
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure video duration, rewards, anti-cheat MCQ questions, and launch tasks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D28] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-subtle transition-colors cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <span>View All Tasks ({campaigns.length})</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Studio Grid (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Card 1: 1. CONTENT SOURCE & PLATFORM (STEP 1 OF 2) */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-deep-ocean dark:text-slate-100">
                1. CONTENT SOURCE &amp; PLATFORM
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                STEP 1 OF 2
              </span>
            </div>

            {/* Platform Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Platform
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-50 dark:bg-[#16222F] border border-slate-200 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => handleTypeChange('youtube', false)}
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    platform === 'youtube' && !isShort
                      ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-deep-ocean dark:hover:text-white'
                  }`}
                >
                  <YouTubeIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>YouTube Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('youtube', true)}
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    platform === 'youtube' && isShort
                      ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-deep-ocean dark:hover:text-white'
                  }`}
                >
                  <YouTubeShortsIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>YouTube Shorts</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('instagram', false)}
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    platform === 'instagram'
                      ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-deep-ocean dark:hover:text-white'
                  }`}
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram Reel</span>
                </button>
              </div>
            </div>

            {/* Campaign Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isInstagram ? 'Instagram Reel Title / Headline' : isShortsVideo ? 'YouTube Shorts Title' : 'Campaign Title'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isInstagram ? 'e.g. My New Aesthetic Reel Drop 2026' : isShortsVideo ? 'e.g. Crazy Gaming Clutches in 30s' : 'e.g. Watch New Tech Review 2026'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-deep-ocean dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
              />
            </div>

            {/* Video URL & Channel Profile URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isInstagram ? 'Instagram Reel / Post URL' : isShortsVideo ? 'YouTube Shorts URL' : 'YouTube Video URL'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder={
                    isInstagram
                      ? 'https://www.instagram.com/reel/...'
                      : isShortsVideo
                      ? 'https://www.youtube.com/shorts/...'
                      : 'https://www.youtube.com/watch?v=...'
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-deep-ocean dark:text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isInstagram ? 'Instagram Handle / Profile URL (optional)' : 'Channel / Creator Profile URL (optional)'}
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder={isInstagram ? 'https://instagram.com/username or @username' : 'https://youtube.com/@channelname'}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-deep-ocean dark:text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
                />
              </div>
            </div>

            {/* Automatic Video Thumbnail & Frame Detection (No upload needed) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Automatic Video Thumbnail &amp; Preview Frame</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-[#C7DFA3] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40 font-bold">
                  Auto From Video
                </span>
              </div>

              {(detectedYtId || detectedInstaCode) ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                  <div className={`relative ${isInstagram || isShortsVideo ? 'w-16 aspect-[9/16]' : 'w-28 aspect-video'} bg-black rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-subtle`}>
                    {platform === 'youtube' ? (
                      <img
                        src={`https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`}
                        alt="YouTube Video Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${detectedYtId}/0.jpg`;
                        }}
                      />
                    ) : (
                      <img
                        src={`https://www.instagram.com/p/${detectedInstaCode}/media/?size=l`}
                        alt="Instagram Reel Cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-emerald-400">
                      AUTO
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{platform === 'youtube' ? 'YouTube Video Thumbnail Detected' : 'Instagram Reel Video Detected'}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {platform === 'youtube' 
                        ? `Video ID: ${detectedYtId} • Official high-res thumbnail auto-extracted from YouTube.` 
                        : `Reel Code: ${detectedInstaCode} • Reel cover and video frame automatically attached.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#0E1620]/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste your {platform === 'instagram' ? 'Instagram Reel' : isShortsVideo ? 'YouTube Short' : 'YouTube Video'} link above to auto-capture the official thumbnail and video frame.
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    No manual thumbnail upload needed — platform captures it automatically from your video.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: 2. ATTENTION VERIFICATION QUIZ (STEP 2 OF 2) */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-deep-ocean dark:text-slate-100">
                2. ATTENTION VERIFICATION QUIZ
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                STEP 2 OF 2
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isInstagram 
                ? 'Followers must answer this question to verify they actually opened your Instagram and engaged.'
                : isShortsVideo 
                ? 'Shorts viewers must answer a quick detail from this vertical short to prove active attention.' 
                : 'Viewers must answer this question after watching your full video to prove authentic human attention.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Question <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  isInstagram 
                    ? 'e.g. What is our Instagram bio tagline or reel hook?'
                    : isShortsVideo 
                    ? 'e.g. What item was revealed at the end of the Short?'
                    : 'e.g. What color car did we steal at minute 2?'
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-deep-ocean dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Answer Options (Select the correct radio button)
              </label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={correctAnswerIndex === idx}
                      onChange={() => setCorrectAnswerIndex(idx)}
                      className="w-4 h-4 text-deep-ocean dark:text-slate-400 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}${correctAnswerIndex === idx ? ' (Correct Answer)' : ''}`}
                      className={`flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0E1620] border rounded-lg text-deep-ocean dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-colors ${
                        correctAnswerIndex === idx 
                          ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Visibility Tier: Standard (50 BUGs) vs VIP Spotlight (200 BUGs) */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs sm:text-sm font-bold text-deep-ocean dark:text-slate-100 uppercase font-mono">
                  Task Placement &amp; Visibility Tier
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">1 BUG = ₹1 INR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Standard Task Tier (50 BUGs) */}
              <div
                onClick={() => setIsVip(false)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                  !isVip
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-deep-ocean dark:border-slate-400 shadow-subtle ring-1 ring-deep-ocean dark:ring-slate-400'
                    : 'bg-slate-50 dark:bg-[#0E1620] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase text-slate-700 dark:text-slate-200">
                    Standard Task
                  </span>
                  <span className="text-xs font-bold font-mono text-deep-ocean dark:text-slate-100">
                    50 BUGs (₹50)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Task directory aur regular feed placement me live hoga.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${!isVip ? 'text-deep-ocean dark:text-slate-200' : 'text-slate-400'}`} />
                  <span>Regular priority listing</span>
                </div>
              </div>

              {/* VIP Spotlight Tier (200 BUGs) */}
              <div
                onClick={() => setIsVip(true)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden select-none ${
                  isVip
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500 shadow-subtle ring-1 ring-amber-500'
                    : 'bg-slate-50 dark:bg-[#0E1620] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>VIP Spotlight</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400">
                    200 BUGs (₹200)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  <strong className="text-amber-700 dark:text-amber-300">Sabse top par pinned</strong> rahega taaki users sabse pahle aapka task poora karein!
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Top Priority Pinned</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Guidelines & Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Anti-Cheat Guidelines Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 font-sans">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-deep-ocean dark:text-slate-100 uppercase font-mono">
                {isInstagram ? 'Instagram Guidelines' : isShortsVideo ? 'Shorts Guidelines' : 'Anti-Cheat Guidelines'}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isInstagram ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">Real Followers &amp; Likes:</strong> Viewers directly open your Instagram profile to follow and like.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">15s-30s Quick Verification:</strong> Viewers spend active time before answering the attention quiz.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">Zero Bots:</strong> Powered by cryptographic nonce validation to protect your balance.
                    </p>
                  </div>
                </>
              ) : isShortsVideo ? (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">3 Minutes Retention:</strong> Full 3 minutes (180s) watch ensures maximum engagement and algorithmic boost.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">Climax MCQ Question:</strong> Ask a question about the punchline or ending of the Short.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">Anti-Skip Nonce:</strong> Players cannot fast-forward through the vertical short.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">3 Minutes Watch Duration:</strong> Mandatory 3 minutes (180s) watch ensures authentic view-through verification.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">Specific MCQ questions:</strong> Ask about a detail occurring in the second half of the video.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <p>
                      <strong className="text-deep-ocean dark:text-white font-semibold">Reward calibration:</strong> Standard tasks give 1 BUG per authentic watch.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Live Feed Card Preview */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-deep-ocean dark:text-slate-100">
                Live Feed Preview
              </span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-[#C7DFA3] bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                Real-time
              </span>
            </div>

            {/* Simulated Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0E1620] overflow-hidden shadow-subtle">
              <div className={`relative ${isInstagram || isShortsVideo ? 'aspect-[9/16] max-h-72 mx-auto' : 'aspect-video'} w-full bg-slate-900 overflow-hidden`}>
                {platform === 'youtube' && detectedYtId ? (
                  <img
                    src={`https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${detectedYtId}/0.jpg`;
                    }}
                  />
                ) : platform === 'instagram' && detectedInstaCode ? (
                  <iframe
                    src={`https://www.instagram.com/reel/${detectedInstaCode}/embed/`}
                    title="Instagram Reel Preview"
                    className="w-full h-full border-0 pointer-events-none scale-105"
                    scrolling="no"
                  />
                ) : thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                    <Play className="w-6 h-6 mb-1 opacity-50 text-slate-400" />
                    <span className="font-semibold text-slate-400">Video Frame Preview</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Enter video URL to display thumbnail &amp; video frame</span>
                  </div>
                )}

                {isVip && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-mono font-bold uppercase shadow-subtle flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>VIP PINNED</span>
                  </span>
                )}

                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[#C7DFA3] border border-white/20 text-[10px] font-mono font-bold backdrop-blur-xs">
                  +5 BUGs
                </span>

                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300">
                  3 min (180s)
                </span>
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar}
                    alt={channelName}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {channelName || (isInstagram ? 'Your Instagram Handle' : 'Your Channel')}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                </div>

                <p className="text-xs font-bold text-deep-ocean dark:text-slate-100 line-clamp-2">
                  {title || (isInstagram ? 'Instagram Reel Title Preview' : isShortsVideo ? 'Shorts Video Headline Preview' : 'Campaign Video Headline Preview')}
                </p>

                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">
                    Goal: 0 / {targetSubscribers} {isInstagram ? 'Followers' : isShortsVideo ? 'Views' : 'Subs'}
                  </span>
                  <span className="text-emerald-600 dark:text-[#C7DFA3] font-bold">
                    {isInstagram ? 'Follow & Earn' : isShortsVideo ? 'Watch Short' : 'Watch & Earn'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Launch Campaign Summary & Button */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Live Duration:</span>
              <span className="font-bold text-emerald-600 dark:text-[#C7DFA3] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                24 Hours Live Window
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Placement Tier:</span>
              <span className={`font-bold ${isVip ? 'text-amber-600 dark:text-amber-400' : 'text-deep-ocean dark:text-white'}`}>
                {isVip ? 'VIP Spotlight (Top Pinned)' : 'Standard Task'}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Live Deployment Cost:</span>
              <span className="font-bold text-deep-ocean dark:text-white">{totalCost} BUGs (₹{totalCost})</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Your Balance:</span>
              <span className={`font-bold ${isBalanceSufficient ? 'text-emerald-600 dark:text-[#C7DFA3]' : 'text-rose-500'}`}>
                {user.bugBalance} BUGs
              </span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-[#C7DFA3] text-xs font-bold font-sans">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Task deployed successfully! Redirecting...</span>
              </div>
            )}

            {!isBalanceSufficient ? (
              <button
                type="button"
                onClick={() => onNavigate('wallet')}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider shadow-subtle transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Coins className="w-4 h-4" />
                <span>Top-Up Liquid Vault (Need {totalCost - user.bugBalance} BUGs)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isSuccess}
                className="w-full py-2.5 px-4 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white font-semibold text-xs uppercase tracking-wider shadow-subtle transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Launch Campaign ({totalCost} BUGs)</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
