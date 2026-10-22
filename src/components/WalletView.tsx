import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Coins, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  Smartphone, 
  Shield, 
  AlertCircle,
  Clock,
  UserCheck,
  XCircle,
  PlusCircle,
  User,
  UploadCloud,
  Image as ImageIcon,
  Eye,
  Trash2,
  FileCheck,
  X
} from 'lucide-react';
import { UserProfile, WalletTransaction, PayoutClaim, DepositRequest } from '../types';
import { playCoinSound, playSuccessFanfare } from '../utils/audio';

interface WalletViewProps {
  user: UserProfile;
  accounts?: UserProfile[];
  transactions: WalletTransaction[];
  payoutClaims: PayoutClaim[];
  depositRequests: DepositRequest[];
  onRequestDeposit: (amount: number, utr: string, screenshotUrl?: string) => void;
  onApproveDeposit: (depositId: string) => void;
  onRejectDeposit: (depositId: string, reason?: string) => void;
  onDirectCreditUser?: (targetUserId: string, amount: number, note: string) => void;
  onSettleClaim: (claimId: string) => void;
  onRequestPayout?: (amount: number, vpa: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  accounts = [],
  transactions,
  payoutClaims,
  depositRequests = [],
  onRequestDeposit,
  onApproveDeposit,
  onRejectDeposit,
  onDirectCreditUser,
  onSettleClaim,
  onRequestPayout,
}) => {
  const officialVpa = 'theonlyvip786@okhdfcbank';
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState<boolean>(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [utrSuccessMsg, setUtrSuccessMsg] = useState<string | null>(null);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);

  // Search & filter for ledger
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerCategory, setLedgerCategory] = useState<'all' | 'reward' | 'topup' | 'spend'>('all');
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Cashout / Withdrawal Request state
  const [withdrawalVpa, setWithdrawalVpa] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('50');
  const [withdrawalMsg, setWithdrawalMsg] = useState<string | null>(null);

  // Admin Manual Direct Credit State
  const [adminTargetUserId, setAdminTargetUserId] = useState<string>('');
  const [adminCreditAmount, setAdminCreditAmount] = useState<string>('100');
  const [adminCreditNote, setAdminCreditNote] = useState<string>('Manual payment verification');
  const [adminCreditSuccess, setAdminCreditSuccess] = useState<string | null>(null);

  // Admin filter for deposit requests tab
  const [depositFilter, setDepositFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');

  // Mandatory Payment Screenshot State for Wallet View Deposit Form
  const [walletScreenshotUrl, setWalletScreenshotUrl] = useState<string | null>(null);
  const [walletScreenshotName, setWalletScreenshotName] = useState<string | null>(null);
  const walletFileInputRef = useRef<HTMLInputElement | null>(null);

  // Admin Screenshot Lightbox / Verification Modal State
  const [inspectingDeposit, setInspectingDeposit] = useState<DepositRequest | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; utr?: string } | null>(null);

  const presetAmounts = [50, 100, 250, 500, 1000];

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(officialVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleGenerateDemoUtr = () => {
    const randomUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setUtrNumber(randomUtr);
    setUtrError(null);
  };

  const handleWalletFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUtrError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUtrError('Screenshot file size exceeds 8MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setWalletScreenshotUrl(base64);
      setWalletScreenshotName(file.name);
      setUtrError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveWalletScreenshot = () => {
    setWalletScreenshotUrl(null);
    setWalletScreenshotName(null);
    if (walletFileInputRef.current) {
      walletFileInputRef.current.value = '';
    }
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (isNaN(amount) || amount < 50) {
      setUtrError('Minimum injection is ₹50 (50 BUGs).');
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      setUtrError('Please enter a valid 12-digit NPCI UTR reference number.');
      return;
    }

    // MANDATORY Screenshot validation
    if (!walletScreenshotUrl) {
      setUtrError('Payment screenshot is strictly MANDATORY. Please upload your transaction receipt/screenshot to proceed.');
      return;
    }

    setUtrError(null);
    setIsSubmittingUtr(true);

    setTimeout(() => {
      setIsSubmittingUtr(false);
      onRequestDeposit(amount, cleanUtr, walletScreenshotUrl);
      playSuccessFanfare();
      setUtrSuccessMsg(`Deposit request for ₹${amount} (UTR: ${cleanUtr}) submitted with proof! Admin will verify the screenshot and credit your BUGs.`);
      setUtrNumber('');
      setWalletScreenshotUrl(null);
      setWalletScreenshotName(null);
      if (walletFileInputRef.current) {
        walletFileInputRef.current.value = '';
      }
      setTimeout(() => setUtrSuccessMsg(null), 8000);
    }, 800);
  };

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 1500);
  };

  const handleCopyUtr = (utr: string, id: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtrId(id);
    setTimeout(() => setCopiedUtrId(null), 1500);
  };

  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawalAmount);
    if (!withdrawalVpa.includes('@')) {
      setWithdrawalMsg('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
      return;
    }
    if (isNaN(amt) || amt < 50) {
      setWithdrawalMsg('Minimum withdrawal amount is ₹50 (50 BUGs). Payouts below ₹50 cannot be requested.');
      return;
    }
    if (amt > user.bugBalance) {
      setWithdrawalMsg(`Insufficient balance. Maximum available: ₹${user.bugBalance}`);
      return;
    }

    if (onRequestPayout) {
      onRequestPayout(amt, withdrawalVpa.trim());
    }

    setWithdrawalMsg(`Payout claim of ₹${amt} submitted to NPCI desk. Batch settlement takes ~2 hours.`);
    setTimeout(() => {
      setWithdrawalMsg(null);
      setWithdrawalVpa('');
    }, 4000);
  };

  const handleAdminDirectCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = adminTargetUserId || (accounts.length > 0 ? accounts[0].id : '');
    const amt = Number(adminCreditAmount);
    if (!targetId) {
      alert('Please select a target user to credit.');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (onDirectCreditUser) {
      onDirectCreditUser(targetId, amt, adminCreditNote);
    }

    const targetAcc = accounts.find(a => a.id === targetId);
    setAdminCreditSuccess(`Successfully credited +${amt} BUGs to ${targetAcc ? targetAcc.name : targetId}!`);
    playCoinSound();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setAdminCreditSuccess(null), 4000);
  };

  // Calculations
  const settledClaims = payoutClaims.filter(c => c.status === 'settled');
  const pendingClaims = payoutClaims.filter(c => c.status === 'pending');
  const settledTotal = settledClaims.reduce((acc, c) => acc + c.amount, 0);

  // User's own deposits
  const myDeposits = depositRequests.filter(d => d.userId === user.id || d.userHandle === user.handle);
  const myPendingDepositsCount = myDeposits.filter(d => d.status === 'pending').length;

  // Admin view deposits
  const adminPendingDeposits = depositRequests.filter(d => d.status === 'pending');
  const filteredAdminDeposits = depositRequests.filter(d => {
    if (depositFilter === 'pending') return d.status === 'pending';
    if (depositFilter === 'approved') return d.status === 'approved';
    if (depositFilter === 'rejected') return d.status === 'rejected';
    return true;
  });

  const filteredTransactions = transactions.filter(t => {
    if (ledgerCategory !== 'all' && t.category !== ledgerCategory) return false;
    if (!ledgerSearch.trim()) return true;
    const q = ledgerSearch.toLowerCase();
    return (
      t.description.toLowerCase().includes(q) ||
      (t.hash && t.hash.toLowerCase().includes(q)) ||
      (t.utrRef && t.utrRef.toLowerCase().includes(q))
    );
  });

  const upiUri = `upi://pay?pa=${officialVpa}&pn=SubMe%20Vault&am=${selectedAmount}&cu=INR&tn=SubMe%20TopUp`;

  return (
    <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] text-slate-900 dark:text-slate-100 min-h-full transition-colors max-w-7xl mx-auto">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Liquid Vault &amp; Payouts
            </h1>
            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80">
              1 BUG = ₹1 INR
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time balance, verified UPI payment requests, Admin credit desk, and immutable ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-400">Admin Desk:</span>
          <span className="font-bold text-slate-900 dark:text-white">ACTIVE</span>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Available Balance */}
        <div className="p-4 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Available Balance
            </span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {user.bugBalance.toLocaleString()} BUGs
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              ₹{user.bugBalance.toLocaleString()} INR &bull; Liquid Spendable
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/70 text-[#C7DFA3] border border-emerald-800/60">
              1 BUG = ₹1 INR
            </span>
          </div>
        </div>

        {/* Card 2: Settled Payouts / Pending Claims */}
        <div className="p-4 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Total Withdrawn
            </span>
            <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              ₹{settledTotal.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {settledClaims.length} settlements processed to UPI
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#16222F] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Settled claims
            </span>
          </div>
        </div>

        {/* Card 3: Payment UPI ID */}
        <div className="p-4 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
              Official Payment UPI ID
            </span>
            <button
              onClick={handleCopyVpa}
              className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {copiedVpa ? 'COPIED!' : 'COPY ID'}
            </button>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight truncate">
              {officialVpa}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM
            </p>
          </div>
          <div className="pt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
              Admin Verifies &amp; Credits
            </span>
            {myPendingDepositsCount > 0 && (
              <span className="text-[10px] text-amber-500 font-mono font-bold">
                {myPendingDepositsCount} Pending
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 3. Deposit Desk: User Submits UTR for Admin Verification */}
      <div className="p-5 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono">
              Add Money to Wallet via UPI (1 BUG = ₹1 INR)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Admin Verified Credit Desk
          </span>
        </div>

        {/* Info Banner: Explains Admin Verification Rule */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <div className="space-y-0.5">
            <span className="font-bold">Payment Verification Policy:</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Transfer funds to official UPI ID <code className="font-mono bg-white/60 dark:bg-black/30 px-1 py-0.5 text-slate-900 dark:text-white">{officialVpa}</code> and enter your 12-digit UTR reference below. <b>The administrator will verify your payment against the bank statement and credit BUGs to your account.</b>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Preset Amount & UTR Form (7 cols) */}
          <form onSubmit={handleSubmitDeposit} className="md:col-span-7 space-y-4">
            
            {/* Amount Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Select Amount (₹ / BUGs)
              </label>

              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount(amt.toString());
                    }}
                    className={`py-1.5 px-1 text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedAmount === amt 
                        ? 'bg-[#1E2C39] dark:bg-slate-700 text-white font-bold shadow-2xs' 
                        : 'bg-slate-50 dark:bg-[#0E1620] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Custom Amount (₹)
              </label>
              <input
                type="number"
                min="50"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(Number(e.target.value) || 0);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 12-Digit UTR Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  NPCI 12-Digit UTR Reference Number <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDemoUtr}
                  className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Generate Test UTR
                </button>
              </div>

              <input
                type="text"
                maxLength={12}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 529381749201"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* MANDATORY PAYMENT SCREENSHOT UPLOAD */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C7DFA3]" />
                  <span>Payment Screenshot</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white font-mono font-bold">
                    MANDATORY
                  </span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">PNG, JPG, WebP</span>
              </div>

              <input
                ref={walletFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleWalletFileUpload}
                className="hidden"
                id="wallet-view-screenshot-upload"
              />

              {!walletScreenshotUrl ? (
                <div
                  onClick={() => walletFileInputRef.current?.click()}
                  className="p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-[#0E1620] text-center cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-5 h-5 mx-auto text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    Upload Payment Confirmation Screenshot
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Required for Admin Verification &bull; Click to Browse
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-white dark:bg-[#0E1620] border border-emerald-500/50 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img 
                      src={walletScreenshotUrl} 
                      alt="Receipt Preview" 
                      className="w-10 h-10 object-cover border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                      onClick={() => setLightboxImage({ url: walletScreenshotUrl, title: 'My Uploaded Receipt', utr: utrNumber })}
                    />
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-[#C7DFA3] block truncate">
                        {walletScreenshotName || 'payment_receipt.png'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Proof attached</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLightboxImage({ url: walletScreenshotUrl, title: 'My Uploaded Receipt', utr: utrNumber })}
                      className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      title="Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveWalletScreenshot}
                      className="p-1 text-rose-500 hover:text-rose-700"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error or Success */}
            {utrError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{utrError}</span>
              </div>
            )}

            {utrSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2 text-emerald-700 dark:text-[#C7DFA3] text-xs font-bold font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{utrSuccessMsg}</span>
              </div>
            )}

            {/* Submit Verification Button */}
            <button
              type="submit"
              disabled={isSubmittingUtr || utrNumber.length !== 12 || !walletScreenshotUrl}
              className={`w-full py-2.5 px-4 font-mono text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs ${
                !isSubmittingUtr && utrNumber.length === 12 && walletScreenshotUrl
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold active:scale-98'
                  : 'bg-slate-100 dark:bg-[#16222F] text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800'
              }`}
            >
              {isSubmittingUtr ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Submitting to Admin Queue...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {!walletScreenshotUrl 
                      ? 'Upload Screenshot to Proceed' 
                      : utrNumber.length !== 12 
                      ? 'Enter 12-Digit UTR' 
                      : 'Submit Payment for Admin Verification'}
                  </span>
                </>
              )}
            </button>

          </form>

          {/* Right Column: Google Pay Launcher & Withdrawals (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            
            <div className="p-4 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block pb-1 border-b border-slate-200/70 dark:border-slate-800">
                Direct UPI Payment
              </span>

              <a
                href={upiUri}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold shadow-2xs transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay ₹{selectedAmount} via Google Pay / UPI</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <div className="space-y-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-300">1.</span>
                  <span>Send ₹{selectedAmount} to <code className="text-slate-900 dark:text-slate-100 font-bold">{officialVpa}</code></span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-300">2.</span>
                  <span>Copy 12-digit UPI Reference / UTR number from app</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-300">3.</span>
                  <span>Paste on left &bull; Admin will verify and credit BUGs</span>
                </div>
              </div>
            </div>

            {/* Cashout / Withdrawal Box */}
            <div className="p-4 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block pb-1 border-b border-slate-200/70 dark:border-slate-800">
                Withdraw Earnings to UPI
              </span>

              <form onSubmit={handleRequestWithdrawal} className="space-y-2.5">
                <input
                  type="text"
                  value={withdrawalVpa}
                  onChange={(e) => setWithdrawalVpa(e.target.value)}
                  placeholder="Your UPI ID (e.g. mobile@okhdfcbank)"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                />

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="50"
                    max={user.bugBalance}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="Amount (₹)"
                    className="w-24 px-3 py-1.5 text-xs bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex-1 py-1.5 px-3 bg-[#1E2C39] dark:bg-slate-700 hover:bg-[#16222F] text-white font-mono text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    Request Payout
                  </button>
                </div>

                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Minimum payout: ₹50.00 (50 BUGs). Withdrawals below ₹50 cannot be requested.
                </p>

                {withdrawalMsg && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-[#C7DFA3] pt-0.5">
                    {withdrawalMsg}
                  </p>
                )}
              </form>
            </div>

          </div>

        </div>
      </div>

      {/* 4. My Submitted Deposits Queue (For all users who have submitted requests) */}
      {myDeposits.length > 0 && (
        <div className="p-5 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono">
                My Deposit Requests &amp; Verification Status
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {myDeposits.length} Requests Submitted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-[#16222F] text-[10.5px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Request ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">NPCI 12-Digit UTR</th>
                  <th className="py-2.5 px-3">Payment Proof</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-500">{dep.id}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-[#C7DFA3]">
                      ₹{dep.amount} ({dep.amount} BUGs)
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <code className="text-slate-900 dark:text-slate-100 font-bold">{dep.utr}</code>
                        <button
                          onClick={() => handleCopyUtr(dep.utr, dep.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Copy UTR"
                        >
                          {copiedUtrId === dep.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {dep.screenshotUrl ? (
                        <button
                          type="button"
                          onClick={() => setLightboxImage({ url: dep.screenshotUrl!, title: `My Payment Proof (₹${dep.amount})`, utr: dep.utr })}
                          className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer"
                          title="Click to view full screenshot"
                        >
                          <img src={dep.screenshotUrl} alt="Receipt thumbnail" className="w-7 h-7 object-cover" />
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                            <Eye className="w-3 h-3 text-emerald-500" /> Proof
                          </span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{dep.requestedAt}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        dep.status === 'approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                          : dep.status === 'rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}>
                        {dep.status === 'approved' ? '✓ Credited by Admin' : dep.status === 'rejected' ? '✗ Rejected' : '⏳ Awaiting Admin'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                      {dep.notes || (dep.status === 'pending' ? 'Verifying statement...' : 'Processed')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADMINISTRATOR PAYMENT VERIFICATION DESK (Visible ONLY to Admin) */}
      {user.role === 'admin' && (
        <div className="p-5 bg-white dark:bg-[#131D28] border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-card space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono flex items-center gap-2">
                  <span>Administrator Payment Verification &amp; BUGs Credit Desk</span>
                </h2>
                <p className="text-[11px] font-mono text-slate-500">
                  Verify user payment in your bank/GPay statement &bull; Click to credit BUGs instantly
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0E1620] p-1 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDepositFilter('pending')}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  depositFilter === 'pending' 
                    ? 'bg-amber-500 text-slate-950 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pending ({adminPendingDeposits.length})
              </button>
              <button
                onClick={() => setDepositFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  depositFilter === 'all' 
                    ? 'bg-[#1E2C39] dark:bg-slate-700 text-white shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({depositRequests.length})
              </button>
              <button
                onClick={() => setDepositFilter('approved')}
                className={`px-2.5 py-1 text-[11px] font-mono font-medium transition-all cursor-pointer ${
                  depositFilter === 'approved' 
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Approved
              </button>
            </div>
          </div>

          {/* Table of user deposit requests */}
          {filteredAdminDeposits.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 text-slate-500 font-mono text-xs">
              No deposit requests found under '{depositFilter}' filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-[#16222F] text-[10.5px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">User / Creator</th>
                    <th className="py-2.5 px-3">Amount (₹)</th>
                    <th className="py-2.5 px-3">NPCI 12-Digit UTR</th>
                    <th className="py-2.5 px-3">Payment Screenshot Proof</th>
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAdminDeposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-800 dark:text-slate-200">
                            {dep.userName ? dep.userName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{dep.userName}</div>
                            <div className="text-[10px] text-slate-400">{dep.userHandle}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-[#C7DFA3] text-sm">
                        ₹{dep.amount} <span className="text-xs font-normal text-slate-400">({dep.amount} BUGs)</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <code className="text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-[#0E1620] px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 select-all">
                            {dep.utr}
                          </code>
                          <button
                            onClick={() => handleCopyUtr(dep.utr, dep.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Copy UTR to verify in GPay/Bank"
                          >
                            {copiedUtrId === dep.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Payment Screenshot Column */}
                      <td className="py-3 px-3">
                        {dep.screenshotUrl ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={dep.screenshotUrl}
                              alt="Payment Screenshot"
                              onClick={() => setInspectingDeposit(dep)}
                              className="w-10 h-10 object-cover border border-slate-300 dark:border-slate-700 hover:border-emerald-500 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
                              title="Click to inspect payment screenshot"
                            />
                            <button
                              type="button"
                              onClick={() => setInspectingDeposit(dep)}
                              className="px-2 py-1 text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#16222F] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3 h-3 text-emerald-500" />
                              <span>Inspect</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-mono bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 border border-rose-200 dark:border-rose-900/40">
                            No Screenshot
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-500 text-[11px]">{dep.requestedAt}</td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          dep.status === 'approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                            : dep.status === 'rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                        }`}>
                          {dep.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {dep.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {dep.screenshotUrl && (
                              <button
                                onClick={() => setInspectingDeposit(dep)}
                                className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                title="Inspect screenshot receipt details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            )}
                            <button
                              onClick={() => onApproveDeposit(dep.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Verify payment and credit BUGs to this user"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify &amp; Credit BUGs</span>
                            </button>
                            <button
                              onClick={() => onRejectDeposit(dep.id, 'UTR not matched in bank statement')}
                              className="px-2.5 py-1.5 border border-rose-300 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition-colors cursor-pointer"
                              title="Reject invalid deposit request"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {dep.status === 'approved' ? '✓ Credited' : '✗ Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Admin Direct Manual Credit Tool */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono mb-2 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Admin Direct BUGs Credit Tool (Manual Injection)</span>
            </h3>

            <form onSubmit={handleAdminDirectCreditSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Target User</label>
                <select
                  value={adminTargetUserId}
                  onChange={(e) => setAdminTargetUserId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.handle}) - {acc.bugBalance} BUGs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Amount (BUGs)</label>
                <input
                  type="number"
                  min="1"
                  value={adminCreditAmount}
                  onChange={(e) => setAdminCreditAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Admin Verification Note</label>
                <input
                  type="text"
                  value={adminCreditNote}
                  onChange={(e) => setAdminCreditNote(e.target.value)}
                  placeholder="e.g. Bank credit verified"
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Direct Credit BUGs</span>
                </button>
              </div>
            </form>

            {adminCreditSuccess && (
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                {adminCreditSuccess}
              </p>
            )}
          </div>

        </div>
      )}

      {/* 6. Admin Desk: Payout Settlements (When Logged in as Admin) */}
      {user.role === 'admin' && (
        <div className="p-5 bg-white dark:bg-[#131D28] border border-amber-500/30 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight font-mono">
                Administrator Payout Settlement Switch
              </h2>
            </div>
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 border border-amber-200 dark:border-amber-500/30">
              {pendingClaims.length} Pending Claims
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-[#16222F] text-[10.5px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Beneficiary VPA</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payoutClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-500">{claim.id}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{claim.member} ({claim.handle})</td>
                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-semibold">{claim.vpa}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-[#C7DFA3]">₹{claim.amount}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        claim.status === 'settled'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {claim.status === 'pending' ? (
                        <button
                          onClick={() => onSettleClaim(claim.id)}
                          className="px-2.5 py-1 bg-[#1E2C39] dark:bg-slate-700 hover:bg-[#16222F] text-white text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          Settle via NPCI
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">UTR: {claim.utr}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Transaction Ledger & Rewards Stream */}
      <div className="p-5 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        
        {/* Stream Header + Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono">
                Wallet Ledger &amp; Transaction Audit Stream
              </h2>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Strictly authenticated audit events &bull; Real-time updates
            </p>
          </div>

          {/* Search + Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder="Search ledger..."
                className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none w-36 sm:w-44"
              />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-[#0E1620] p-0.5 border border-slate-200 dark:border-slate-700">
              {(['all', 'topup', 'reward', 'spend'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setLedgerCategory(cat)}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                    ledgerCategory === cat
                      ? 'bg-[#1E2C39] dark:bg-slate-700 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-xs">
            No transactions found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-[#16222F] text-[10.5px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Proof / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.amount >= 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          <span className={`text-[10px] font-bold uppercase ${
                            tx.category === 'topup' ? 'text-blue-500' : isCredit ? 'text-emerald-500' : 'text-slate-400'
                          }`}>
                            {tx.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {tx.description}
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {tx.timeStr || new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className={`py-3 px-3 font-extrabold text-sm ${
                        isCredit ? 'text-emerald-600 dark:text-[#C7DFA3]' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isCredit ? `+${tx.amount}` : tx.amount} BUGs
                      </td>

                      <td className="py-3 px-3 text-right">
                        {tx.hash ? (
                          <button
                            onClick={() => handleCopyHash(tx.hash!, tx.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title={tx.hash}
                          >
                            <span>{tx.hash.slice(0, 14)}...</span>
                            {copiedHashId === tx.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        ) : tx.utrRef ? (
                          <span className="text-[10px] text-slate-400 font-mono">UTR: {tx.utrRef}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Internal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Admin Deposit Verification & Screenshot Inspection Modal */}
      {inspectingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#131D28] border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16222F]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight font-mono">
                    Payment Screenshot Verification Desk
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    Verify user screenshot against your bank statement before crediting BUGs
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingDeposit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
              
              {/* Left Column: Full Screenshot View (7 cols) */}
              <div className="md:col-span-7 p-4 bg-slate-950 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 min-h-[300px] max-h-[60vh] overflow-auto">
                {inspectingDeposit.screenshotUrl ? (
                  <img
                    src={inspectingDeposit.screenshotUrl}
                    alt="Payment Receipt Screenshot"
                    className="max-h-[55vh] w-auto object-contain rounded shadow-lg"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 font-mono text-xs">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                    <span>No screenshot attached to this deposit request.</span>
                  </div>
                )}
              </div>

              {/* Right Column: Verification Metadata & Decision (5 cols) */}
              <div className="md:col-span-5 p-5 space-y-4 bg-white dark:bg-[#131D28] flex flex-col justify-between">
                
                <div className="space-y-3 font-mono text-xs">
                  
                  {/* User Profile Info */}
                  <div className="p-3 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant</span>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {inspectingDeposit.userName}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {inspectingDeposit.userHandle}
                    </div>
                    {inspectingDeposit.userEmail && (
                      <div className="text-slate-400 text-[11px]">
                        {inspectingDeposit.userEmail}
                      </div>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Requested Amount:</span>
                      <span className="font-extrabold text-base text-emerald-600 dark:text-[#C7DFA3]">
                        ₹{inspectingDeposit.amount} ({inspectingDeposit.amount} BUGs)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 block">Reported NPCI 12-Digit UTR:</span>
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-[#0E1620] px-2.5 py-1.5 border border-slate-200 dark:border-slate-800">
                        <code className="font-bold text-slate-900 dark:text-white select-all">
                          {inspectingDeposit.utr}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyUtr(inspectingDeposit.utr, inspectingDeposit.id)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-500">Submitted:</span>
                      <span className="text-slate-700 dark:text-slate-300">{inspectingDeposit.requestedAt}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Status:</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        inspectingDeposit.status === 'approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                          : inspectingDeposit.status === 'rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}>
                        {inspectingDeposit.status}
                      </span>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 space-y-1">
                    <span className="font-bold block">Verification Checklist:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                      <li>Amount matches screenshot: ₹{inspectingDeposit.amount}</li>
                      <li>UTR matches screenshot: {inspectingDeposit.utr}</li>
                      <li>Transaction matches bank statement</li>
                    </ul>
                  </div>

                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  {inspectingDeposit.status === 'pending' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onApproveDeposit(inspectingDeposit.id);
                          setInspectingDeposit(null);
                        }}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve &amp; Credit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onRejectDeposit(inspectingDeposit.id, 'Payment verification rejected by admin');
                          setInspectingDeposit(null);
                        }}
                        className="py-2 px-3 border border-rose-300 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 text-center text-xs font-mono text-slate-500 bg-slate-100 dark:bg-[#0E1620]">
                      Deposit request already {inspectingDeposit.status}.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setInspectingDeposit(null)}
                    className="w-full py-1.5 text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Standalone Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-w-3xl w-full bg-[#131D28] border border-slate-700 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>{lightboxImage.title}</span>
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/60 border border-slate-800 p-2">
              <img 
                src={lightboxImage.url} 
                alt="Payment Screenshot Lightbox" 
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              {lightboxImage.utr ? <span>UTR: <code className="text-white font-bold">{lightboxImage.utr}</code></span> : <span />}
              <button
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
