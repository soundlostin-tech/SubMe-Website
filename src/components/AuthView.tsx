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
  Clock
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
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1118] flex flex-col justify-between text-slate-800 dark:text-slate-100 transition-colors duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. TOP HEADER */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0E1620]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 p-0.5 shadow-subtle shrink-0 flex items-center justify-center">
            <img src="/app-logo.png" alt="SubMe" className="w-full h-full rounded-lg object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-deep-ocean dark:text-white uppercase">
                SubMe
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60">
                1 BUG = ₹1 INR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              India's #1 Creator Growth &amp; Task Earning Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-[#C7DFA3] text-xs font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>+2 BUGs Per Task Guaranteed</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-subtle"
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

      {/* 2. MAIN 2-COLUMN ONBOARDING & AUTH HERO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        
        {/* BANNER FOR FIRST TIME VISITORS: "WEBSITE PAR KYA KARNA HAI?" */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1E2C39] text-white shadow-card relative overflow-hidden border border-emerald-400/30">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-mono font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Naye Users Ke Liye Guide</span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
                SubMe par aakar kya karna hai? (How It Works)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-50 max-w-2xl leading-relaxed">
                Yahan par aap <b>3 minute videos dekhkar aur channel subscribe karke har task par 2 BUGs kama sakte hain</b>, ya phir <b>apne YouTube/Instagram channel ke liye real subscribers paane ka task laga sakte hain!</b>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 text-center font-mono">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Har Task Par</span>
                <span className="text-xl font-extrabold text-yellow-300">2 BUGs</span>
                <span className="text-[9px] text-emerald-100 block">Instant Wallet Credit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 text-center font-mono">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Minimum Payout</span>
                <span className="text-xl font-extrabold text-white">50 BUGs</span>
                <span className="text-[9px] text-emerald-100 block">Seedhe UPI / Bank (₹50)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN GRID: LEFT = 3-STEP EXPLAINER & PROOF, RIGHT = AUTH FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: STEP-BY-STEP "KAISE KAAM KARTA HAI" (7 COLS) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Visual 3-Step Guide */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600 dark:text-[#C7DFA3] fill-emerald-600 dark:fill-[#C7DFA3]" />
                  <span>3 Aasan Steps Me Paise Kamao:</span>
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#C7DFA3] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                  100% Free • No Investment
                </span>
              </div>

              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-subtle">
                  1
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Apna Pasandida Video Task Chuno
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Website par daily YouTube videos, Shorts aur Instagram Reels ke live tasks aate hain. Kisi bhi task par click karke video play karein.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-subtle">
                  2
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    3 Minute Video Dekho &amp; Channel Subscribe Karo
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Timer 3 minute ka chalta hai. 3 minute poora hote hi Step 1 button se creator ke official channel ko YouTube/Instagram par subscribe karein.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-subtle">
                  3
                </div>
                <div className="space-y-0.5 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Quiz Ka Answer Do aur Turant +2 BUGs Paao!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Video se jude ek aasan MCQ sawal ka answer select karein. Submit karte hi instant aapke SubMe wallet me <b>2 BUGs</b> credit ho jayenge!
                  </p>
                </div>
              </div>

              {/* Step 4: Cashout */}
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/60 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-[#C7DFA3] flex items-center justify-center shrink-0 font-bold">
                  ₹
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    Instant UPI Withdrawal (Google Pay / PhonePe / Paytm):
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Jaise hi wallet me minimum ₹50 ho jayein, apna UPI ID daal kar seedhe bank account me transfer lein.
                  </span>
                </div>
              </div>
            </div>

            {/* Creators Section: "Apna Channel Grow Karna Hai?" */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card space-y-2.5">
              <div className="flex items-center gap-2 text-deep-ocean dark:text-white font-bold text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>YouTubers &amp; Instagram Creators Ke Liye:</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Agar aap naye creator hain aur apna channel grow karna chahte hain, toh yahan <b>apna task lagayein</b>. SubMe ke real Indian users aapki video ko poora 3 minute watch karenge aur aapke channel ko subscribe karenge! 100% genuine real attention guarantee.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-center">
                <div className="p-2 bg-slate-50 dark:bg-[#0E1620] rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Standard Task</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹50 (50 BUGs)</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-[#0E1620] rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">VIP Top Task</span>
                  <span className="text-amber-500 font-bold">₹200 (200 BUGs)</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-[#0E1620] rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block">Referral Bonus</span>
                  <span className="text-blue-500 font-bold">+₹5 Per Friend</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: REGISTRATION & LOGIN FORM (5 COLS) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-elevated space-y-5">
              
              {/* Form Title & Benefit */}
              <div className="text-center space-y-1 pb-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {mode === 'signup' ? 'Start Free • Free Account Banayein' : 'Welcome Back • Sign In'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'signup' 
                    ? '10 second me sign up karein aur pehla task shuru karein' 
                    : 'Apne dashboard, wallet aur live tasks ko access karein'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 text-center rounded-lg transition-all cursor-pointer ${
                    mode === 'signup' 
                      ? 'bg-emerald-600 text-slate-950 font-extrabold shadow-subtle' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign Up (Naye User)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 text-center rounded-lg transition-all cursor-pointer ${
                    mode === 'signin' 
                      ? 'bg-[#1E2C39] dark:bg-slate-700 text-white shadow-subtle' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In (Login)
                </button>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ================= SIGN UP FORM (DEFAULT) ================= */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Aapka Naam / Channel Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="e.g. Aman Verma ya Tech Creator"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Handle */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Username / Handle <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={signUpHandle}
                        onChange={(e) => setSignUpHandle(e.target.value)}
                        placeholder="@amanverma"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Password (Kam se kam 6 akshar) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* YouTube Channel URL (Optional) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      YouTube Channel Link <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Tv className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="url"
                        value={signUpChannelUrl}
                        onChange={(e) => setSignUpChannelUrl(e.target.value)}
                        placeholder="https://youtube.com/@yourchannel"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle"
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
                        Friend gets +₹5
                      </span>
                    </div>
                    <input
                      type="text"
                      value={signUpReferralCode}
                      onChange={(e) => setSignUpReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SUBME-XXXXX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle uppercase tracking-wider"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-subtle flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Free Account Banayein &amp; Earning Shuru Karein</span>
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
                        className="font-bold text-emerald-600 dark:text-[#C7DFA3] hover:underline cursor-pointer"
                      >
                        Sign In Karein
                      </button>
                    </span>
                  </div>

                </form>
              )}

              {/* ================= SIGN IN FORM ================= */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="yourname@gmail.com ya admin@subme.io"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 shadow-subtle"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#1E2C39] hover:bg-[#16222F] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-subtle flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Sign In &bull; Dashboard Kholein</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>

                  <div className="text-center pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Naye user hain?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setError(null);
                        }}
                        className="font-bold text-emerald-600 dark:text-[#C7DFA3] hover:underline cursor-pointer"
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

      {/* 3. FOOTER WITH TRUST BADGES */}
      <footer className="w-full py-4 px-4 sm:px-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0E1620]/70 text-xs font-mono text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">SubMe Engine</span>
            <span>&bull;</span>
            <span>1 BUG = ₹1 INR</span>
            <span>&bull;</span>
            <span>Minimum UPI Payout: ₹50</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-[#C7DFA3]">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Watch Time
            </span>
            <span>&bull;</span>
            <span>NPCI Verified UPI Transfers</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
