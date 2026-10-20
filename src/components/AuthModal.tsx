import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Shield 
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onRegister?: (newUser: UserProfile) => void;
  registeredUsers: UserProfile[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  registeredUsers,
}) => {
  if (!isOpen) return null;

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dedicated Admin credentials state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = adminEmail.trim().toLowerCase();
    const passwordTrimmed = adminPassword.trim();

    // Verify admin credentials
    const adminAccount = registeredUsers.find(
      u => u.role === 'admin' && u.email.toLowerCase() === emailTrimmed && u.password === passwordTrimmed
    ) || (emailTrimmed === 'admin@subme.io' && passwordTrimmed === 'admin123' ? {
      id: 'usr_admin_01',
      name: 'Platform Administrator',
      email: 'admin@subme.io',
      password: 'admin123',
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
    } : null);

    if (adminAccount) {
      setSuccessMsg('Administrator authenticated successfully! Loading Admin Console...');
      setTimeout(() => {
        onLogin(adminAccount);
        onClose();
      }, 500);
    } else {
      setError('Invalid Admin credentials.');
    }
  };

  const handleAdminLogout = () => {
    const creatorUser = registeredUsers.find(u => u.role === 'user') || {
      id: 'usr_creator_01',
      name: 'Demo Creator',
      email: 'creator@subme.io',
      role: 'user' as UserRole,
      handle: '@creator',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      bugBalance: 0,
      channelSubscribers: 0,
      referralCode: 'SUBME-CREATOR',
      completedTasksCount: 0,
      activeCampaignsCount: 0,
      reputationScore: 100,
      subscribedChannelIds: [],
    };
    onLogin(creatorUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm my-8 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-elevated text-slate-900 dark:text-slate-100 space-y-4">
        
        {/* Header & Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-subtle">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Admin Authentication
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Dedicated Platform Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ADMIN AUTHENTICATION FORM */}
        {!isAdmin ? (
          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@subme.io"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-subtle"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-subtle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-subtle active:scale-98"
            >
              Log In as Administrator
            </button>
          </form>
        ) : (
          <div className="space-y-3.5 pt-1">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                ACTIVE ADMIN SESSION
              </span>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                Logged in as <span className="font-bold">{currentUser.name}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {currentUser.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="w-full py-2 rounded-lg bg-slate-100 dark:bg-[#16222F] hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-subtle"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Admin Console</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
