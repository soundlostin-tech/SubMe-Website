import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  LayoutGrid, 
  PlusCircle, 
  Tv, 
  Users, 
  CreditCard, 
  Sun, 
  Moon, 
  ArrowRight,
} from 'lucide-react';
import { Campaign, ThemeMode } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onNavigateTab: (tabId: string) => void;
  onOpenCreateCampaign: () => void;
  onOpenVault: () => void;
  onOpenReferral: () => void;
  onOpenLedger: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onSelectCampaign,
  onNavigateTab,
  theme,
  toggleTheme,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const staticItems = [
    {
      id: 'nav-home',
      title: 'Home',
      subtitle: 'Top Indian YouTubers, banners & trending attention feed',
      category: 'Navigation',
      shortcut: '⌘ 1',
      icon: LayoutGrid,
      action: () => { onNavigateTab('home'); onClose(); },
    },
    {
      id: 'nav-create-task',
      title: 'Create Task',
      subtitle: 'Deploy 50-Sub subscriber campaign with QA verification',
      category: 'Navigation',
      shortcut: '⌘ 2',
      icon: PlusCircle,
      action: () => { onNavigateTab('create-task'); onClose(); },
    },
    {
      id: 'nav-tasks',
      title: 'Tasks & Promos',
      subtitle: 'Browse all YouTube attention campaigns and earn BUGs',
      category: 'Navigation',
      shortcut: '⌘ 3',
      icon: Tv,
      action: () => { onNavigateTab('tasks'); onClose(); },
    },
    {
      id: 'nav-wallet',
      title: 'Wallet & Vault',
      subtitle: 'Balance, UPI liquid vault deposit, and payout settlements',
      category: 'Navigation',
      shortcut: '⌘ 4',
      icon: CreditCard,
      action: () => { onNavigateTab('wallet'); onClose(); },
    },
    {
      id: 'nav-profile',
      title: 'Creator Profile',
      subtitle: 'Stats, referral code, reputation, and governance rules',
      category: 'Navigation',
      shortcut: '⌘ 5',
      icon: Users,
      action: () => { onNavigateTab('profile'); onClose(); },
    },
    {
      id: 'theme-toggle',
      title: `Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: 'Switch application color theme',
      category: 'Preferences',
      shortcut: 'Theme',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => { toggleTheme(); onClose(); },
    },
  ];

  const campaignItems = campaigns.map((camp) => ({
    id: `camp-${camp.id}`,
    title: camp.title,
    subtitle: `${camp.channelName} • ${camp.watchDurationSec === 180 ? '3 min' : `${camp.watchDurationSec}s`} attention • +${camp.rewardBugs} BUGs`,
    category: 'Campaigns',
    shortcut: `${camp.rewardBugs} BUG`,
    icon: Tv,
    action: () => { onSelectCampaign(camp); onClose(); },
  }));

  const allItems = [...staticItems, ...campaignItems];

  const filteredItems = allItems.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#131D28] rounded-xl shadow-elevated border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands, views, actions (e.g. payouts, tasks, theme)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 bg-transparent focus:outline-none font-sans"
          />
          <kbd className="text-[10px] bg-slate-100 dark:bg-[#16222F] border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-400 font-mono shadow-subtle">
            ESC
          </kbd>
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 font-mono">
              No matching commands or views found for "{search}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-[#16222F] text-deep-ocean dark:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-subtle font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#16222F]/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-deep-ocean dark:text-matcha-green' : 'text-slate-400'}`} />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs truncate block">{item.title}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-400">
                      {item.shortcut}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-deep-ocean dark:text-matcha-green' : 'opacity-0'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-3.5 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0E1620] flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
};
