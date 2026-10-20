import React from 'react';
import { 
  Home, 
  Tv, 
  Plus, 
  Wallet, 
  User 
} from 'lucide-react';
import { UserProfile } from '../types';

interface MobileBottomBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenCreateCampaign: () => void;
  user: UserProfile;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateCampaign,
  user,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-13 bg-white/95 dark:bg-[#0E1620]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1E2C39] flex items-center justify-around px-2 pb-safe select-none shadow-elevated">
      
      {/* 1. Home Feed Tab */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
          activeTab === 'home'
            ? 'text-slate-900 dark:text-slate-100 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Home Feed"
      >
        <Home className={`w-4 h-4 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-mono">Home</span>
      </button>

      {/* 2. Tasks Tab */}
      <button
        onClick={() => onSelectTab('tasks')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
          activeTab === 'tasks'
            ? 'text-slate-900 dark:text-slate-100 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Tasks"
      >
        <Tv className={`w-4 h-4 ${activeTab === 'tasks' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-mono">Tasks</span>
      </button>

      {/* 3. Center Elevated Action Button (Create Task) */}
      <div className="flex flex-col items-center justify-center flex-1">
        <button
          onClick={() => onSelectTab('create-task')}
          className={`relative -top-2 w-10 h-10 rounded-lg flex items-center justify-center border transition-all cursor-pointer shadow-subtle active:scale-95 ${
            activeTab === 'create-task'
              ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600 shadow-md'
              : 'bg-slate-100 dark:bg-[#16222F] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1E2C39] hover:bg-slate-200 dark:hover:bg-[#1A2634]'
          }`}
          title="Create Task"
          aria-label="Create Task"
        >
          <Plus className="w-4 h-4 text-[#314158] dark:text-[#C7DFA3] stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Wallet Tab */}
      <button
        onClick={() => onSelectTab('wallet')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
          activeTab === 'wallet'
            ? 'text-slate-900 dark:text-slate-100 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Wallet"
      >
        <Wallet className={`w-4 h-4 ${activeTab === 'wallet' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-mono">Wallet</span>
      </button>

      {/* 5. Profile Tab */}
      <button
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
          activeTab === 'profile'
            ? 'text-slate-900 dark:text-slate-100 font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Profile"
      >
        <User className={`w-4 h-4 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-mono">Profile</span>
      </button>

    </nav>
  );
};
