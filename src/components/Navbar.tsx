import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  Command, 
  ChevronRight, 
  Coins, 
  User, 
  ArrowUpRight, 
  Shield, 
  Sparkles,
  Database,
  LogOut
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';

interface NavbarProps {
  user: UserProfile;
  activeViewTitle?: string;
  onToggleMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenCreateCampaign: () => void;
  onOpenVault: () => void;
  onOpenReferral: () => void;
  onOpenLedger: () => void;
  onHomeClick: () => void;
  onNavigate?: (tab: string) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  isSupabaseLive?: boolean;
  onOpenSupabase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeViewTitle = 'Home Feed',
  onToggleMobileSidebar,
  onOpenCommandPalette,
  onOpenVault,
  onNavigate,
  onLogout,
  theme,
  toggleTheme,
  isSupabaseLive = true,
  onOpenSupabase,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, text: 'Real-time ledger and attention proof sentinel active', time: 'Live', unread: true },
    { id: 2, text: 'NPCI UPI 1:1 settlement engine connected', time: 'Live', unread: false },
  ];

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0E1620]/90 backdrop-blur-md flex items-center justify-between select-none z-20 shrink-0 transition-colors">
      
      {/* Left: Mobile Drawer Trigger + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button 
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors cursor-pointer shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-left min-w-0">
          <div className="w-5 h-5 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs bg-slate-900 p-0.5 flex items-center justify-center">
            <img src="/app-logo.png" alt="SubMe" className="w-full h-full rounded-[3px] object-cover" />
          </div>
          <span className="text-slate-400 dark:text-slate-500 font-medium">
            Console
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
          <div className="flex items-center gap-1.5 font-bold text-deep-ocean dark:text-slate-100 tracking-tight truncate">
            <span className="truncate">{activeViewTitle}</span>
          </div>
        </div>
      </div>

      {/* Center: Command Search / Quick Jump Button (Exact Reference Styling) */}
      <div className="hidden sm:flex items-center flex-1 max-w-sm mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-xs cursor-pointer shadow-subtle active:scale-98"
          title="Search commands or views (⌘K)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-medium truncate">Quick search or jumps...</span>
          </div>
          <div className="flex items-center gap-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-300 shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Controls: BUGs Display, Status Pill, Theme, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* Top Header BUGs Balance Display */}
        <button
          onClick={() => onNavigate && onNavigate('wallet')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#131D28] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer shadow-subtle group"
          title="Your Liquid BUG Balance (1 BUG = ₹1 INR)"
        >
          <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C7DFA3]" />
          <span className="font-mono text-xs sm:text-sm font-extrabold text-deep-ocean dark:text-slate-100 tracking-tight">
            {user.bugBalance.toLocaleString()} BUGs
          </span>
          <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-500 hidden sm:inline">
            (₹{user.bugBalance.toLocaleString()})
          </span>
        </button>


        {/* Admin Role Badge (strictly visible when logged in as Admin) */}
        {user.role === 'admin' && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-500 font-bold"
            title="Administrator Active"
          >
            <Shield className="w-3 h-3 text-amber-500" />
            <span>ADMIN</span>
          </div>
        )}

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 hover:text-deep-ocean dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
          ) : (
            <Moon className="w-4 h-4 stroke-[1.75]" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-1.5 text-slate-500 hover:text-deep-ocean dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer active:scale-95"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0E1620]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 shadow-dropdown p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C7DFA3]" />
                  <span className="font-bold text-xs uppercase tracking-tight text-deep-ocean dark:text-slate-100 font-mono">
                    System Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-[#C7DFA3] bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800/50 font-bold">
                  Operational
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className="p-2 rounded-lg text-xs bg-slate-50/70 dark:bg-[#16222F] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <p className="leading-snug">{n.text}</p>
                    <span className="block mt-1 text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer bg-white dark:bg-[#131D28] shadow-subtle"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-6 h-6 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <span className="hidden sm:inline font-mono text-xs font-semibold text-deep-ocean dark:text-slate-200">
              {user.handle.replace('@', '')}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 shadow-dropdown p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-deep-ocean dark:text-slate-100 truncate">{user.name}</p>
                    {user.role === 'admin' && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{user.handle} &bull; {user.email || 'Online'}</p>
                </div>
              </div>

              <div className="mt-2.5 space-y-1 text-xs">
                <button
                  onClick={() => { 
                    setShowUserMenu(false); 
                    if (onNavigate) onNavigate('profile');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Creator Profile
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </button>

                <button
                  onClick={() => { 
                    setShowUserMenu(false); 
                    if (onNavigate) onNavigate('wallet');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C7DFA3]" />
                    Wallet (₹{user.bugBalance})
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 pt-2 mt-1 text-xs font-mono"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out {user.role === 'admin' ? '(Admin)' : ''}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
