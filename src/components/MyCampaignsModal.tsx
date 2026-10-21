import React from 'react';
import { 
  X, 
  Layers, 
  Coins, 
  Users, 
  ShieldCheck, 
  Pause, 
  Play, 
  Trash2, 
  Plus, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Campaign, UserProfile } from '../types';

interface MyCampaignsModalProps {
  isOpen: boolean;
  user: UserProfile;
  campaigns: Campaign[];
  onClose: () => void;
  onOpenCreateCampaign: () => void;
  onToggleStatus: (campaignId: string) => void;
  onCancelCampaign: (campaignId: string) => void;
}

export const MyCampaignsModal: React.FC<MyCampaignsModalProps> = ({
  isOpen,
  user,
  campaigns,
  onClose,
  onOpenCreateCampaign,
  onToggleStatus,
  onCancelCampaign,
}) => {
  if (!isOpen) return null;

  const myCampaigns = campaigns.filter(c => c.creatorId === user.id);
  const totalSubsAcquired = myCampaigns.reduce((acc, c) => acc + c.currentProgress, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-8 rounded-3xl bg-[#0E1620] border-2 border-slate-700/80 p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#31465A] flex items-center justify-center text-white border border-slate-600 shadow-md">
              <Layers className="w-6 h-6 text-matcha-green" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-white uppercase tracking-tight">
                Creator Studio & Campaign Hub
              </h2>
              <p className="text-xs font-code text-slate-400">
                Track Attention-Verified Growth • 1 BUG = ₹1 INR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreateCampaign();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark dark:hover:bg-slate-600 text-white border border-slate-600 text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3] text-matcha-green" />
              <span>Deploy Task</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#16222F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-code">
          <div className="p-3.5 rounded-2xl bg-[#131D28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Real Subs Acquired</span>
            <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
              <Users className="w-5 h-5 text-matcha-green" />
              <span>+{totalSubsAcquired}</span>
            </div>
            <span className="text-[10px] text-matcha-green">100% Retained</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#131D28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Avg Attention</span>
            <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-[#89B9E6]" />
              <span>42.8s</span>
            </div>
            <span className="text-[10px] text-slate-400">Optimal AVD</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#131D28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">CPA (Cost per Sub)</span>
            <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
              <Coins className="w-5 h-5 text-slate-300" />
              <span>₹1.00 BUG</span>
            </div>
            <span className="text-[10px] text-slate-400">Pegged 1:1</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#131D28] border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase">Retention Score</span>
            <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-matcha-green" />
              <span>99.4%</span>
            </div>
            <span className="text-[10px] text-matcha-green">Zero Farm Bots</span>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">
            Your Deployed Campaigns
          </h3>

          {myCampaigns.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-[#131D28] border border-slate-800">
              <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white uppercase">No active campaigns</p>
              <p className="text-xs text-slate-400 mt-1">Deploy your first 50-subscriber task for 50 BUGs</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateCampaign();
                }}
                className="mt-4 px-5 py-2 rounded-xl bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white border border-slate-600 text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
              >
                + Launch 50 Sub Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myCampaigns.map((camp) => {
                const percent = Math.min(100, Math.round((camp.currentProgress / camp.targetSubscribers) * 100));
                const remainingSubs = Math.max(0, camp.targetSubscribers - camp.currentProgress);

                return (
                  <div
                    key={camp.id}
                    className="p-4 rounded-3xl bg-[#131D28] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://img.youtube.com/vi/${camp.youtubeId}/mqdefault.jpg`}
                          alt={camp.title}
                          className="w-20 aspect-video rounded-xl object-cover border border-[#31465A] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate max-w-md">{camp.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs font-code text-slate-400">
                            <span className="text-matcha-green font-bold">{camp.rewardBugs} BUGs reward</span>
                            {camp.isVip && (
                              <span className="px-1.5 py-0.2 rounded bg-[#31465A] text-white border border-slate-600 text-[9px] font-bold uppercase">
                                VIP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onToggleStatus(camp.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-code font-bold transition-all bg-[#0B1118] border border-slate-700 text-slate-300 hover:text-white"
                        >
                          {camp.status === 'active' ? (
                            <>
                              <Pause className="w-3.5 h-3.5 text-slate-300" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-slate-300" />
                              <span>Resume</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onCancelCampaign(camp.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 text-xs font-code border border-rose-800/60 transition-colors"
                          title={`Cancel & refund ${remainingSubs} unused BUGs`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel & Refund</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-code">
                        <span className="text-slate-400">Acquisition Progress:</span>
                        <span className="font-bold text-white">
                          {camp.currentProgress} / {camp.targetSubscribers} Subs ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#0B1118] rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-[#31465A] rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
