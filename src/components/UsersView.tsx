import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Plus, 
  Sliders, 
  X, 
  Check,
  ExternalLink,
  Mail,
  Copy,
  Video,
  Shield,
  Coins,
  CheckCircle,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Award
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
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [inspectUser, setInspectUser] = useState<UserProfile | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(50);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Creator promotional liquidity grant');
  const [isAdjustmentDone, setIsAdjustmentDone] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Normalize all user data into rich UserProfile objects
  const liveUsers: UserProfile[] = accounts.length > 0
    ? accounts.map(acc => {
        if (acc.id === currentUser.id) {
          return {
            ...acc,
            bugBalance: currentUser.bugBalance,
            completedTasksCount: currentUser.completedTasksCount,
          };
        }
        return acc;
      })
    : members.map(m => ({
        id: m.id,
        name: m.name,
        email: `${m.handle.replace('@', '').toLowerCase()}@subme.io`,
        handle: m.handle,
        role: m.status.toLowerCase().includes('admin') ? 'admin' : 'user',
        avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.handle || m.name)}`,
        channelUrl: `https://youtube.com/${m.handle}`,
        bugBalance: m.pts,
        channelSubscribers: 1000,
        referralCode: `REF-${m.id.slice(-4).toUpperCase()}`,
        completedTasksCount: m.tasksCompleted,
        activeCampaignsCount: 1,
        reputationScore: 98,
        subscribedChannelIds: [],
      }));

  // Filter by search query & role
  const filteredUsers = liveUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.channelUrl && u.channelUrl.toLowerCase().includes(q)) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const totalRegistered = liveUsers.length;
  const totalCreators = liveUsers.filter(u => u.role !== 'admin').length;
  const totalAdmins = liveUsers.filter(u => u.role === 'admin').length;
  const totalCirculatingPool = liveUsers.reduce((sum, u) => sum + (u.bugBalance || 0), 0);
  const totalCompletedTasks = liveUsers.reduce((sum, u) => sum + (u.completedTasksCount || 0), 0);

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const handleApplyAdjustment = () => {
    if (!selectedUser || adjustmentAmount === 0) return;
    onAdjustBalance(selectedUser.id, adjustmentAmount, adjustmentReason);
    setIsAdjustmentDone(true);
    setTimeout(() => {
      setIsAdjustmentDone(false);
      setSelectedUser(null);
    }, 1200);
  };

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 select-none bg-[#F8FAFC] dark:bg-[#0B1118] min-h-full transition-colors relative text-slate-800 dark:text-slate-100 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-[#C7DFA3]" />
            <span>Admin Users &amp; Registered Creators Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Full user accounts with email, official channel URLs, attention proof, and liquidity controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReferral}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2C39] dark:bg-slate-700 hover:bg-[#16222F] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Referral Tree (+₹5)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">
            Registered Accounts
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {totalRegistered}
          </div>
          <span className="text-[11px] text-slate-400">
            {totalCreators} Creators &bull; {totalAdmins} Admin
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">
            Verified Creators
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-[#C7DFA3] mt-1 font-mono">
            {totalCreators}
          </div>
          <span className="text-[11px] text-slate-400">Active YouTube &amp; Insta creators</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">
            Tasks Completed
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">
            {totalCompletedTasks}
          </div>
          <span className="text-[11px] text-slate-400">Attention proofs logged in engine</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono uppercase">
            Circulating Balance
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
            ₹{totalCirculatingPool.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">{totalCirculatingPool.toLocaleString()} BUGs held (₹1:1)</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#131D28] p-3 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-md w-full relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, handle, email, channel URL, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0E1620] p-1 border border-slate-200 dark:border-slate-700">
          {(['all', 'user', 'admin'] as const).map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 text-[11px] font-mono uppercase font-bold transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-[#1E2C39] dark:bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {role === 'all' ? `All Users (${liveUsers.length})` : role === 'user' ? 'Creators' : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Users Table */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131D28] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-[#16222F] border-b border-slate-200 dark:border-slate-800 text-[10.5px] uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">User / Member</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Official Channel URL</th>
                <th className="px-3 py-3">Role &amp; Status</th>
                <th className="px-3 py-3 text-center">Tasks Done</th>
                <th className="px-4 py-3 text-right">BUGs Balance</th>
                <th className="px-4 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 font-mono text-xs">
                    No users matching criteria '{search || roleFilter}'.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentUser = u.id === currentUser.id;
                  const channelLink = u.channelUrl && u.channelUrl.trim() !== '' ? u.channelUrl : null;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-[#16222F]/40 transition-colors">
                      
                      {/* 1. Member Profile & ID */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.handle || u.name)}`}
                            alt={u.name}
                            className="w-9 h-9 rounded-none object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`;
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                              <span>{u.name}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1 text-slate-600 dark:text-slate-300 font-mono">
                                  You
                                </span>
                              )}
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C7DFA3]" />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>{u.handle}</span>
                              <span>&bull;</span>
                              <span className="text-slate-500 select-all">{u.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Registered Email */}
                      <td className="px-4 py-3.5">
                        {u.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-800 dark:text-slate-200 font-mono select-all">
                              {u.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(u.email, u.id)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 cursor-pointer"
                              title="Copy Email"
                            >
                              {copiedEmailId === u.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not set</span>
                        )}
                      </td>

                      {/* 3. Official Channel URL */}
                      <td className="px-4 py-3.5">
                        {channelLink ? (
                          <a
                            href={channelLink.startsWith('http') ? channelLink : `https://${channelLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 max-w-[210px] truncate group"
                            title={channelLink}
                          >
                            <Video className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{channelLink.replace('https://', '').replace('www.', '')}</span>
                            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
                            No Channel Linked
                          </span>
                        )}
                      </td>

                      {/* 4. Role & Status */}
                      <td className="px-3 py-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border font-mono ${
                          u.role === 'admin'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        }`}>
                          {u.role === 'admin' ? '🛡 Platform Admin' : '✓ Verified Creator'}
                        </span>
                      </td>

                      {/* 5. Tasks Completed */}
                      <td className="px-3 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {u.completedTasksCount || 0}
                      </td>

                      {/* 6. BUGs Balance */}
                      <td className="px-4 py-3.5 text-right font-extrabold text-sm text-emerald-600 dark:text-[#C7DFA3]">
                        ₹{u.bugBalance.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-slate-400">({u.bugBalance} BUGs)</span>
                      </td>

                      {/* 7. Admin Operations */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectUser(u)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#16222F] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs flex items-center gap-1 transition-all"
                            title="Inspect complete user details"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Inspect</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setAdjustmentAmount(50);
                              setAdjustmentReason('Creator liquidity adjustment');
                            }}
                            className="px-2.5 py-1 bg-[#1E2C39] dark:bg-slate-700 hover:bg-[#16222F] text-white text-[11px] font-bold border border-slate-600 cursor-pointer shadow-2xs flex items-center gap-1 transition-all"
                            title="Adjust wallet BUG balance"
                          >
                            <Sliders className="w-3 h-3 text-emerald-400" />
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL USER DETAILS INSPECTION DRAWER/MODAL */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#131D28] border border-slate-300 dark:border-slate-700 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight font-mono">
                  User Account Inspection Dossier
                </h3>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="p-4 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <img
                src={inspectUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(inspectUser.handle || inspectUser.name)}`}
                alt={inspectUser.name}
                className="w-14 h-14 object-cover border border-slate-300 dark:border-slate-700 shrink-0"
              />
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{inspectUser.name}</h4>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border font-mono ${
                    inspectUser.role === 'admin'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200'
                  }`}>
                    {inspectUser.role}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500">{inspectUser.handle}</p>
                <p className="text-[11px] font-mono text-slate-400 select-all">User ID: {inspectUser.id}</p>
              </div>
            </div>

            {/* Detailed Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              
              <div className="p-3 bg-white dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered Email</span>
                <p className="font-bold text-slate-900 dark:text-white select-all">
                  {inspectUser.email || 'None'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Channel URL</span>
                {inspectUser.channelUrl ? (
                  <a
                    href={inspectUser.channelUrl.startsWith('http') ? inspectUser.channelUrl : `https://${inspectUser.channelUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{inspectUser.channelUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <p className="text-slate-400">None</p>
                )}
              </div>

              <div className="p-3 bg-white dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">BUGs Balance</span>
                <p className="font-extrabold text-base text-emerald-600 dark:text-[#C7DFA3]">
                  ₹{inspectUser.bugBalance.toLocaleString()} ({inspectUser.bugBalance} BUGs)
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Referral Code</span>
                <p className="font-bold text-slate-900 dark:text-white select-all">
                  {inspectUser.referralCode || 'None'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Tasks Completed</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {inspectUser.completedTasksCount || 0} attention tasks
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Campaigns</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {inspectUser.activeCampaignsCount || 0} tasks launched
                </p>
              </div>

            </div>

            {/* Quick Adjustment CTA inside inspection */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Close Dossier
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedUser(inspectUser);
                  setAdjustmentAmount(50);
                  setAdjustmentReason('Manual admin balance grant');
                  setInspectUser(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-2xs cursor-pointer active:scale-95"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust This User's Balance</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Member Balance Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight font-mono">
                  Adjust User BUGs Balance
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <img
                src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.handle || selectedUser.name)}`}
                alt={selectedUser.name}
                className="w-10 h-10 object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{selectedUser.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{selectedUser.handle}</p>
                <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-[#C7DFA3] mt-0.5">
                  Current Balance: ₹{selectedUser.bugBalance} ({selectedUser.bugBalance} BUGs)
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase mb-1 font-bold">
                  Adjustment Amount (BUGs / ₹ INR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  <div className="flex gap-1 shrink-0">
                    {[+20, +50, +100, -20].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => setAdjustmentAmount(prev => prev + delta)}
                        className="px-2 py-1 text-[11px] font-mono font-bold bg-slate-100 dark:bg-[#16222F] hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 uppercase mb-1 font-bold">
                  Audit Reason / Note (Saved to Ledger &amp; Supabase)
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs font-mono"
                  placeholder="e.g. Creator promotional grant"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-2xs uppercase tracking-wider"
              >
                {isAdjustmentDone ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{isAdjustmentDone ? 'Saved to Supabase!' : 'Apply & Sync'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
