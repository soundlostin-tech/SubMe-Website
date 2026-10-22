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
  Gift
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
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
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
        activeCampaignsCount: 0,
        reputationScore: 100,
        subscribedChannelIds: [],
      };

      setSuccessMsg('Admin login successful! Entering Admin Console...');
      setTimeout(() => {
        onLogin(adminAccount);
      }, 400);
      return;
    }

    // 2. Check registered users list
    const foundUser = registeredUsers.find(
      u => u.email.toLowerCase() === emailTrimmed && (u.password === passwordTrimmed || !u.password)
    );

    if (foundUser) {
      setSuccessMsg(`Welcome back, ${foundUser.name}!`);
      setTimeout(() => {
        onLogin(foundUser);
      }, 400);
      return;
    }

    setError('Invalid email or password. New user? Please click Sign Up below.');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = signUpName.trim();
    let handle = signUpHandle.trim();
    const email = signUpEmail.trim().toLowerCase();
    const password = signUpPassword.trim();

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Format handle
    if (!handle) {
      handle = `@${name.toLowerCase().replace(/\s+/g, '')}`;
    } else if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }

    // Check if email already exists
    const emailExists = registeredUsers.some(u => u.email.toLowerCase() === email);
    if (emailExists || email === FIXED_ADMIN_EMAIL || email === 'admin@subme.com') {
      setError('An account with this email already exists. Please Sign In instead.');
      return;
    }

    const channelAvatar = getYouTubeAvatarUrl(signUpChannelUrl || handle, name);

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      password,
      role: 'user',
      handle,
      avatar: channelAvatar,
      channelUrl: signUpChannelUrl.trim() || `https://youtube.com/${handle}`,
      bugBalance: 0,
      channelSubscribers: 0,
      referralCode: `SUBME-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      completedTasksCount: 0,
      activeCampaignsCount: 0,
      reputationScore: 100,
      subscribedChannelIds: [],
      referredBy: signUpReferralCode.trim().toUpperCase() || undefined,
    };

    setSuccessMsg('Account created successfully! Launching your Creator Vault...');
    setTimeout(() => {
      onRegister(newUser, signUpReferralCode.trim().toUpperCase());
    }, 500);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] dark:bg-[#0B1118] flex flex-col justify-between select-none text-slate-800 dark:text-slate-100 transition-colors duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Bar with Logo & Theme Toggle */}
      <header className="w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0E1620]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 p-0.5 shadow-subtle shrink-0 flex items-center justify-center">
            <img src="/app-logo.png" alt="SubMe" className="w-full h-full rounded-[6px] object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-deep-ocean dark:text-white uppercase">
                SubMe
              </span>
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60">
                PRO v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block">
              Creator Growth Vault &amp; Attention Exchange
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
          
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-deep-ocean dark:text-white tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create Creator Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' 
                ? 'Sign in to access your dashboard, tasks, and wallet.' 
                : 'Join SubMe to grow your subscribers and monetize tasks.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-white dark:bg-[#16222F] text-deep-ocean dark:text-white shadow-subtle' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-white dark:bg-[#16222F] text-deep-ocean dark:text-white shadow-subtle' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sign Up (New User)
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
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
                className="w-full py-2.5 rounded-lg bg-deep-ocean hover:bg-deep-ocean-dark dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs transition-all cursor-pointer shadow-subtle flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Sign In to SubMe</span>
                <ArrowRight className="w-4 h-4 text-matcha-green" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  New to SubMe?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="font-semibold text-deep-ocean dark:text-matcha-green hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* SIGN UP FORM (NEW USERS) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Full Name / Channel Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Aman Verma or Tech Guru"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                  />
                </div>
              </div>

              {/* Handle */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Handle / Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signUpHandle}
                    onChange={(e) => setSignUpHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Password (min 6 chars) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
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

              {/* YouTube Channel URL & Real Channel Logo Preview */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    YouTube Channel URL <span className="text-slate-400 font-normal">(Logo will be used as your website PFP)</span>
                  </label>
                  <div className="relative">
                    <Tv className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      value={signUpChannelUrl}
                      onChange={(e) => setSignUpChannelUrl(e.target.value)}
                      placeholder="e.g. https://youtube.com/@CarryMinati or @triggeredinsaan"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                    />
                  </div>
                </div>

                {/* Live Channel Avatar PFP Preview */}
                <div className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-200 dark:bg-slate-800 shadow-subtle">
                    <img
                      src={getYouTubeAvatarUrl(signUpChannelUrl || signUpHandle, signUpName || 'Creator')}
                      alt="Channel Logo Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(signUpName || 'Creator')}&background=31465A&color=C7DFA3&bold=true`;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-deep-ocean dark:text-slate-200">
                        {extractYouTubeHandle(signUpChannelUrl || signUpHandle) ? `@${extractYouTubeHandle(signUpChannelUrl || signUpHandle)} Logo` : 'Channel Logo (PFP)'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60">
                        Auto-Synced
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {signUpChannelUrl.trim() ? 'Official channel logo detected from YouTube' : 'Paste your YouTube link to sync your real channel logo'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral / Invite Code (Optional) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-[#C7DFA3] font-semibold flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Friend gets +5 BUGs
                  </span>
                </div>
                <div className="relative">
                  <Gift className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                  <input
                    type="text"
                    value={signUpReferralCode}
                    onChange={(e) => setSignUpReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUBME-XXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-deep-ocean hover:bg-deep-ocean-dark dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs transition-all cursor-pointer shadow-subtle flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-matcha-green" />
                <span>Create Creator Account</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="font-semibold text-deep-ocean dark:text-matcha-green hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 px-4 text-center text-[11px] font-mono text-slate-400 dark:text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
        SubMe Ecosystem • NPCI Verified Capital • Decentralized Creator Exchange
      </footer>

    </div>
  );
};
