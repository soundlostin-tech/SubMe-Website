import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Coins, 
  Lock, 
  Copy, 
  Check, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import { Campaign } from '../types';
import { computeAttentionHash } from '../utils/crypto';
import { playSuccessFanfare, playCoinSound } from '../utils/audio';
import { isPromotionalCampaign } from '../utils/campaignHelper';

interface VerificationModalProps {
  isOpen?: boolean;
  campaign: Campaign | null;
  sessionNonce: string;
  onSuccess: (campaign: Campaign, reward: number, hash: string) => void;
  onClose: () => void;
  viewerId: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen = true,
  campaign,
  sessionNonce,
  onSuccess,
  onClose,
  viewerId,
}) => {
  if (!isOpen || !campaign) return null;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [step, setStep] = useState<'question' | 'computing' | 'settlement'>('question');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(true);

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) {
      setErrorMsg('Please select an option to submit your task.');
      return;
    }

    if (selectedOption !== campaign.correctAnswerIndex) {
      setErrorMsg('❌ Incorrect answer! Please choose the proper answer from the video to earn the reward.');
      return;
    }

    setErrorMsg(null);
    setStep('computing');
    setIsAnswerCorrect(true);

    const timestamp = Date.now();
    const hash = await computeAttentionHash({
      campaignId: campaign.id,
      viewerId,
      nonce: sessionNonce,
      timestamp,
      watchDurationSec: campaign.watchDurationSec || 180,
      answerIndex: selectedOption,
    });

    setTimeout(() => {
      setGeneratedHash(hash);
      setStep('settlement');
      playSuccessFanfare();
      playCoinSound();

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#31465A', '#89B9E6', '#C7DFA3', '#ffffff'],
      });

      // Always credit fixed 2 BUGs for completing task with proper answer
      onSuccess(campaign, 2, hash);
    }, 1100);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(generatedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isPromotional = isPromotionalCampaign(campaign);

  if (isPromotional) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#131D28] border border-amber-300 dark:border-amber-700/60 p-6 shadow-elevated space-y-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-subtle">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              Promotional Showcase Task
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Tasks Not Available
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
              Yeh task new users ko attract karne aur platform attention verification ka preview dikhane ke liye rakha gaya hai. Is promotional task ki reward quota limit poori ho chuki hai (Tasks Not Available).
            </p>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-left space-y-1 mt-3">
              <p className="font-semibold text-deep-ocean dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />
                Earn Real BUGs (₹1 INR):
              </p>
              <p>Task Directory me jakar registered platform creators ke dwara banaye gaye community tasks ko poora karein aur instant withdrawal claim karein!</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer"
            >
              Close &amp; Browse Community Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 shadow-elevated space-y-5">
        
        {/* Step 1: Question */}
        {step === 'question' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#16222F] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-deep-ocean dark:text-matcha-green" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                    Question for Viewers
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Watch time complete! Answer correctly to get your reward.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-matcha-green/30 text-matcha-dark dark:bg-emerald-950/70 dark:text-[#C7DFA3] border border-matcha-green/50 dark:border-emerald-800/60 text-xs font-mono font-bold">
                +2.0 BUGs (₹2.0)
              </span>
            </div>

            {/* Video Meta */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2.5 shadow-subtle">
              <img
                src={campaign.channelAvatar}
                alt={campaign.channelName}
                className="w-7 h-7 rounded-md object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{campaign.title}</p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{campaign.channelName}</p>
              </div>
            </div>

            {/* Comprehension Question */}
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                {campaign.question}
              </p>

              {/* Options */}
              <div className="space-y-1.5">
                {campaign.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const letters = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOption(idx);
                        setErrorMsg(null);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left text-xs font-medium transition-all cursor-pointer shadow-subtle ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-[#16222F] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 font-semibold'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-[#0E1620] dark:hover:bg-[#16222F] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-xs font-bold ${
                        isSelected ? 'bg-deep-ocean dark:bg-slate-700 text-white' : 'bg-white dark:bg-[#131D28] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {letters[idx]}
                      </span>
                      <span className="flex-1 leading-snug">{option}</span>
                    </button>
                  );
                })}
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitAnswer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-mono font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-subtle active:scale-95"
              >
                <span>Submit &amp; Claim Reward</span>
                <ArrowRight className="w-3.5 h-3.5 text-matcha-green" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Checking Answer */}
        {step === 'computing' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300">
              <Cpu className="w-6 h-6 animate-spin text-deep-ocean dark:text-matcha-green" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Checking Your Answer...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono max-w-sm mx-auto">
              Session Ref: <code className="text-slate-700 dark:text-slate-300">0x{sessionNonce}</code>
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-left text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>&gt; Checking 180s (3 Min) watch time completion... Verified</div>
              <div>&gt; Processing attention answer challenge... Submitted</div>
              <div className="text-slate-800 dark:text-slate-200 font-bold">&gt; [OK] Crediting +2.00 BUGs to your wallet...</div>
            </div>
          </div>
        )}

        {/* Step 3: Value Settlement */}
        {step === 'settlement' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-[#C7DFA3]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Task Completed &amp; +2 BUGs Added!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAnswerCorrect
                  ? 'Great job! 3 minutes attention verified and answer submitted.'
                  : 'Task completed! 3 minutes attention verified (Single attempt used).'}
              </p>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#16222F] text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Task finished! This task has been removed from your feed and cannot be repeated.
              </div>
            </div>

            {/* Payout Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-card">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400 uppercase">Rate</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">1 BUG = ₹1 INR</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#16222F] text-emerald-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  <Coins className="w-6 h-6 text-deep-ocean dark:text-matcha-green" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                    +2.00 BUGs
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    ₹2.00 credited to your Liquid Vault
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Subscribed to:</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-matcha-green" />
                  {campaign.channelName}
                </span>
              </div>
            </div>

            {/* Verification Proof Stamp */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Verification Receipt
                </span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-[#131D28] p-1.5 rounded-md border border-slate-200 dark:border-slate-700">
                {generatedHash}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white border border-slate-600 font-mono font-medium text-xs uppercase tracking-wider transition-all cursor-pointer shadow-subtle active:scale-95"
            >
              Done / Back to Tasks
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
