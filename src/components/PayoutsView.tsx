import React, { useState } from 'react';
import { 
  CreditCard, 
  Coins, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Search
} from 'lucide-react';
import { UserProfile, PayoutClaim } from '../types';

interface PayoutsViewProps {
  user: UserProfile;
  onOpenVault: () => void;
  claims: PayoutClaim[];
  onSettleClaim: (claimId: string) => void;
}

export const PayoutsView: React.FC<PayoutsViewProps> = ({
  onOpenVault,
  claims,
  onSettleClaim,
}) => {
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all');
  const [search, setSearch] = useState('');

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const settledClaims = claims.filter(c => c.status === 'settled');
  const pendingTotal = pendingClaims.reduce((acc, c) => acc + c.amount, 0);
  const settledTotal = settledClaims.reduce((acc, c) => acc + c.amount, 0);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText('theonlyvip786@okhdfcbank');
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const filteredClaims = claims.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.member.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.vpa.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] min-h-full transition-colors text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-deep-ocean dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-deep-ocean dark:text-matcha-green" />
            <span>Payout Claims &amp; Settlements</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Liquid settlement engine pegged ₹1:1 BUG via NPCI UPI gateway • Minimum payout threshold: ₹50.00 (50 BUGs)
          </p>
        </div>

        <button
          onClick={onOpenVault}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer active:scale-95"
        >
          <Coins className="w-3.5 h-3.5 text-matcha-green" />
          <span>Deposit via UPI Vault</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">Pending Claims</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">₹{pendingTotal.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">{pendingClaims.length} creator requests awaiting UTR</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">Settled Today</span>
          <div className="text-2xl font-bold text-emerald-700 dark:text-[#C7DFA3] mt-1 font-mono">₹{settledTotal.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">NPCI Atomic Reconciliation 100%</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">Official VPA</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-mono font-bold text-deep-ocean dark:text-slate-100">theonlyvip786@okhdfcbank</span>
            <button
              onClick={handleCopyVpa}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              {copiedVpa ? <Check className="w-4 h-4 text-emerald-600 dark:text-matcha-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] text-slate-400">SubMe Liquid Vault</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white dark:bg-[#131D28] p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {(['all', 'pending', 'settled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-deep-ocean dark:bg-slate-700 text-white shadow-subtle'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? `All (${claims.length})` : tab === 'pending' ? `Pending (${pendingClaims.length})` : `Settled (${settledClaims.length})`}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search claims by member or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-deep-ocean dark:text-slate-100 flex items-center justify-between uppercase font-mono">
          <span>Recent Payout Claims Queue</span>
          <span className="text-[11px] font-mono font-normal text-slate-400">
            {filteredClaims.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-[#16222F] border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Claim ID</th>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">VPA Target</th>
                <th className="px-4 py-3 font-semibold">Requested</th>
                <th className="px-5 py-3 font-semibold text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              {filteredClaims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-[#16222F]/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-200">
                    {c.id}
                  </td>
                  <td className="px-4 py-3.5 font-sans font-medium text-deep-ocean dark:text-slate-100">
                    <div>
                      <span>{c.member}</span>
                      <span className="block text-[10px] font-mono text-slate-400">{c.handle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-deep-ocean dark:text-slate-100">
                    ₹{c.amount}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 truncate max-w-[180px]">
                    {c.vpa}
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-slate-400 font-sans">
                    {c.requestedAt}
                  </td>
                  <td className="px-5 py-3.5 text-right font-sans">
                    {c.status === 'settled' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-matcha-green/30 dark:bg-emerald-950/70 text-matcha-dark dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled {c.utr ? `(${c.utr.slice(-4)})` : ''}
                      </span>
                    ) : (
                      <button
                        onClick={() => onSettleClaim(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 cursor-pointer active:scale-95 transition-all shadow-subtle font-mono"
                        title="Reconcile and settle payout with NPCI UTR"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Settle (₹{c.amount})</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
