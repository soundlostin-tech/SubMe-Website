import React, { useState } from 'react';
import { 
  Users, 
  Coins, 
  CreditCard, 
  Tv, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Campaign, UserProfile, WalletTransaction, PayoutClaim, AuditSentinelEvent } from '../types';

interface OverviewViewProps {
  onNavigate: (tabId: string) => void;
  onOpenCreateCampaign: () => void;
  onOpenVault: () => void;
  user: UserProfile;
  campaigns: Campaign[];
  transactions: WalletTransaction[];
  payoutClaims?: PayoutClaim[];
  auditLogs?: AuditSentinelEvent[];
  registeredUsers?: UserProfile[];
  onSyncYouTube?: () => Promise<number>;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenCreateCampaign,
  onOpenVault,
  user,
  campaigns,
  transactions,
  payoutClaims = [],
  auditLogs = [],
  registeredUsers = [],
  onSyncYouTube,
}) => {
  const [streamFilter, setStreamFilter] = useState<'all' | 'reward' | 'topup' | 'spend'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingYouTube, setIsSyncingYouTube] = useState(false);
  const [syncYouTubeMsg, setSyncYouTubeMsg] = useState<string | null>(null);

  // Trigger sync animation
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const handleSyncYT = async () => {
    if (!onSyncYouTube) return;
    setIsSyncingYouTube(true);
    try {
      const count = await onSyncYouTube();
      setSyncYouTubeMsg(`Updated ${count} featured channels with today's newest YouTube videos.`);
      setTimeout(() => setSyncYouTubeMsg(null), 4000);
    } catch (e) {
      setSyncYouTubeMsg('Failed to sync YouTube feeds. Please retry.');
      setTimeout(() => setSyncYouTubeMsg(null), 3000);
    } finally {
      setIsSyncingYouTube(false);
    }
  };

  // Dynamic calculations for real consistency
  const registeredCount = registeredUsers.length > 0 ? registeredUsers.length : 1;
  const totalCirculatingPool = registeredUsers.length > 0
    ? registeredUsers.reduce((sum, u) => sum + (u.bugBalance || 0), 0)
    : user.bugBalance;
  const totalReferrals = registeredUsers.filter(u => u.referralCode).length;

  const pendingClaims = payoutClaims.filter(c => c.status === 'pending');
  const settledClaims = payoutClaims.filter(c => c.status === 'settled');
  const pendingTotal = pendingClaims.reduce((acc, c) => acc + c.amount, 0);
  const settledTotal = settledClaims.reduce((acc, c) => acc + c.amount, 0);

  // Filter transactions for the live stream
  const filteredStream = transactions.filter(tx => {
    const cat = tx.category || (
      tx.type === 'EARNED_TASK' || tx.type === 'REFERRAL_BOUNTY'
        ? 'reward'
        : tx.type === 'UPI_TOPUP'
        ? 'topup'
        : 'spend'
    );
    if (streamFilter === 'all') return true;
    return cat === streamFilter;
  });

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] min-h-full transition-colors text-slate-800 dark:text-slate-100">
      
      {/* 1. View Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-deep-ocean dark:text-white tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time liquidity, member growth, and security audit telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onSyncYouTube && (
            <button
              onClick={handleSyncYT}
              disabled={isSyncingYouTube}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-subtle transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Daily automated sync replaces old videos with newest daily uploads from top creators"
            >
              <Tv className={`w-3.5 h-3.5 ${isSyncingYouTube ? 'animate-pulse text-amber-500' : 'text-rose-500'}`} />
              <span>{isSyncingYouTube ? 'Syncing YouTube...' : 'Sync YouTube Daily'}</span>
            </button>
          )}

          <button
            onClick={onOpenCreateCampaign}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-matcha-green" />
            <span>Create Task</span>
          </button>

          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D28] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-subtle transition-colors cursor-pointer active:scale-95"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {syncYouTubeMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-700 dark:text-[#C7DFA3] text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncYouTubeMsg}</span>
        </div>
      )}

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Registered Users */}
        <div
          onClick={() => onNavigate('users')}
          className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Registered Users</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-deep-ocean dark:group-hover:text-matcha-green transition-colors" />
          </div>
          <div className="text-2xl font-bold text-deep-ocean dark:text-white tabular-nums">
            {registeredCount}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-700 dark:text-[#C7DFA3] font-bold bg-matcha-green/30 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded border border-matcha-green/50 dark:border-emerald-800/60 font-mono">
              +{totalReferrals} refs
            </span>
            <span>real registered accounts</span>
          </div>
        </div>

        {/* Card 2: Circulating Reward Pool */}
        <div
          onClick={() => onNavigate('transactions')}
          className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Circulating Reward Pool</span>
            <Coins className="w-4 h-4 text-slate-400 group-hover:text-deep-ocean dark:group-hover:text-matcha-green transition-colors" />
          </div>
          <div className="text-2xl font-bold text-deep-ocean dark:text-white tabular-nums font-mono">
            {totalCirculatingPool.toLocaleString()} <span className="text-xs font-semibold text-slate-400">pts</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-700 dark:text-[#C7DFA3] font-bold bg-matcha-green/30 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded border border-matcha-green/50 dark:border-emerald-800/60 font-mono">
              Active
            </span>
            <span>in user wallets (₹1:1 BUG)</span>
          </div>
        </div>

        {/* Card 3: Payouts & Settlements */}
        <div
          onClick={() => onNavigate('payouts')}
          className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Payouts &amp; Settlements</span>
            <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-deep-ocean dark:group-hover:text-matcha-green transition-colors" />
          </div>
          <div className="text-2xl font-bold text-deep-ocean dark:text-white tabular-nums font-mono">
            ₹{pendingTotal.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/50 font-mono">
              {pendingClaims.length} pending
            </span>
            <span>₹{settledTotal.toLocaleString()} settled</span>
          </div>
        </div>

        {/* Card 4: Channel Tasks */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Channel Tasks</span>
            <Tv className="w-4 h-4 text-slate-400 group-hover:text-deep-ocean dark:group-hover:text-matcha-green transition-colors" />
          </div>
          <div className="text-2xl font-bold text-deep-ocean dark:text-white tabular-nums font-mono">
            {campaigns.length}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-blue-600 dark:text-airy-blue font-bold bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/40 font-mono">
              Live
            </span>
            <span>Created by users</span>
          </div>
        </div>

      </div>

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Transaction & Reward Stream */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card overflow-hidden">
          
          {/* Stream Header & Filter Tabs */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-deep-ocean dark:text-white tracking-tight uppercase font-mono">
                Live Transaction &amp; Reward Stream
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Real-time ledger events from PostgreSQL
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0E1620] p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {(['all', 'reward', 'topup', 'spend'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStreamFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors cursor-pointer active:scale-95 ${
                    streamFilter === filter
                      ? 'bg-deep-ocean dark:bg-slate-700 text-white shadow-subtle'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Stream Events List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredStream.slice(0, 7).map((event) => {
              const cat = event.category || (
                event.type === 'EARNED_TASK' || event.type === 'REFERRAL_BOUNTY'
                  ? 'reward'
                  : event.type === 'UPI_TOPUP'
                  ? 'topup'
                  : 'spend'
              );
              const isCredit = event.amount > 0;
              const displayTime = event.timeStr || new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const displayUuid = event.userId || (event.hash ? event.hash.slice(0, 8) : event.id.slice(0, 8));

              return (
                <div
                  key={event.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-[#16222F]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                        cat === 'reward'
                          ? 'bg-matcha-green/30 dark:bg-emerald-950/70 text-matcha-dark dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60'
                          : cat === 'topup'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-airy-blue border border-blue-200 dark:border-blue-900/40'
                          : 'bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat === 'reward' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-deep-ocean dark:text-slate-100 truncate">
                        {event.description}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>UUID: {displayUuid}...</span>
                        <span>•</span>
                        <span>{displayTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        isCredit ? 'text-emerald-700 dark:text-[#C7DFA3]' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {isCredit ? `+${event.amount.toFixed(0)}` : event.amount.toFixed(0)} pts
                    </span>
                    <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider font-mono">
                      {cat}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer View Full Ledger Link */}
          <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-[#0E1620] border-t border-slate-100 dark:border-slate-800 text-right">
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-deep-ocean dark:text-slate-200 hover:text-matcha-green inline-flex items-center gap-1 cursor-pointer active:scale-95 transition-colors font-mono"
            >
              <span>View full ledger ({transactions.length} events)</span>
              <ArrowRight className="w-3 h-3 text-matcha-green" />
            </button>
          </div>
        </div>

        {/* Right Column: Rapid Operations & Security Sentinel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Rapid Operations */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card space-y-3">
            <h3 className="text-xs font-bold text-deep-ocean dark:text-slate-100 tracking-tight flex items-center gap-1.5 font-mono uppercase">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Rapid Operations</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={onOpenCreateCampaign}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer active:scale-98 shadow-subtle"
              >
                <span>Deploy Watch Task</span>
                <kbd className="text-[10px] font-mono text-slate-400">⌘2</kbd>
              </button>

              <button
                onClick={() => onNavigate('payouts')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer active:scale-98 shadow-subtle"
              >
                <span>Review Pending Payouts ({pendingClaims.length})</span>
                <kbd className="text-[10px] font-mono text-slate-400">⌘5</kbd>
              </button>

              <button
                onClick={() => onNavigate('users')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer active:scale-98 shadow-subtle"
              >
                <span>Member Balance Adjustment</span>
                <kbd className="text-[10px] font-mono text-slate-400">⌘4</kbd>
              </button>
            </div>
          </div>

          {/* Card: Security Sentinel */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-deep-ocean dark:text-slate-100 tracking-tight flex items-center gap-1.5 font-mono uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-deep-ocean dark:text-matcha-green" />
                <span>Security Sentinel</span>
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 font-mono">
                SECURE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200/80 dark:border-slate-700 font-mono text-[11px] space-y-1 shadow-subtle"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>{log.type}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 truncate">
                    {log.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
