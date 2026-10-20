import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Smartphone,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../types';
import { playSuccessFanfare } from '../utils/audio';

interface UPILiquidVaultModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onRequestDeposit: (amount: number, utr: string) => void;
}

export const UPILiquidVaultModal: React.FC<UPILiquidVaultModalProps> = ({
  isOpen,
  user,
  onClose,
  onRequestDeposit,
}) => {
  if (!isOpen) return null;

  const officialVpa = 'theonlyvip786@okhdfcbank';
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const presetAmounts = [50, 100, 250, 500, 1000];

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
    setErrorMsg(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = Number(val);
    if (!isNaN(num)) {
      setSelectedAmount(num);
    }
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(officialVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleGenerateDemoUtr = () => {
    const randomUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setUtrNumber(randomUtr);
    setErrorMsg(null);
  };

  const handleSubmitDeposit = () => {
    const amount = Number(customAmount);
    if (isNaN(amount) || amount < 50) {
      setErrorMsg('Minimum injection is ₹50 (50 BUGs).');
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg('Please enter a valid 12-digit NPCI UTR reference number.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    setSubmitStep('Formatting NPCI transaction record...');

    setTimeout(() => {
      setSubmitStep(`Routing UTR ${cleanUtr} to Admin Verification Desk...`);
    }, 600);

    setTimeout(() => {
      setSubmitStep('Registering deposit request in ledger...');
    }, 1200);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      playSuccessFanfare();
      onRequestDeposit(amount, cleanUtr);
    }, 1800);
  };

  const upiUri = `upi://pay?pa=${officialVpa}&pn=SubMe%20Liquid%20Vault&am=${selectedAmount}&cu=INR&tn=SubMe%20Growth%20Engine`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-8 rounded-none bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-elevated space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-emerald-500/10 flex items-center justify-center text-slate-800 dark:text-white border border-emerald-500/30">
              <Coins className="w-5 h-5 text-emerald-600 dark:text-[#C7DFA3]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Add BUGs via UPI
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                1 BUG = ₹1 INR &bull; Admin Verified Credit Desk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <div className="space-y-5">
            
            {/* Notice: Admin Verification Requirement */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="space-y-0.5">
                <span className="font-bold">Admin Verification Notice</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  After payment, enter your 12-digit UTR reference number below. <b>Admin will verify the bank payment and credit your BUGs</b> to prevent fraud and maintain the ₹1 = 1 BUG peg.
                </p>
              </div>
            </div>

            {/* Amount Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold uppercase">
                Select Amount (INR / BUGs)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2 px-1 text-xs md:text-sm font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E2C39] dark:bg-slate-700 text-white border border-slate-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#0E1620] dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="pt-1 flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Custom ₹:</span>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
                <span className="text-xs font-mono text-emerald-700 dark:text-[#C7DFA3] font-bold">
                  = {selectedAmount || 0} BUGs
                </span>
              </div>
            </div>

            {/* Official Platform Payment Details */}
            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-4">
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-900/40">
                    UPI
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      SubMe Official UPI Account
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      NPCI Verified Merchant &bull; 1 BUG = ₹1 INR
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950/70 text-[#C7DFA3] border border-emerald-800/60 text-[10px] font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Merchant</span>
                </div>
              </div>

              {/* UPI ID Box with One-Click Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Official UPI ID:</span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 border border-blue-200 dark:border-blue-900/40">
                    Google Pay / PhonePe / Paytm / BHIM
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0E1620] px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <code className="text-sm font-mono font-extrabold text-slate-900 dark:text-white select-all">
                    {officialVpa}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                    title="Copy UPI ID"
                  >
                    {copiedVpa ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                        <span>Copy UPI ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct UPI Intent Link / GPay CTA */}
              <div className="pt-0.5">
                <a
                  href={upiUri}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#1E2C39] dark:bg-slate-700 hover:bg-[#16222F] text-white font-semibold text-xs transition-all shadow-2xs text-center"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Pay ₹{selectedAmount || 50} via UPI App</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-white/70 dark:bg-[#0E1620]/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>How it works:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 font-mono text-[10px]">
                  <div className="p-2 bg-slate-50 dark:bg-[#131D28] border border-slate-200/80 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">1. Send ₹{selectedAmount || 50}</span>
                    <span>Transfer to {officialVpa} via GPay/PhonePe</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-[#131D28] border border-slate-200/80 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">2. Paste 12-Digit UTR</span>
                    <span>Enter your reference number below</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-[#131D28] border border-slate-200/80 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">3. Admin Verifies &amp; Credits</span>
                    <span>Admin verifies statement and credits BUGs</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 12-Digit UTR */}
            <div className="space-y-2 p-4 bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold uppercase">
                  12-Digit NPCI UTR Reference Number
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDemoUtr}
                  className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Generate Test UTR
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 428819284711"
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs tracking-widest placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-mono text-slate-400">
                  {utrNumber.length}/12
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSubmitting && (
              <div className="p-4 bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-900 dark:text-white font-bold">{submitStep}</p>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Registering verification request...</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSubmitDeposit}
                disabled={isSubmitting || utrNumber.length !== 12}
                className={`flex items-center gap-2 px-5 py-2.5 font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  !isSubmitting && utrNumber.length === 12
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold active:scale-95 shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#16222F] text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit UTR for Admin Verification</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-2xs">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Deposit Submitted to Admin!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                NPCI UTR: <span className="text-slate-900 dark:text-white font-bold">{utrNumber}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 max-w-sm mx-auto space-y-2 shadow-2xs text-left">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Requested Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{selectedAmount} ({selectedAmount} BUGs)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Verification Status:</span>
                <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 border border-amber-500/30">
                  Pending Admin Review
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                The Admin will verify your payment against official bank statement. Upon verification, {selectedAmount} BUGs will be credited to your wallet.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer active:scale-95"
            >
              Done &bull; Check Status in Wallet
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
