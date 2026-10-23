import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  User, 
  AtSign, 
  Tv, 
  ArrowRight, 
  Sun, 
  Moon, 
  Sparkles, 
  Gift,
  Coins,
  Play,
  Check,
  Smartphone,
  TrendingUp,
  HelpCircle,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { getYouTubeAvatarUrl, extractYouTubeHandle } from '../utils/youtubeAvatar';

interface AuthViewProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  registeredUsers: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: UserProfile, referralCode?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  theme,
  toggleTheme,
  registeredUsers,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup'); // Default to signup so new visitors see registration directly
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpHandle, setSignUpHandle] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpChannelUrl, setSignUpChannelUrl] = useState('');
  const [signUpReferralCode, setSignUpReferralCode] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('ref') || params.get('referral') || params.get('invite') || sessionStorage.getItem('pending_referral_code') || '';
    } catch (e) {
      return '';
    }
  });

  // Switch to signup mode automatically if a referral link is opened
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('referral') || params.get('invite') || sessionStorage.getItem('pending_referral_code');
      if (ref) {
        setSignUpReferralCode(ref.trim().toUpperCase());
        setMode('signup');
      }
    } catch (e) {}
  }, []);

  // Fixed Admin Credentials
  const FIXED_ADMIN_EMAIL = 'admin@subme.io';
  const FIXED_ADMIN_PASS = 'admin123';

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = signInEmail.trim().toLowerCase();
    const passwordTrimmed = signInPassword.trim();

    // 1. Check fixed Admin credentials
    if (
      (emailTrimmed === FIXED_ADMIN_EMAIL || emailTrimmed === 'admin@subme.com') &&
      passwordTrimmed === FIXED_ADMIN_PASS
    ) {
      const adminAccount = registeredUsers.find(u => u.role === 'admin') || {
        id: 'usr_admin_01',
        name: 'Platform Administrator',
        email: FIXED_ADMIN_EMAIL,
        password: FIXED_ADMIN_PASS,
        role: 'admin' as UserRole,
        handle: '@subme_admin',
        avatar: '/admin-avatar.png',
        bugBalance: 50000,
        channelSubscribers: 100000,
        referralCode: 'SUBME-ADMIN',
        completedTasksCount: 0,
        activeCampaignsCount: 9,
        reputationScore: 100,
        subscribedChannelIds: [],
      };
      setSuccessMsg('Welcome Administrator! Logging in...');
      setTimeout(() => onLogin(adminAccount), 400);
      return;
    }

    // 2. Check registered accounts
    const matched = registeredUsers.find(
      u => u.email.trim().toLowerCase() === emailTrimmed
    );

    if (!matched) {
      setError('Account nahi mila. Agar aap naye hain toh "Sign Up (Naye User)" par click karke 10 second me free account banayein.');
      return;
    }

    if (matched.password && matched.password !== passwordTrimmed) {
      setError('Galat password. Kripya apna sahi password dalein.');
      return;
    }

    setSuccessMsg(`Swagat hai, ${matched.name}! SubMe shuru ho raha hai...`);
    setTimeout(() => onLogin(matched), 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameTrimmed = signUpName.trim();
    const emailTrimmed = signUpEmail.trim().toLowerCase();
    const handleTrimmed = signUpHandle.trim();
    const passwordTrimmed = signUpPassword.trim();

    if (!nameTrimmed) {
      setError('Kripya apna poora naam ya channel title dalein.');
      return;
    }

    if (!emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setError('Kripya ek valid email address dalein.');
      return;
    }

    if (passwordTrimmed.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    // Check if email already registered
    const exists = registeredUsers.some(
      u => u.email.trim().toLowerCase() === emailTrimmed
    );
    if (exists) {
      setError('Yeh email pehle se registered hai! Kripya "Sign In" par click karein.');
      return;
    }

    // Format handle properly with @
    let cleanHandle = handleTrimmed.startsWith('@') ? handleTrimmed : `@${handleTrimmed}`;
    if (cleanHandle === '@') {
      cleanHandle = `@${nameTrimmed.toLowerCase().replace(/\s+/g, '')}`;
    }

    // Auto-sync real channel avatar or fallback
    const resolvedAvatar = getYouTubeAvatarUrl(signUpChannelUrl || cleanHandle, nameTrimmed);

    const newUserId = `usr_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name: nameTrimmed,
      email: emailTrimmed,
      password: passwordTrimmed,
      role: 'user',
      handle: cleanHandle,
      avatar: resolvedAvatar,
      channelUrl: signUpChannelUrl.trim() || undefined,
      bugBalance: 0,
      channelSubscribers: 100,
      referralCode: `SUB${newUserId.slice(-5).toUpperCase()}`,
      completedTasksCount: 0,
      activeCampaignsCount: 0,
      reputationScore: 100,
      subscribedChannelIds: [],
      referredBy: signUpReferralCode.trim().toUpperCase() || undefined,
    };

    setSuccessMsg('Aapka account safaltapoorvak ban gaya hai! Redirecting to tasks...');
    setTimeout(() => {
      onRegister(newUser, signUpReferralCode.trim().toUpperCase());
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1118] flex flex-col justify-between text-deep-ocean dark:text-slate-100 transition-colors duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TOP NAVBAR (Matching SubMe Application Navbar) */}
      <header className="h-14 px-4 sm:px-6 md:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0E1620]/90 backdrop-blur-md flex items-center justify-between select-none z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-900 border border-slate-700 p-0.5 shadow-2xs flex items-center justify-center shrink-0">
            <img src="/app-logo.png" alt="SubMe" className="w-full h-full rounded-[3px] object-cover" />
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-medium text-xs">
            Console
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
          <div className="flex items-center gap-1.5 font-bold text-deep-ocean dark:text-slate-100 tracking-tight text-xs truncate">
            <span>Creator Authentication &amp; Growth Network</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 font-mono text-[11px] font-semibold">
            <Coins className="w-3.5 h-3.5 text-emerald-500" />
            <span>1 BUG = 1 Growth Credit</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-subtle"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEWPORT (Matching SubMe Studio Layout) */}
      <main className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 space-y-6 max-w-7xl mx-auto w-full flex-1 select-none">
        
        {/* Studio Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-deep-ocean dark:text-slate-100">
                Creator Growth Command Center
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#C7DFA3] border border-emerald-200 dark:border-emerald-800/60 uppercase">
                MUTUAL EXCHANGE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Increase your YouTube Subscribers, Instagram Followers, and 3-Minute Real Watch Time through community tasks.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-subtle">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>14,200+ Creators</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-[#C7DFA3] font-bold flex items-center gap-1.5 shadow-subtle">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3 Min Retention Lock</span>
            </span>
          </div>
        </div>

        {/* 2-Column Composition: 7 cols (Growth Guide) + 5 cols (Auth Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): How SubMe Creator Exchange Works */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Explainer Card 1 */}
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm sm:text-base font-bold text-deep-ocean dark:text-slate-100">
                    SubMe Par Channel Grow Kaise Hota Hai?
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[#C7DFA3] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  Zero Bots • 100% Real Humans
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                SubMe ek <b>real creators ki mutual growth community</b> hai. Yahan creators ek doosre ki videos ko 3 minute dekhte hain aur subscribe karke <b>BUGs</b> earn karte hain. Unhi BUGs se <b>apne YouTube channel ya Instagram reel par real subscribers, followers aur genuine watch time badhate hain!</b>
              </p>

              {/* 3 Step Flow */}
              <div className="space-y-3 pt-1">
                
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-[#16222F] text-slate-700 dark:text-[#C7DFA3] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
                    1
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h3 className="text-xs font-bold text-deep-ocean dark:text-white">
                      Doosre Creators Ki Videos Dekhein (+2 BUGs)
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Dashboard par YouTube videos, Shorts ya Instagram Reels ko 3 minute dekhein aur channel subscribe karein. Quick attention quiz answer karte hi wallet me <b>+2 BUGs</b> credit milte hain.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-slate-200/80 dark:bg-[#16222F] text-slate-700 dark:text-[#C7DFA3] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700">
                    2
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h3 className="text-xs font-bold text-deep-ocean dark:text-white">
                      Earn Kiye Hue BUGs Se Apna Task Lagayein
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Kamaaye hue BUGs se apna video ya reel task banayein (Standard Task = 50 BUGs, VIP Top Task = 200 BUGs). Agar jaldi boost chahiye toh aap direct UPI deposit se bhi BUGs top-up kar sakte hain.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-[#C7DFA3] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                    3
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h3 className="text-xs font-bold text-deep-ocean dark:text-white">
                      Real Subscribers &amp; 3-Minute Watch Time Badhayein
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      SubMe community ke hazaaron genuine active creators aapki video ko 3-min poora watch karenge aur channel ko subscribe karenge. Isse aapki YouTube Audience Retention aur Algorithm boost hoti hai!
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quality & Algorithm Metrics Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-deep-ocean dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Channel Retention &amp; Algorithm Highlights</span>
                </span>
                <span className="text-[10px] text-slate-400">ENGINE V2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-deep-ocean dark:text-white block">180s Retention</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-tight">
                    High average view duration YouTube algorithm ko push karti hai.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-deep-ocean dark:text-white block">Real Indian Creators</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-tight">
                    100% genuine audience. Zero fake bots, real active Indian channels.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-deep-ocean dark:text-white block">Fast Monetization</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-tight">
                    4,000 hrs watch time aur 1,000 subscribers ke milestones tezi se paayein.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Clean Creator Auth Form */}
          <div className="lg:col-span-5">
            <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              
              {/* Form Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-deep-ocean dark:text-white tracking-tight">
                  {mode === 'signup' ? 'Create Creator Account' : 'Sign In To Creator Console'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'signup' 
                    ? 'Connect your channel and join India’s #1 growth exchange' 
                    : 'Manage your growth tasks, track progress & stats'}
                </p>
              </div>

              {/* Mode Switcher Tabs (Matching SubMe segmented controls) */}
              <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 font-mono text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-1.5 text-center rounded-md transition-all cursor-pointer ${
                    mode === 'signup' 
                      ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-white shadow-subtle border border-slate-200/80 dark:border-slate-700 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign Up (New)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-1.5 text-center rounded-md transition-all cursor-pointer ${
                    mode === 'signin' 
                      ? 'bg-white dark:bg-[#131D28] text-deep-ocean dark:text-white shadow-subtle border border-slate-200/80 dark:border-slate-700 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In (Login)
                </button>
              </div>

              {/* Error & Success Alerts */}
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ================= SIGN UP FORM ================= */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Channel Title / Creator Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Aman Verma ya Tech Creator"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Handle */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Username / Handle <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={signUpHandle}
                        onChange={(e) => setSignUpHandle(e.target.value)}
                        placeholder="@amanverma"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Password (Min 6 characters) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full pl-9 pr-10 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* YouTube Channel URL (Optional) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      YouTube Channel Link <span className="text-slate-400 font-normal">(Optional - Avatar &amp; Subscribers Sync)</span>
                    </label>
                    <div className="relative">
                      <Tv className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="url"
                        value={signUpChannelUrl}
                        onChange={(e) => setSignUpChannelUrl(e.target.value)}
                        placeholder="https://youtube.com/@yourchannel"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Referral Code (Optional) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-[#C7DFA3] font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        Bonus +5 BUGs
                      </span>
                    </div>
                    <input
                      type="text"
                      value={signUpReferralCode}
                      onChange={(e) => setSignUpReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SUBME-XXXXX"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle uppercase tracking-wider"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white font-bold text-xs shadow-subtle transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Free Creator Account Banayein &amp; Channel Grow Karein</span>
                  </button>

                  <div className="text-center pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Pehle se account hai?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          setError(null);
                        }}
                        className="font-bold text-deep-ocean dark:text-slate-200 hover:underline cursor-pointer"
                      >
                        Sign In Karein
                      </button>
                    </span>
                  </div>

                </form>
              )}

              {/* ================= SIGN IN FORM ================= */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="yourname@gmail.com ya admin@subme.io"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-10 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 shadow-subtle"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white font-bold text-xs shadow-subtle transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Sign In &bull; Dashboard Kholein</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Naye creator hain?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setError(null);
                        }}
                        className="font-bold text-deep-ocean dark:text-slate-200 hover:underline cursor-pointer"
                      >
                        Sign Up Karein (Free)
                      </button>
                    </span>
                  </div>

                  {/* Admin Fast Helper */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400 text-center">
                    <span>Admin Demo: <code className="text-slate-700 dark:text-slate-300 font-bold">admin@subme.io</code> / <code className="text-slate-700 dark:text-slate-300 font-bold">admin123</code></span>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </main>

      {/* 3. CONSOLE FOOTER */}
      <footer className="w-full py-3 px-4 sm:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0E1620]/70 text-xs font-mono text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-deep-ocean dark:text-slate-200 uppercase">SubMe Growth Engine</span>
            <span>&bull;</span>
            <span>1 BUG = 1 Growth Credit</span>
            <span>&bull;</span>
            <span>Real Indian Creator Community</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-[#C7DFA3]">
              <ShieldCheck className="w-3.5 h-3.5" /> 3-Min Retention Lock
            </span>
            <span>&bull;</span>
            <span>Anti-Cheat Monitored</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
