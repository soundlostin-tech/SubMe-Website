import React from 'react';
import { 
  Home, 
  Tv, 
  PlusCircle, 
  Wallet, 
  User, 
  X, 
  Sun, 
  Moon,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  Users,
  CreditCard,
  ReceiptText,
  Sliders,
  Shield
} from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateCampaign?: () => void;
  user: UserProfile;
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  onCloseMobile,
  activeTab,
  setActiveTab,
  user,
  theme,
  toggleTheme,
}) => {
  const isAdmin = user.role === 'admin';

  // Navigation sections matching the reference architecture
  const navSections = isAdmin
    ? [
        {
          group: 'PLATFORM',
          items: [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, shortcut: '⌘ 1' },
            { id: 'home', label: 'Creator Feed', icon: Home, shortcut: '⌘ 2' },
            { id: 'create-task', label: 'Create Task', icon: PlusCircle, shortcut: '⌘ 3' },
          ]
        },
        {
          group: 'OPERATIONS',
          items: [
            { id: 'tasks', label: 'Tasks & Promos', icon: Tv, shortcut: '⌘ 4' },
            { id: 'users', label: 'Users & Members', icon: Users, shortcut: '⌘ 5' },
          ]
        },
        {
          group: 'FINANCE & TRUST',
          items: [
            { id: 'payouts', label: 'Payout Claims', icon: CreditCard, shortcut: '⌘ 6' },
            { id: 'transactions', label: 'Ledger Audit', icon: ReceiptText, shortcut: '⌘ 7' },
            { id: 'wallet', label: 'Liquid Vault', icon: Wallet, shortcut: '⌘ 8' },
            { id: 'settings', label: 'System & Rules', icon: Sliders, shortcut: '⌘ 9' },
          ]
        }
      ]
    : [
        {
          group: 'PLATFORM',
          items: [
            { id: 'home', label: 'Home Feed', icon: Home, shortcut: '⌘ 1' },
            { id: 'create-task', label: 'Create Task', icon: PlusCircle, shortcut: '⌘ 2' },
          ]
        },
        {
          group: 'OPERATIONS',
          items: [
            { id: 'tasks', label: 'Tasks & Promos', icon: Tv, shortcut: '⌘ 3' },
          ]
        },
        {
          group: 'FINANCE & TRUST',
          items: [
            { id: 'wallet', label: 'Liquid Vault', icon: Wallet, shortcut: '⌘ 4' },
            { id: 'profile', label: 'Creator Profile', icon: User, shortcut: '⌘ 5' },
          ]
        }
      ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const renderNavContent = (collapsed: boolean) => (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      <div className={`py-3 space-y-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
                {sec.group}
              </div>
            )}
            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return collapsed ? (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-[#16222F] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-bold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-deep-ocean dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                    title={`${item.label} (${item.shortcut})`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-deep-ocean dark:text-slate-100 stroke-[2.2]' : 'text-slate-500 dark:text-slate-400'}`} />
                  </button>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-white dark:bg-[#16222F] text-deep-ocean dark:text-slate-100 shadow-subtle border border-slate-200/80 dark:border-slate-700/80 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-deep-ocean dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50 font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-deep-ocean dark:text-slate-100 stroke-[2.2]' : 'text-slate-400 dark:text-slate-500 group-hover:text-deep-ocean dark:group-hover:text-slate-200'}`} />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.shortcut && (
                      <kbd className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                        isActive 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' 
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}>
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Profile & Theme Footer */}
      <div className={`p-3 border-t border-[#E2EBF0] dark:border-slate-800/80 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {collapsed ? (
          <>
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                onClick={() => handleItemClick('profile')}
                className="w-9 h-9 rounded-lg object-cover border border-white dark:border-slate-700 shadow-subtle cursor-pointer hover:scale-105 transition-transform"
                title={`${user.name} (${user.handle})`}
              />
              <span className={`w-2.5 h-2.5 border-2 border-white dark:border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5 ${isAdmin ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </>
        ) : (
          <div className="p-2 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
            <div 
              onClick={() => handleItemClick('profile')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <span className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-[#131D28] ${isAdmin ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-bold text-xs text-deep-ocean dark:text-slate-100 truncate">
                  <span className="truncate">{user.name}</span>
                  {isAdmin && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {user.handle}
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-deep-ocean dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 h-full bg-[#F4F8FA] dark:bg-[#0E1620] border-r border-[#E2EBF0] dark:border-slate-800/80 transition-all duration-200 select-none ${
          isCollapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between px-3.5 h-14 border-b border-[#E2EBF0]/70 dark:border-slate-800/80">
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-9 h-9 mx-auto rounded-xl overflow-hidden shadow-subtle border border-slate-200/80 dark:border-slate-700/80 hover:scale-105 transition-all cursor-pointer p-0.5 bg-slate-900"
              title="Expand Sidebar"
            >
              <img src="/app-logo.png" alt="SubMe" className="w-full h-full rounded-[9px] object-cover" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-subtle border border-slate-200/80 dark:border-slate-700/80 shrink-0 bg-slate-900 p-0.5">
                  <img src="/app-logo.png" alt="SubMe" className="w-full h-full rounded-[9px] object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[15px] tracking-tight text-deep-ocean dark:text-slate-100 leading-none">
                      SubMe
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-matcha-green/40 dark:bg-emerald-950/70 text-matcha-dark dark:text-[#C7DFA3] border border-matcha-green/60 dark:border-emerald-800/60 font-mono">
                      v2.4
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight mt-0.5 truncate">
                    {isAdmin ? 'Production Admin' : 'Creator Platform'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Content */}
        {renderNavContent(isCollapsed)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        >
          <div 
            className="w-64 h-full bg-[#F4F8FA] dark:bg-[#0E1620] border-r border-[#E2EBF0] dark:border-slate-800 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#E2EBF0] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 p-0.5 shadow-subtle shrink-0">
                  <img src="/app-logo.png" alt="SubMe" className="w-full h-full rounded-[8px] object-cover" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-deep-ocean dark:text-white">
                    SubMe
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-matcha-green/40 dark:bg-emerald-950/70 text-matcha-dark dark:text-[#C7DFA3] border border-matcha-green/60 dark:border-emerald-800/60 font-mono">
                    v2.4
                  </span>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16222F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderNavContent(false)}
          </div>
        </div>
      )}
    </>
  );
};
