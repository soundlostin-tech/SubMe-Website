import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Copy, 
  Check, 
  CheckCircle2 
} from 'lucide-react';
import { WalletTransaction } from '../types';

interface LedgerModalProps {
  isOpen: boolean;
  transactions: WalletTransaction[];
  onClose: () => void;
}

export const LedgerModal: React.FC<LedgerModalProps> = ({
  isOpen,
  transactions,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-elevated space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#16222F] flex items-center justify-center text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-subtle">
              <ShieldCheck className="w-5 h-5 text-deep-ocean dark:text-matcha-green" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Cryptographic Anti-Cheat &amp; Proof Ledger
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Deterministic SHA-256 Nonce Blocks • NPCI UTR Reconciliations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ledger List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {transactions.map((tx) => {
            const isCredit = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-xs shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${
                      isCredit ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-matcha-green border border-emerald-200 dark:border-emerald-800/60' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                    }`}>
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{tx.description}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-bold font-mono ${
                      isCredit ? 'text-emerald-600 dark:text-matcha-green' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isCredit ? '+' : ''}{tx.amount.toFixed(2)} BUGs
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      ₹{Math.abs(tx.amount).toFixed(2)} INR
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {tx.utrRef && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-matcha-green font-semibold">
                      NPCI UTR: <strong>{tx.utrRef}</strong>
                    </span>
                  )}

                  {tx.hash && (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>SHA-256:</span>
                      <code className="text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">{tx.hash}</code>
                      <button
                        onClick={() => handleCopy(tx.hash!, tx.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1 cursor-pointer"
                      >
                        {copiedId === tx.id ? <Check className="w-3 h-3 text-emerald-600 dark:text-matcha-green" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 text-[10px] ml-auto font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    IMMUTABLE_SETTLED
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          Close Ledger
        </button>

      </div>
    </div>
  );
};
