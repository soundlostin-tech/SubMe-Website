import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Plus, 
  Sliders, 
  X, 
  Check 
} from 'lucide-react';
import { UserProfile, MemberProfile } from '../types';

interface UsersViewProps {
  currentUser: UserProfile;
  accounts?: UserProfile[];
  members?: MemberProfile[];
  onOpenReferral: () => void;
  onAdjustBalance: (memberId: string, amount: number, reason: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  currentUser,
  accounts = [],
  members = [],
  onOpenReferral,
  onAdjustBalance,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Manual balance adjustment');
  const [isAdjustmentDone, setIsAdjustmentDone] = useState(false);

  // Derive real active members from registered accounts
  const liveMembers: MemberProfile[] = accounts.length > 0 
    ? accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        handle: acc.handle,
        avatar: acc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(acc.handle || acc.name)}`,
        pts: acc.id === currentUser.id ? currentUser.bugBalance : acc.bugBalance,
        refs: acc.referralCode ? 1 : 0,
        tasksCompleted: acc.id === currentUser.id ? currentUser.completedTasksCount : acc.completedTasksCount,
        status: acc.role === 'admin' ? 'Platform Admin' : 'Verified Creator',
        verified: true,
      }))
    : members.map(m => {
        if (m.id === currentUser.id || m.handle === currentUser.handle) {
          return {
            ...m,
            name: currentUser.name,
            pts: currentUser.bugBalance,
            tasksCompleted: currentUser.completedTasksCount,
          };
        }
        return m;
      });

  const filtered = liveMembers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.handle.toLowerCase().includes(search.toLowerCase()) ||
    u.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalRegistered = liveMembers.length;
  const totalRefs = liveMembers.reduce((acc, m) => acc + (m.refs || 0), 0);
  const totalPool = liveMembers.reduce((acc, m) => acc + (m.pts || 0), 0);

  const handleApplyAdjustment = () => {
    if (!selectedMember || adjustmentAmount === 0) return;
    onAdjustBalance(selectedMember.id, adjustmentAmount, adjustmentReason);
    setIsAdjustmentDone(true);
    setTimeout(() => {
      setIsAdjustmentDone(false);
      setSelectedMember(null);
    }, 1200);
  };

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] min-h-full transition-colors relative text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-deep-ocean dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-deep-ocean dark:text-matcha-green" />
            <span>Users &amp; Members</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified accounts, referral tree lineage, and member liquidity allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReferral}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-matcha-green" />
            <span>Referral Bounty (+₹5)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">Registered Accounts</span>
          <div className="text-2xl font-bold text-deep-ocean dark:text-white mt-1 font-mono">
            {totalRegistered}
          </div>
          <span className="text-[11px] text-slate-400">Total verified members on engine</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">Referral Lineage</span>
          <div className="text-2xl font-bold text-emerald-700 dark:text-[#C7DFA3] mt-1 font-mono">
            +{totalRefs} refs
          </div>
          <span className="text-[11px] text-slate-400">Active referral lineages</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">Total Member Pool</span>
          <div className="text-2xl font-bold text-deep-ocean dark:text-white mt-1 font-mono">
            {totalPool.toLocaleString()} pts
          </div>
          <span className="text-[11px] text-slate-400">Combined circulating BUGs (₹1:1)</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-md relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter members by name, handle, or standing..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
        />
      </div>

      {/* Members Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-[#16222F] border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Standing</th>
                <th className="px-4 py-3 font-semibold">Referrals</th>
                <th className="px-4 py-3 font-semibold">Tasks Completed</th>
                <th className="px-4 py-3 font-semibold text-right">Balance</th>
                <th className="px-5 py-3 font-semibold text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
                    No registered accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-[#16222F]/40 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-deep-ocean dark:text-slate-100">
                        <span>{u.name}</span>
                        {u.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {u.handle}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0E1620] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-emerald-700 dark:text-[#C7DFA3]">
                    +{u.refs} refs
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {u.tasksCompleted}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-deep-ocean dark:text-slate-100">
                    {u.pts.toLocaleString()} pts
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono">
                    <button
                      onClick={() => {
                        setSelectedMember(u);
                        setAdjustmentAmount(10);
                        setAdjustmentReason('Manual balance adjustment');
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#16222F] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95 transition-all shadow-subtle"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Balance Adjustment Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-deep-ocean dark:text-matcha-green" />
                <h3 className="font-bold text-sm text-deep-ocean dark:text-slate-100 uppercase tracking-tight">
                  Member Balance Adjustment
                </h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <p className="font-bold text-xs text-deep-ocean dark:text-white">{selectedMember.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{selectedMember.handle}</p>
                <p className="text-[11px] font-mono font-bold text-deep-ocean dark:text-matcha-green mt-0.5">
                  Current Balance: {selectedMember.pts} pts (₹{selectedMember.pts})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Adjustment Amount (BUGs / INR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-deep-ocean dark:text-white focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                  />
                  <div className="flex gap-1">
                    {[+10, +50, -10].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => setAdjustmentAmount(prev => prev + delta)}
                        className="px-2.5 py-1 text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#16222F] hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer shadow-subtle"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Audit Reason / Note
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                  placeholder="e.g. Creator promotional grant"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-semibold text-xs transition-all cursor-pointer shadow-subtle"
              >
                {isAdjustmentDone ? <Check className="w-3.5 h-3.5 text-matcha-green" /> : null}
                <span>{isAdjustmentDone ? 'Applied!' : 'Apply Adjustment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
