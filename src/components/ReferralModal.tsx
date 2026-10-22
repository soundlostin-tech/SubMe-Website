import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Copy, 
  Check, 
  Gift
} from 'lucide-react';
import { UserProfile } from '../types';

interface ReferralModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onSimulateReferral: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  user,
  onClose,
  onSimulateReferral,
}) => {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?ref=${user.referralCode}`
    : `https://subme.app?ref=${user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-8 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-elevated space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#16222F] flex items-center justify-center text-deep-ocean dark:text-matcha-green border border-slate-200 dark:border-slate-700 shadow-subtle">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Viral Referral Bounty Hub
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Earn +₹5.00 BUGs per Verified Creator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bounty Box */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 shadow-subtle">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            Referral Settlement
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            +₹5.00 BUGs
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
            Credited immediately into your Liquid Vault when an invited creator launches their first 50-subscriber task or executes their first verified attention proof.
          </p>
        </div>

        {/* Code & Link Box */}
        <div className="space-y-3">
          
          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold uppercase">
              Creator Referral Code
            </label>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0E1620] p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-subtle">
              <code className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 tracking-wider">
                {user.referralCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white text-xs font-semibold uppercase transition-colors border border-slate-600 cursor-pointer shadow-subtle"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-matcha-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold uppercase">
              Direct Invite URL
            </label>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0E1620] p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-subtle">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-xs">
                {referralUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-[#16222F] hover:bg-slate-100 dark:hover:bg-[#1A2634] text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-subtle"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-matcha-green" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
        >
          Close
        </button>

      </div>
    </div>
  );
};
