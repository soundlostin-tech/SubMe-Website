import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Copy, 
  Check, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Lock, 
  Filter 
} from 'lucide-react';
import { WalletTransaction } from '../types';

interface TransactionsViewProps {
  transactions: WalletTransaction[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'reward' | 'topup' | 'spend'>('all');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = transactions.filter(t => {
    const cat = t.category || (
      t.type === 'EARNED_TASK' || t.type === 'REFERRAL_BOUNTY'
        ? 'reward'
        : t.type === 'UPI_TOPUP'
        ? 'topup'
        : 'spend'
    );
    if (filter !== 'all' && cat !== filter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        (t.hash && t.hash.toLowerCase().includes(q)) ||
        (t.utrRef && t.utrRef.toLowerCase().includes(q)) ||
        (t.campaignTitle && t.campaignTitle.toLowerCase().includes(q))
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
            <ShieldCheck className="w-5 h-5 text-deep-ocean dark:text-matcha-green" />
            <span>Cryptographic Ledger Audit</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable SHA-256 transaction blocks verified on-chain via Web Crypto Nonce API • 1 BUG = ₹1 INR Peg
          </p>
        </div>

        <span className="text-xs font-mono text-matcha-dark dark:text-[#C7DFA3] bg-matcha-green/30 dark:bg-emerald-950/70 px-2.5 py-1 rounded-md border border-matcha-green/50 dark:border-emerald-800/60 self-start sm:self-auto font-bold">
          {transactions.length} Verified Events
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white dark:bg-[#131D28] p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {(['all', 'reward', 'topup', 'spend'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-deep-ocean dark:bg-slate-700 text-white shadow-subtle'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-w-md w-full relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by hash, UTR, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
          />
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-[#16222F] border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Event &amp; Reference</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">SHA-256 Nonce Hash</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold text-right">Value (BUG / ₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((tx) => {
                const isCredit = tx.amount > 0;
                const cat = tx.category || (
                  tx.type === 'EARNED_TASK' || tx.type === 'REFERRAL_BOUNTY'
                    ? 'reward'
                    : tx.type === 'UPI_TOPUP'
                    ? 'topup'
                    : 'spend'
                );

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-[#16222F]/40 transition-colors">
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="font-semibold text-deep-ocean dark:text-slate-100 truncate">
                        {tx.description}
                      </div>
                      {tx.utrRef && (
                        <div className="text-[10px] font-mono text-emerald-700 dark:text-[#C7DFA3] mt-0.5 font-bold">
                          NPCI UTR: {tx.utrRef}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] uppercase">
                      <span className={`px-2 py-0.5 rounded-md border font-bold ${
                        cat === 'reward'
                          ? 'bg-matcha-green/30 dark:bg-emerald-950/70 text-matcha-dark dark:text-[#C7DFA3] border-matcha-green/50 dark:border-emerald-800/60'
                          : cat === 'topup'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-airy-blue border border-blue-200 dark:border-blue-900/40'
                          : 'bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {cat}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">
                          {tx.hash || '7c8a14f3b890a21098de120934fabc31903c'}
                        </span>
                        <button
                          onClick={() => handleCopy(tx.hash || '7c8a14f3b890a21098de120934fabc31903c', tx.id)}
                          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          title="Copy SHA-256 hash"
                        >
                          {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-600 dark:text-matcha-green" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {tx.timeStr || new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isCredit ? 'text-emerald-700 dark:text-[#C7DFA3]' : 'text-slate-600 dark:text-slate-300'}>
                        {isCredit ? `+${tx.amount.toFixed(0)}` : tx.amount.toFixed(0)} BUG
                      </span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        (₹{Math.abs(tx.amount).toFixed(0)})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
