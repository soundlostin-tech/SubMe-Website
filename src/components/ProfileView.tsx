import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  CheckCircle2, 
  Coins, 
  Copy, 
  Check, 
  Gift, 
  Sun, 
  Moon, 
  LogOut,
  Sparkles, 
  ShieldCheck, 
  Award, 
  Database, 
  ExternalLink,
  Users,
  Tv,
  CheckCircle
} from 'lucide-react';
import { UserProfile, Campaign } from '../types';
import { SUPABASE_PROJECT_ID } from '../lib/supabase';
import { getYouTubeAvatarUrl, extractYouTubeHandle } from '../utils/youtubeAvatar';

interface ProfileViewProps {
  user: UserProfile;
  campaigns: Campaign[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onSimulateReferral: () => void;
  onNavigate: (tabId: string) => void;
  onLogout?: () => void;
  onOpenSupabase?: () => void;
  isSupabaseLive?: boolean;
  onUpdateChannelUrl?: (newUrl: string, newAvatar: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  campaigns,
  theme,
  toggleTheme,
  onSimulateReferral,
  onLogout,
  onOpenSupabase,
  isSupabaseLive = false,
  onUpdateChannelUrl,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bountyTriggered, setBountyTriggered] = useState(false);

  // YouTube Channel URL & Logo updater state
  const [channelUrlInput, setChannelUrlInput] = useState(user.channelUrl || '');
  const [isUpdatingChannel, setIsUpdatingChannel] = useState(false);
  const [channelUpdateMsg, setChannelUpdateMsg] = useState<string | null>(null);

  const detectedLogoUrl = getYouTubeAvatarUrl(channelUrlInput || user.handle, user.name);

  const handleApplyChannelLogo = () => {
    if (!channelUrlInput.trim()) return;
    setIsUpdatingChannel(true);
    const newAvatar = getYouTubeAvatarUrl(channelUrlInput, user.name);

    if (onUpdateChannelUrl) {
      onUpdateChannelUrl(channelUrlInput.trim(), newAvatar);
    }

    setTimeout(() => {
      setIsUpdatingChannel(false);
      setChannelUpdateMsg('YouTube Channel Logo successfully set as your official PFP!');
      setTimeout(() => setChannelUpdateMsg(null), 3000);
    }, 600);
  };

  const referralLink = `https://subme.grow/invite/${user.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTestReferral = () => {
    onSimulateReferral();
    setBountyTriggered(true);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#31465A', '#89B9E6', '#C7DFA3', '#ffffff'],
    });

    setTimeout(() => setBountyTriggered(false), 3000);
  };

  const myCampaigns = campaigns.filter(c => c.creatorId === user.id || c.channelName === user.name);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] text-slate-800 dark:text-slate-100 min-h-full transition-colors max-w-5xl mx-auto">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-deep-ocean dark:text-white">
              Creator Profile &amp; Governance
            </h1>
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60">
              Reputation: {user.reputationScore}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personal identity telemetry, audience statistics, referral rewards, and theme preferences.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D28] text-xs font-mono font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-subtle"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-xs font-mono font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{user.role === 'admin' ? 'Exit Admin' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Creator Identity Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-subtle"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-deep-ocean dark:bg-slate-700 flex items-center justify-center text-white border border-slate-200 dark:border-slate-600">
              <Check className="w-3 h-3 stroke-[2.5] text-matcha-green" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-matcha-green" />
              {user.role === 'admin' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{user.handle} &bull; {user.email || 'Online'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#16222F] text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Verified Creator &amp; Viewer
              </span>
              <span className="px-2 py-0.5 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] text-[10px] font-mono font-bold border border-matcha-green/50 dark:border-emerald-800/60">
                Reputation: {user.reputationScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official YouTube Channel Logo (PFP) Sync Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-deep-ocean dark:text-slate-100">
              Official YouTube Channel Logo &amp; PFP Sync
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Real-time avatar resolved from YouTube
          </span>
        </div>

        {channelUpdateMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-emerald-700 dark:text-[#C7DFA3] text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{channelUpdateMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 shadow-subtle flex items-center justify-center">
            <img
              src={detectedLogoUrl}
              alt="Channel Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = user.avatar;
              }}
            />
          </div>

          <div className="flex-1 w-full space-y-1">
            <div className="relative">
              <Tv className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="url"
                value={channelUrlInput}
                onChange={(e) => setChannelUrlInput(e.target.value)}
                placeholder="e.g. https://youtube.com/@yourchannel or @handle"
                className="w-full pl-9 pr-28 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
              />
              <button
                type="button"
                onClick={handleApplyChannelLogo}
                disabled={isUpdatingChannel || !channelUrlInput.trim()}
                className="absolute right-1.5 top-1 px-3 py-1 rounded-md bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white text-[11px] font-semibold transition-all cursor-pointer shadow-subtle disabled:opacity-50"
              >
                {isUpdatingChannel ? 'Syncing...' : 'Set as PFP'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Paste your YouTube channel link to automatically set your official YouTube profile picture as your site PFP.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Liquid Balance */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Liquid Balance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
              <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{user.bugBalance} BUGs</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">₹{user.bugBalance} INR Liquid Value</p>
          </div>
          <div className="pt-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 text-[10px] font-mono font-bold uppercase">
              Ready to spend
            </span>
          </div>
        </div>

        {/* Card 2: Channel Audience */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Channel Audience</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-airy-blue" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{user.channelSubscribers.toLocaleString()}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Real verified viewers</p>
          </div>
          <div className="pt-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-airy-blue border border-blue-200 dark:border-blue-900/40 text-[10px] font-mono font-bold uppercase">
              Subscribers
            </span>
          </div>
        </div>

        {/* Card 3: Tasks Completed */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Tasks Completed</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#16222F] flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <CheckCircle className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{user.completedTasksCount}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Attention verified rewards</p>
          </div>
          <div className="pt-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#16222F] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold uppercase">
              Verified watches
            </span>
          </div>
        </div>

        {/* Card 4: Active Campaigns */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">My Campaigns</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center border border-amber-200 dark:border-amber-800/50">
              <Tv className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{myCampaigns.length}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Running creator promotions</p>
          </div>
          <div className="pt-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-[10px] font-mono font-bold uppercase">
              Live tasks
            </span>
          </div>
        </div>

      </div>

      {/* 4. Referral Program Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-deep-ocean dark:text-matcha-green" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono">
              Creator Referral Program (+5 BUGs Bounty)
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60">
            Active Bounty
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Share your referral code or direct invite link with creators and viewers. Whenever someone joins using your code and completes their first watch task, you earn +5 BUGs (₹5) credited instantly to your vault.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Referral Code */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Your Referral Code</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white tracking-wider">
                {user.referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-mono text-deep-ocean dark:text-matcha-green font-semibold hover:underline cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Direct Invite Link */}
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Direct Invite Link</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-xs font-mono text-deep-ocean dark:text-matcha-green font-semibold hover:underline cursor-pointer shrink-0 ml-2"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Test Referral Simulator */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 font-mono">
            {bountyTriggered ? '🎉 Referral activated! +5 BUGs (₹5) credited.' : 'Test referral activation simulator:'}
          </span>
          <button
            onClick={handleTestReferral}
            className="px-3.5 py-1.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-subtle border border-slate-600"
          >
            <Sparkles className="w-3.5 h-3.5 text-matcha-green" />
            <span>Simulate Friend Join (+5 BUGs)</span>
          </button>
        </div>
      </div>

      {/* 5. Supabase Cloud Database Integration Card */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] space-y-4 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isSupabaseLive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-slate-100 dark:bg-[#16222F] text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Supabase Cloud Integration</span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md border ${
                  isSupabaseLive
                    ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                }`}>
                  {isSupabaseLive ? 'Connected' : 'Setup / Key Needed'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Project: <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{SUPABASE_PROJECT_ID}</code> (https://{SUPABASE_PROJECT_ID}.supabase.co)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle"
            >
              <span>Supabase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {onOpenSupabase && (
              <button
                onClick={onOpenSupabase}
                className="px-3.5 py-1.5 bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-semibold font-mono text-xs rounded-lg transition-colors cursor-pointer shadow-subtle"
              >
                Manage Credentials
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
