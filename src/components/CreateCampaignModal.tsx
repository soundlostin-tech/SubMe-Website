import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  PlusCircle, 
  Coins, 
  ShieldCheck, 
  Award, 
  Sliders, 
  AlertCircle,
  Plus,
  Code,
  Music,
  Gamepad2
} from 'lucide-react';
import { Campaign, UserProfile } from '../types';
import { playSuccessFanfare } from '../utils/audio';

interface CreateCampaignModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onOpenVault: () => void;
  onCreateCampaign: (newCampaign: Campaign, totalCost: number) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  user,
  onClose,
  onOpenVault,
  onCreateCampaign,
}) => {
  if (!isOpen) return null;

  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=aircAruvnKk');
  const [title, setTitle] = useState('Deep Learning Foundations & Tensor Operations');
  const [channelName, setChannelName] = useState(user.name);
  const [category, setCategory] = useState('Coding & AI');
  
  const [targetSubscribers, setTargetSubscribers] = useState<number>(50);
  const [isVipSpotlight, setIsVipSpotlight] = useState<boolean>(false);
  
  const [watchDurationSec] = useState<number>(180);
  const [question, setQuestion] = useState('What core matrix calculation was shown in the first 20 seconds?');
  const [options, setOptions] = useState<string[]>([
    'Weight matrix dot product & activation mapping',
    'Relational database join operation',
    'Plain text regex parsing',
    'DNS server resolution query'
  ]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'aircAruvnKk';
  };

  const youtubeId = extractYouTubeId(videoUrl);

  const baseCost = targetSubscribers * 1.0;
  const vipCost = isVipSpotlight ? 50.0 : 0.0;
  const platformFee = 0.0;
  const totalCost = baseCost + vipCost + platformFee;
  const isBalanceSufficient = user.bugBalance >= totalCost;

  const handleQuickPreset = (presetType: string) => {
    if (presetType === 'tech') {
      setVideoUrl('https://www.youtube.com/watch?v=L_LUpnjgPso');
      setTitle('100+ Computer Science Concepts in Rapid Fire');
      setCategory('Coding & AI');
      setQuestion('Which computing layer abstracts low-level hardware memory registers?');
      setOptions([
        'The OS Kernel and System Call API',
        'Pure HTML5 doctype declaration',
        'The monitor power cable',
        'A browser cookie'
      ]);
      setCorrectAnswerIndex(0);
    } else if (presetType === 'gaming') {
      setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      setTitle('Next-Gen Gameplay Mechanics & Game Engine Shaders');
      setCategory('Entertainment');
      setQuestion('What engine render technique was demonstrated at 0:25?');
      setOptions([
        'Real-time Ray-Traced Lumen GI',
        'Monochrome sprite sheets',
        'Software rasterizer from 1993',
        'ASCII terminal rendering'
      ]);
      setCorrectAnswerIndex(0);
    } else if (presetType === 'music') {
      setVideoUrl('https://www.youtube.com/watch?v=M576WGiDBdQ');
      setTitle('Deep Focus Ambient Synthwave for Developers');
      setCategory('Music');
      setQuestion('What dominant neon lighting tone is visible in the studio environment?');
      setOptions([
        'Neon Violet and Deep Indigo Cyber Ambient',
        'Fluorescent harsh white',
        'Plain amber candlelight',
        'Pitch darkness'
      ]);
      setCorrectAnswerIndex(0);
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleDeployCampaign = () => {
    if (!title.trim() || !channelName.trim()) {
      setErrorMsg('Please enter a video title and channel name.');
      return;
    }

    if (!question.trim() || options.some(opt => !opt.trim())) {
      setErrorMsg('Please specify a comprehension question and all 4 options.');
      return;
    }

    if (!isBalanceSufficient) {
      setErrorMsg(`Insufficient BUG balance. You need ${totalCost.toFixed(2)} BUGs (₹${totalCost}) to launch.`);
      return;
    }

    setErrorMsg(null);

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      youtubeId,
      videoUrl,
      title: title.trim(),
      channelName: channelName.trim(),
      channelAvatar: user.avatar,
      channelId: `chan_${Date.now()}`,
      subscribersCount: user.channelSubscribers,
      currentProgress: 0,
      targetSubscribers,
      rewardBugs: 5.0,
      watchDurationSec: 180,
      question: question.trim(),
      options: options.map(o => o.trim()),
      correctAnswerIndex,
      isVip: isVipSpotlight,
      category,
      viewsCount: 1,
      likesCount: 1,
      uploadedAt: 'Just now',
      status: 'active',
      description: `Attention-verified campaign deployed by @${user.handle}. Watch for 180s (3 min) and complete attention check to earn 5 BUGs and subscribe.`,
      createdAt: Date.now(),
      creatorId: user.id,
    };

    onCreateCampaign(newCampaign, totalCost);
    playSuccessFanfare();

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#31465A', '#89B9E6', '#C7DFA3', '#ffffff'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-8 rounded-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-elevated space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#16222F] flex items-center justify-center text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-subtle">
              <PlusCircle className="w-5 h-5 text-deep-ocean dark:text-matcha-green" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Deploy Attention-Verified Task Live on Feed
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                1 BUG = ₹1 INR • 50 Subscribers Base Plan • 100% Real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#16222F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-bold whitespace-nowrap">
            Quick Fill:
          </span>
          <button
            type="button"
            onClick={() => handleQuickPreset('tech')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer transition-colors shadow-subtle"
          >
            <Code className="w-3.5 h-3.5 text-blue-500" />
            <span>Tech &amp; CS</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('music')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer transition-colors shadow-subtle"
          >
            <Music className="w-3.5 h-3.5 text-deep-ocean dark:text-matcha-green" />
            <span>Music &amp; Audio</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('gaming')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 dark:bg-[#0E1620] hover:bg-slate-100 dark:hover:bg-[#16222F] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer transition-colors shadow-subtle"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Entertainment</span>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5">
          
          {/* Inputs & Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold mb-1 uppercase">
                  YouTube Video Link or ID
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs md:text-sm focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold mb-1 uppercase">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Gen Tech Architecture"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs md:text-sm focus:outline-none focus:border-deep-ocean dark:focus:border-slate-500 shadow-subtle"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold mb-1 uppercase">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs shadow-subtle"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold mb-1 uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs shadow-subtle"
                  >
                    <option value="Coding & AI">Coding & AI</option>
                    <option value="Music">Music</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Gaming">Gaming</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold uppercase">
                Feed Preview Card
              </label>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-card">
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 text-[9px] font-mono text-slate-200 border border-slate-700">
                  LIVE TASK
                </div>
                {isVipSpotlight && (
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-deep-ocean text-[9px] font-bold text-white uppercase border border-slate-600">
                    VIP
                  </div>
                )}
                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-slate-300">
                  3 Min (180s) Proof
                </div>
              </div>
            </div>
          </div>

          {/* Paid Subscription Slider: 50 BUGs Base Plan */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white uppercase">
                  Paid Subscriber Subscription (1 BUG = ₹1 INR)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-white bg-deep-ocean dark:bg-slate-700 px-3 py-1 rounded-md border border-slate-600 shadow-subtle">
                {targetSubscribers} Subs ({baseCost.toFixed(0)} BUGs)
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={targetSubscribers}
                onChange={(e) => setTargetSubscribers(Number(e.target.value))}
                className="w-full accent-deep-ocean dark:accent-slate-500 cursor-pointer h-2 bg-slate-200 dark:bg-[#0E1620] rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>50 Subs (50 BUGs)</span>
                <span>250 Subs (250 BUGs)</span>
                <span>500 Subs (500 BUGs)</span>
                <span>1,000 Subs (1,000 BUGs)</span>
              </div>
            </div>

            {/* VIP Spotlight Booster */}
            <div className="p-3 rounded-lg bg-white dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-subtle">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="vipToggle"
                  checked={isVipSpotlight}
                  onChange={(e) => setIsVipSpotlight(e.target.checked)}
                  className="w-4 h-4 accent-deep-ocean dark:accent-slate-500 rounded cursor-pointer"
                />
                <label htmlFor="vipToggle" className="cursor-pointer">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>VIP Spotlight Booster</span>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-[#C7DFA3] bg-matcha-green/30 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-matcha-green/50 dark:border-emerald-800/60 font-bold">
                      +₹50.00 BUG
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">
                    Pins campaign at the top of home feed with priority attention placement.
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Attention Proof Settings */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white uppercase">
                  Timed Attention Proof Setup
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-300">Watch Window:</span>
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-deep-ocean dark:bg-slate-700 text-white border border-slate-600 shadow-subtle">
                  3 Min (180s)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold mb-1 uppercase">
                Comprehension Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What concept was introduced at 0:20?"
                className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs md:text-sm shadow-subtle"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                Multiple Choice Options (Select radio next to correct answer):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white dark:bg-[#0E1620] p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-subtle">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctAnswerIndex === idx}
                      onChange={() => setCorrectAnswerIndex(idx)}
                      className="accent-deep-ocean dark:accent-slate-500 w-4 h-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="bg-transparent text-xs text-slate-900 dark:text-white flex-1 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Ledger Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Target Real Subscribers ({targetSubscribers} @ 1 BUG/sub):</span>
              <span className="text-slate-900 dark:text-white font-bold">{baseCost.toFixed(2)} BUGs (₹{baseCost})</span>
            </div>
            {isVipSpotlight && (
              <div className="flex items-center justify-between text-emerald-700 dark:text-[#C7DFA3]">
                <span>VIP Spotlight Pinned Booster:</span>
                <span className="font-bold">+50.00 BUGs (₹50)</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Platform Verification & Anti-Cheat Fee:</span>
              <span className="font-bold text-emerald-700 dark:text-[#C7DFA3]">0.00 BUG (Free)</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px]">Total Campaign Investment:</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {totalCost.toFixed(2)} BUGs <span className="text-xs text-slate-500 dark:text-slate-300 font-normal">(₹{totalCost.toFixed(0)} INR)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px]">Your Wallet Balance:</span>
                <div className={`text-sm font-mono font-bold ${isBalanceSufficient ? 'text-emerald-700 dark:text-[#C7DFA3]' : 'text-rose-600 dark:text-rose-400'}`}>
                  {user.bugBalance.toFixed(2)} BUGs
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isBalanceSufficient && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVault();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-[#16222F] hover:bg-slate-200 dark:hover:bg-[#1E2C39] text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-subtle"
              >
                <Coins className="w-4 h-4 text-deep-ocean dark:text-matcha-green" />
                <span>Top Up via UPI</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDeployCampaign}
              disabled={!isBalanceSufficient}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-subtle transition-all cursor-pointer ${
                isBalanceSufficient
                  ? 'bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white border border-slate-600 active:scale-95'
                  : 'bg-slate-100 dark:bg-[#16222F] text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Plus className="w-4 h-4 text-matcha-green stroke-[2.5]" />
              <span>Deploy Task Live on Feed</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
