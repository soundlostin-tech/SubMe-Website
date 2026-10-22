import React from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Coins, 
  Clock, 
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] min-h-full transition-colors text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-deep-ocean dark:text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-deep-ocean dark:text-matcha-green" />
            <span>System &amp; Rules</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic parameters, attention verification engine thresholds, and liquid valuation pegs
          </p>
        </div>

        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-matcha-green/30 dark:bg-emerald-950/70 text-matcha-dark dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 font-mono">
          Engine Online • v2.4
        </span>
      </div>

      {/* Rules & Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Economic Peg */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-deep-ocean dark:text-slate-100 uppercase font-mono">
            <Coins className="w-4 h-4 text-deep-ocean dark:text-matcha-green" />
            <span>Economic Valuation Peg</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Strict 1:1 Rupee valuation peg. Every 1.00 BUG is redeemable for ₹1.00 INR via official NPCI UPI settlement.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 font-mono text-xs text-deep-ocean dark:text-slate-200 font-bold shadow-subtle">
            1.00 BUG = ₹1.00 INR (Liquid Vault)
          </div>
        </div>

        {/* Card 2: Attention Verification Window */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-deep-ocean dark:text-slate-100 uppercase font-mono">
            <Clock className="w-4 h-4 text-blue-500 dark:text-airy-blue" />
            <span>Timed Attention Proof Window</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mandatory continuous 3 minutes (180 seconds) watch window for all video formats (Videos, Shorts, Reels). Anti-cheat accumulator pauses when window is out of focus.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 font-mono text-xs text-deep-ocean dark:text-slate-200 font-bold shadow-subtle">
            Watch Duration: Mandatory 3 Minutes (180s)
          </div>
        </div>

        {/* Card 3: Task & Referral Bounty Rules */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-deep-ocean dark:text-slate-100 uppercase font-mono">
            <ShieldCheck className="w-4 h-4 text-deep-ocean dark:text-matcha-green" />
            <span>Platform Rewards &amp; Referral Rates</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Standardized algorithmic rates: Viewers earn 2 BUGs per verified task. Referrers receive 5 BUGs bounty upon invitee's first task.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 font-mono text-xs text-deep-ocean dark:text-slate-200 font-bold shadow-subtle">
            Per Task: 2 BUGs (₹2) • Referral: 5 BUGs (₹5)
          </div>
        </div>

        {/* Card 4: Official Minimum Payout Gateway */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-deep-ocean dark:text-slate-100 uppercase font-mono">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Minimum Payment &amp; Withdrawal Limit</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Strict minimum threshold of ₹50.00 (50 BUGs) required to request any UPI withdrawal. Payouts below ₹50 cannot be processed.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 font-mono text-xs text-deep-ocean dark:text-slate-200 font-bold shadow-subtle">
            Minimum Withdrawal: ₹50.00 (50 BUGs)
          </div>
        </div>

      </div>

    </div>
  );
};
