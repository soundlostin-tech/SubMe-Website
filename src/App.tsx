import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { TasksView } from './components/TasksView';
import { CreateTaskView } from './components/CreateTaskView';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { WatchPage } from './components/WatchPage';
import { OverviewView } from './components/OverviewView';
import { UsersView } from './components/UsersView';
import { PayoutsView } from './components/PayoutsView';
import { TransactionsView } from './components/TransactionsView';
import { SettingsView } from './components/SettingsView';
import { MobileBottomBar } from './components/MobileBottomBar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { VerificationModal } from './components/VerificationModal';
import { CreateCampaignModal } from './components/CreateCampaignModal';
import { UPILiquidVaultModal } from './components/UPILiquidVaultModal';
import { ReferralModal } from './components/ReferralModal';
import { LedgerModal } from './components/LedgerModal';
import { AuthModal } from './components/AuthModal';
import { AuthView } from './components/AuthView';
import { SupabaseModal } from './components/SupabaseModal';
import { checkSupabaseConnection } from './lib/supabase';
import { 
  fetchCampaignsFromDb, 
  fetchProfilesFromDb,
  fetchDepositRequestsFromDb,
  createCampaignInDb, 
  createDepositRequestInDb,
  updateDepositRequestStatusInDb,
  updateCampaignProgressInDb, 
  upsertProfileToDb, 
  recordTransactionInDb, 
  recordTaskCompletionInDb 
} from './lib/supabaseService';
import { 
  Campaign, 
  UserProfile, 
  WalletTransaction,
  PayoutClaim,
  DepositRequest,
  AuditSentinelEvent,
  MemberProfile
} from './types';
import { 
  DEFAULT_ADMIN_USER,
  INITIAL_CAMPAIGNS, 
  INITIAL_TRANSACTIONS,
  INITIAL_PAYOUT_CLAIMS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MEMBERS,
  FEATURED_CREATORS
} from './data/mockData';
import { syncAllFeaturedCreators, checkAndRunDailyAutoSync } from './services/youtubeSyncService';
import { getYouTubeAvatarUrl } from './utils/youtubeAvatar';

export const App: React.FC = () => {
  // Accounts persistence (Admin + Real Registered Users)
  const [accounts, setAccounts] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('subme_accounts_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(u => u.id !== 'usr_creator_01' && u.email !== 'creator@subme.io');
          if (cleaned.length > 0) return cleaned;
        }
      } catch (e) {
        /* fallback */
      }
    }
    return [DEFAULT_ADMIN_USER];
  });

  // Active authenticated user session (null by default so opening website shows signin/signup first)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      localStorage.removeItem('subme_session_user_v9');
      localStorage.removeItem('subme_session_user_v8');
    } catch (e) {
      /* ignore */
    }

    const saved = sessionStorage.getItem('subme_auth_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch (e) {
        /* fallback */
      }
    }
    return null;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('subme_campaigns_v9');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    if (user?.id) {
      const savedTx = localStorage.getItem(`subme_tx_v8_${user.id}`);
      if (savedTx) {
        try { return JSON.parse(savedTx); } catch (e) { /* ignore */ }
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [payoutClaims, setPayoutClaims] = useState<PayoutClaim[]>(() => {
    const saved = localStorage.getItem('subme_payouts_v8');
    return saved ? JSON.parse(saved) : INITIAL_PAYOUT_CLAIMS;
  });

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('subme_deposit_requests_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditSentinelEvent[]>(() => {
    const saved = localStorage.getItem('subme_audit_v8');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [members, setMembers] = useState<MemberProfile[]>(() => {
    const saved = localStorage.getItem('subme_members_v8');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('subme_accounts_v8', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('subme_auth_session', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('subme_auth_session');
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`subme_tx_v8_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user?.id]);

  useEffect(() => {
    localStorage.setItem('subme_campaigns_v9', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('subme_payouts_v8', JSON.stringify(payoutClaims));
  }, [payoutClaims]);

  useEffect(() => {
    localStorage.setItem('subme_deposit_requests_v1', JSON.stringify(depositRequests));
  }, [depositRequests]);

  useEffect(() => {
    localStorage.setItem('subme_audit_v8', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('subme_members_v8', JSON.stringify(members));
  }, [members]);

  // Theme state: defaults to dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('subme_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'dark') {
      el.classList.add('dark');
      document.body.classList.add('dark');
      el.style.colorScheme = 'dark';
    } else {
      el.classList.remove('dark');
      document.body.classList.remove('dark');
      el.style.colorScheme = 'light';
    }
    localStorage.setItem('subme_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Modals for quick overlay actions
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState<boolean>(false);

  // Global keyboard shortcuts (Cmd+1..5, Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('home'); setSelectedCampaign(null); }
        else if (e.key === '2') { e.preventDefault(); setActiveTab('create-task'); setSelectedCampaign(null); }
        else if (e.key === '3') { e.preventDefault(); setActiveTab('tasks'); setSelectedCampaign(null); }
        else if (e.key === '4') { e.preventDefault(); setActiveTab('wallet'); setSelectedCampaign(null); }
        else if (e.key === '5') { e.preventDefault(); setActiveTab('profile'); setSelectedCampaign(null); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Verification modal state
  const [verificationModalState, setVerificationModalState] = useState<{
    isOpen: boolean;
    campaign: Campaign | null;
    sessionNonce: string;
  }>({
    isOpen: false,
    campaign: null,
    sessionNonce: '',
  });

  // Supabase Live Connection State
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  const checkConnection = async () => {
    try {
      const res = await checkSupabaseConnection();
      setIsSupabaseLive(res.connected);
      if (res.connected && res.tablesFound) {
        const [remoteCampaigns, remoteProfiles, remoteDeposits] = await Promise.all([
          fetchCampaignsFromDb(),
          fetchProfilesFromDb(),
          fetchDepositRequestsFromDb()
        ]);
        if (remoteCampaigns && remoteCampaigns.length > 0) {
          setCampaigns(remoteCampaigns);
        }
        if (remoteDeposits && remoteDeposits.length > 0) {
          setDepositRequests(remoteDeposits);
        }
        if (remoteProfiles && remoteProfiles.length > 0) {
          setAccounts(prev => {
            const map = new Map<string, UserProfile>();
            remoteProfiles.forEach(p => map.set(p.id, p));
            prev.forEach(p => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      setIsSupabaseLive(false);
    }
  };

  useEffect(() => {
    checkConnection();
    checkAndRunDailyAutoSync(campaigns, FEATURED_CREATORS, (newCamps) => {
      setCampaigns(newCamps);
    });
  }, []);

  const handleUpdateChannelUrl = (newUrl: string, newAvatar: string) => {
    if (!user) return;
    updateUserRecord(prev => ({
      ...prev,
      channelUrl: newUrl,
      avatar: newAvatar,
    }));
  };

  const handleManualYouTubeSync = async (): Promise<number> => {
    const result = await syncAllFeaturedCreators(campaigns, FEATURED_CREATORS);
    if (result.syncedCount > 0) {
      setCampaigns(result.updatedCampaigns);
      const now = Date.now();
      const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newAuditLog: AuditSentinelEvent = {
        id: `aud_${now}`,
        type: 'AUDIT EVENT',
        title: `YOUTUBE_DAILY_SYNC: ${result.syncedCount} channels updated with latest daily videos`,
        time: timeFormatted,
        timestamp: now,
      };
      setAuditLogs(prev => [newAuditLog, ...prev]);
    }
    return result.syncedCount;
  };

  const updateUserRecord = (updater: (prev: UserProfile) => UserProfile) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updated = updater(prevUser);
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => acc.id === updated.id ? updated : acc)
      );
      upsertProfileToDb(updated).catch(() => {});
      return updated;
    });
  };

  const handleLogin = (selectedUser: UserProfile) => {
    setUser(selectedUser);
    sessionStorage.setItem('subme_auth_session', JSON.stringify(selectedUser));
    upsertProfileToDb(selectedUser).catch(() => {});
    const savedTx = localStorage.getItem(`subme_tx_v8_${selectedUser.id}`);
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch (e) {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }
    // If admin logged in, set default tab to overview
    if (selectedUser.role === 'admin') {
      setActiveTab('overview');
    } else {
      setActiveTab('home');
    }
  };

  const handleRegister = (newUser: UserProfile) => {
    setAccounts(prev => [newUser, ...prev]);
    setUser(newUser);
    sessionStorage.setItem('subme_auth_session', JSON.stringify(newUser));
    upsertProfileToDb(newUser).catch(() => {});
    setTransactions([]);
    localStorage.setItem(`subme_tx_v8_${newUser.id}`, JSON.stringify([]));
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('subme_auth_session');
    localStorage.removeItem('subme_session_user_v9');
    localStorage.removeItem('subme_session_user_v8');
  };

  const handleSelectCampaign = (camp: Campaign) => {
    setSelectedCampaign(camp);
    const newLog: AuditSentinelEvent = {
      id: `aud_${Date.now()}`,
      type: 'AUDIT EVENT',
      title: `Task Started: ${camp.title.slice(0, 36)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleBackToFeed = () => {
    setSelectedCampaign(null);
  };

  const handleTriggerVerification = (camp: Campaign, sessionNonce: string) => {
    setVerificationModalState({
      isOpen: true,
      campaign: camp,
      sessionNonce,
    });
  };

  const handleVerificationSuccess = (camp: Campaign, reward: number, hash: string) => {
    if (!user) return;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updateUserRecord(prev => ({
      ...prev,
      bugBalance: prev.bugBalance + reward,
      completedTasksCount: prev.completedTasksCount + 1,
      subscribedChannelIds: prev.subscribedChannelIds.includes(camp.channelId)
        ? prev.subscribedChannelIds
        : [...prev.subscribedChannelIds, camp.channelId],
    }));

    setCampaigns(prev => prev.map(c => {
      if (c.id === camp.id) {
        const nextProgress = c.currentProgress + 1;
        return {
          ...c,
          currentProgress: nextProgress,
          subscribersCount: c.subscribersCount + 1,
          status: nextProgress >= c.targetSubscribers ? 'completed' : c.status,
        };
      }
      return c;
    }));

    if (selectedCampaign && selectedCampaign.id === camp.id) {
      setSelectedCampaign(prev => prev ? {
        ...prev,
        currentProgress: prev.currentProgress + 1,
        subscribersCount: prev.subscribersCount + 1,
      } : null);
    }

    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: 'EARNED_TASK',
      category: 'reward',
      amount: reward,
      timestamp: now,
      timeStr: timeFormatted,
      userId: user.handle.replace('@', ''),
      description: `Task Completed: ${camp.title}`,
      campaignTitle: camp.title,
      hash,
    };
    setTransactions(prev => [newTx, ...prev]);

    // Sync to Supabase
    recordTaskCompletionInDb({
      id: `comp_${now}`,
      campaignId: camp.id,
      viewerId: user.id,
      rewardBugs: reward,
      sha256Hash: hash,
    }).catch(() => {});
    updateCampaignProgressInDb(
      camp.id,
      camp.currentProgress + 1,
      camp.subscribersCount + 1,
      camp.currentProgress + 1 >= camp.targetSubscribers ? 'completed' : camp.status
    ).catch(() => {});
    recordTransactionInDb(newTx).catch(() => {});

    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `Verification Nonce SHA-256 Passed: ${camp.title.slice(0, 32)}`,
      time: timeFormatted,
      timestamp: now,
      hash,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleCreateCampaign = (newCamp: Campaign, totalCost: number) => {
    if (!user) return;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updateUserRecord(prev => ({
      ...prev,
      bugBalance: Math.max(0, prev.bugBalance - totalCost),
      activeCampaignsCount: prev.activeCampaignsCount + 1,
    }));

    setCampaigns(prev => [newCamp, ...prev]);

    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: 'CAMPAIGN_LAUNCH',
      category: 'spend',
      amount: -totalCost,
      timestamp: now,
      timeStr: timeFormatted,
      userId: user.handle.replace('@', ''),
      description: `Channel Promotion Request: ${newCamp.videoUrl} (${newCamp.targetSubscribers} Subs)`,
      campaignTitle: newCamp.title,
      hash: `camp_sha256_${now.toString(16)}`,
    };
    setTransactions(prev => [newTx, ...prev]);

    // Sync to Supabase
    createCampaignInDb(newCamp).catch(() => {});
    recordTransactionInDb(newTx).catch(() => {});

    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `CAMPAIGN_DEPLOYED: ${newCamp.title.slice(0, 32)}...`,
      time: timeFormatted,
      timestamp: now,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleRequestDeposit = (amount: number, utr: string) => {
    if (!user) return;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newReq: DepositRequest = {
      id: `dep_${now}`,
      userId: user.id,
      userName: user.name,
      userHandle: user.handle,
      userEmail: user.email,
      amount,
      utr,
      status: 'pending',
      requestedAt: timeFormatted,
      timestamp: now,
    };

    setDepositRequests(prev => [newReq, ...prev]);
    createDepositRequestInDb(newReq).catch(() => {});

    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `DEPOSIT_SUBMITTED: ₹${amount} (${user.handle}, UTR: ${utr}) awaiting Admin Verification`,
      time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleApproveDeposit = (depositId: string) => {
    const req = depositRequests.find(d => d.id === depositId);
    if (!req || req.status !== 'pending') return;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update deposit status to approved
    setDepositRequests(prev => prev.map(d => d.id === depositId ? {
      ...d,
      status: 'approved',
      reviewedAt: new Date(now).toISOString(),
      reviewedBy: user?.name || 'Administrator',
    } : d));
    updateDepositRequestStatusInDb(depositId, 'approved', user?.name || 'Administrator').catch(() => {});

    // 2. Credit BUGs to target user's account
    setAccounts(prev => prev.map(acc => {
      if (acc.id === req.userId || acc.handle === req.userHandle) {
        const updated = { ...acc, bugBalance: acc.bugBalance + req.amount };
        upsertProfileToDb(updated).catch(() => {});
        return updated;
      }
      return acc;
    }));

    // If currently logged-in user is the user who requested, update active user state
    if (user && (user.id === req.userId || user.handle === req.userHandle)) {
      setUser(prev => prev ? { ...prev, bugBalance: prev.bugBalance + req.amount } : null);
    }

    // 3. Create wallet transaction for the target user
    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: 'UPI_TOPUP',
      category: 'topup',
      amount: req.amount,
      timestamp: now,
      timeStr: timeFormatted,
      userId: req.userHandle.replace('@', ''),
      description: `Payment Verified & Credited by Admin (UTR: ${req.utr})`,
      utrRef: req.utr,
      hash: `npc_${req.utr}_${now.toString(16)}`,
    };

    const userTxKey = `subme_tx_v8_${req.userId}`;
    try {
      const existingUserTx = JSON.parse(localStorage.getItem(userTxKey) || '[]');
      localStorage.setItem(userTxKey, JSON.stringify([newTx, ...existingUserTx]));
    } catch (e) {}

    if (user && (user.id === req.userId || user.handle === req.userHandle)) {
      setTransactions(prev => [newTx, ...prev]);
    }
    recordTransactionInDb(newTx).catch(() => {});

    // 4. Log audit event
    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `ADMIN_CREDIT_APPROVED: +${req.amount} BUGs credited to ${req.userHandle} (UTR: ${req.utr})`,
      time: timeFormatted,
      timestamp: now,
      hash: newTx.hash,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleRejectDeposit = (depositId: string, reason?: string) => {
    const req = depositRequests.find(d => d.id === depositId);
    if (!req || req.status !== 'pending') return;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setDepositRequests(prev => prev.map(d => d.id === depositId ? {
      ...d,
      status: 'rejected',
      reviewedAt: new Date(now).toISOString(),
      reviewedBy: user?.name || 'Administrator',
      notes: reason || 'Payment could not be verified by Admin',
    } : d));
    updateDepositRequestStatusInDb(depositId, 'rejected', user?.name || 'Administrator', reason || 'Payment not verified').catch(() => {});

    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `ADMIN_DEPOSIT_REJECTED: ₹${req.amount} for ${req.userHandle} (UTR: ${req.utr})`,
      time: timeFormatted,
      timestamp: now,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleDirectCreditUser = (targetUserId: string, amount: number, note: string) => {
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAccounts(prev => prev.map(acc => {
      if (acc.id === targetUserId) {
        const updated = { ...acc, bugBalance: acc.bugBalance + amount };
        upsertProfileToDb(updated).catch(() => {});
        return updated;
      }
      return acc;
    }));

    if (user && user.id === targetUserId) {
      setUser(prev => prev ? { ...prev, bugBalance: prev.bugBalance + amount } : null);
    }

    const targetAcc = accounts.find(a => a.id === targetUserId);
    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: 'UPI_TOPUP',
      category: 'topup',
      amount,
      timestamp: now,
      timeStr: timeFormatted,
      userId: targetAcc ? targetAcc.handle.replace('@', '') : targetUserId,
      description: `Admin Direct Credit: ${note || 'Manual payment verification'}`,
      hash: `admin_direct_${now.toString(16)}`,
    };

    const userTxKey = `subme_tx_v8_${targetUserId}`;
    try {
      const existingUserTx = JSON.parse(localStorage.getItem(userTxKey) || '[]');
      localStorage.setItem(userTxKey, JSON.stringify([newTx, ...existingUserTx]));
    } catch (e) {}

    if (user && user.id === targetUserId) {
      setTransactions(prev => [newTx, ...prev]);
    }
    recordTransactionInDb(newTx).catch(() => {});

    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `ADMIN_DIRECT_CREDIT: +${amount} BUGs to ${targetAcc ? targetAcc.handle : targetUserId} (${note})`,
      time: timeFormatted,
      timestamp: now,
      hash: newTx.hash,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleSimulateReferral = () => {
    if (!user) return;
    const bounty = 5.00;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updateUserRecord(prev => ({
      ...prev,
      bugBalance: prev.bugBalance + bounty,
    }));

    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: 'REFERRAL_BOUNTY',
      category: 'reward',
      amount: bounty,
      timestamp: now,
      timeStr: timeFormatted,
      userId: user.handle.replace('@', ''),
      description: `Referral Bounty: Member activated code ${user.referralCode}`,
      hash: `ref_bounty_${now.toString(16)}`,
    };
    setTransactions(prev => [newTx, ...prev]);

    // Sync to Supabase
    recordTransactionInDb(newTx).catch(() => {});
  };

  const handleSettlePayoutClaim = (claimId: string) => {
    const claim = payoutClaims.find(c => c.id === claimId);
    if (!claim || claim.status === 'settled') return;

    const generatedUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setPayoutClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'settled',
          utr: generatedUtr,
        };
      }
      return c;
    }));

    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: 'CAMPAIGN_LAUNCH',
      category: 'spend',
      amount: -claim.amount,
      timestamp: now,
      timeStr: timeFormatted,
      userId: claim.handle.replace('@', ''),
      description: `Payout Settled: ${claim.member} (${claim.handle}) via NPCI UTR ${generatedUtr}`,
      utrRef: generatedUtr,
      hash: `payout_settle_${now.toString(16)}`,
    };
    setTransactions(prev => [newTx, ...prev]);

    // Sync to Supabase
    recordTransactionInDb(newTx).catch(() => {});

    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `PAYOUT_SETTLED:${claim.id} (₹${claim.amount} to ${claim.vpa})`,
      time: timeFormatted,
      timestamp: now,
      hash: newTx.hash,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const handleAdjustMemberBalance = (memberId: string, amount: number, reason: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === memberId || acc.handle.replace('@', '') === memberId) {
        const updated = { ...acc, bugBalance: Math.max(0, acc.bugBalance + amount) };
        upsertProfileToDb(updated).catch(() => {});
        return updated;
      }
      return acc;
    }));
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, pts: Math.max(0, m.pts + amount) } : m));
    if (user && (memberId === user.id || memberId === user.handle.replace('@', ''))) {
      setUser(prev => prev ? { ...prev, bugBalance: Math.max(0, prev.bugBalance + amount) } : null);
    }
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: amount >= 0 ? 'EARNED_TASK' : 'CAMPAIGN_LAUNCH',
      category: amount >= 0 ? 'reward' : 'spend',
      amount,
      timestamp: now,
      timeStr: timeFormatted,
      userId: memberId,
      description: `Admin balance adjustment: ${reason}`,
      hash: `adj_${now.toString(16)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    recordTransactionInDb(newTx).catch(() => {});
  };

  const handleRequestPayout = (amount: number, vpa: string) => {
    if (!user || user.bugBalance < amount) return;
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updateUserRecord(prev => ({
      ...prev,
      bugBalance: Math.max(0, prev.bugBalance - amount),
    }));

    const newClaim: PayoutClaim = {
      id: `claim_${now}`,
      memberId: user.id,
      member: user.name,
      handle: user.handle,
      amount,
      vpa,
      requestedAt: timeFormatted,
      status: 'pending',
      timestamp: now,
    };

    setPayoutClaims(prev => [newClaim, ...prev]);

    const newTx: WalletTransaction = {
      id: `tx_${now}`,
      type: 'CAMPAIGN_LAUNCH',
      category: 'spend',
      amount: -amount,
      timestamp: now,
      timeStr: timeFormatted,
      userId: user.handle.replace('@', ''),
      description: `Payout Request: ₹${amount} to ${vpa}`,
      hash: `payout_req_${now.toString(16)}`,
    };

    setTransactions(prev => [newTx, ...prev]);
    recordTransactionInDb(newTx).catch(() => {});

    const newAuditLog: AuditSentinelEvent = {
      id: `aud_${now}`,
      type: 'AUDIT EVENT',
      title: `PAYOUT_REQUEST: ₹${amount} initiated for ${user.handle} to ${vpa}`,
      time: timeFormatted,
      timestamp: now,
      hash: newTx.hash,
    };
    setAuditLogs(prev => [newAuditLog, ...prev]);
  };

  const getActiveViewTitle = () => {
    if (selectedCampaign) {
      return `Watch: ${selectedCampaign.title.slice(0, 24)}...`;
    }
    if (activeTab === 'overview') return 'Platform Overview';
    if (activeTab === 'home') return 'Creator Feed';
    if (activeTab === 'create-task') return 'Create Watch Task';
    if (activeTab === 'tasks') return 'Tasks & Promos';
    if (activeTab === 'users') return 'Users & Members';
    if (activeTab === 'payouts') return 'Payout Claims';
    if (activeTab === 'transactions') return 'Ledger Audit';
    if (activeTab === 'wallet') return 'Wallet & Vault';
    if (activeTab === 'profile') return 'Creator Profile';
    if (activeTab === 'settings') return 'System & Rules';
    return 'Home';
  };

  // If user is unauthenticated, present AuthView directly
  if (!user) {
    return (
      <AuthView
        theme={theme}
        toggleTheme={toggleTheme}
        registeredUsers={accounts}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] dark:bg-[#0B1118] flex overflow-hidden select-none text-slate-800 dark:text-slate-100 transition-colors duration-150 relative font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Left Sidebar (Platform Navigation) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCampaign(null);
        }}
        onOpenCreateCampaign={() => {
          setActiveTab('create-task');
          setSelectedCampaign(null);
        }}
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 2. Main Column */}
      <main className="flex-1 flex flex-col min-w-0 h-screen bg-[#F8FAFC] dark:bg-[#0B1118] overflow-hidden transition-colors duration-150">
        
        {/* Header */}
        <Navbar
          user={user}
          activeViewTitle={getActiveViewTitle()}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenCreateCampaign={() => {
            setActiveTab('create-task');
            setSelectedCampaign(null);
          }}
          onOpenVault={() => {
            setActiveTab('wallet');
            setSelectedCampaign(null);
          }}
          onOpenReferral={() => setIsReferralOpen(true)}
          onOpenLedger={() => {
            setActiveTab('transactions');
            setSelectedCampaign(null);
          }}
          onHomeClick={() => {
            setSelectedCampaign(null);
            setActiveTab(user.role === 'admin' ? 'overview' : 'home');
          }}
          onNavigate={(tab) => {
            setSelectedCampaign(null);
            setActiveTab(tab);
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          isSupabaseLive={isSupabaseLive}
        />

        {/* Scrollable Viewport */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative bg-[#F8FAFC] dark:bg-[#0B1118] pb-18 md:pb-6">
          {selectedCampaign ? (
            <WatchPage
              campaign={selectedCampaign}
              allCampaigns={campaigns}
              user={user}
              onSelectCampaign={handleSelectCampaign}
              onTriggerVerification={handleTriggerVerification}
              onBackToFeed={handleBackToFeed}
              hasSubscribed={user.subscribedChannelIds.includes(selectedCampaign.channelId)}
            />
          ) : activeTab === 'overview' && user.role === 'admin' ? (
            <OverviewView
              onNavigate={(tab) => {
                setSelectedCampaign(null);
                setActiveTab(tab);
              }}
              onOpenCreateCampaign={() => {
                setSelectedCampaign(null);
                setActiveTab('create-task');
              }}
              onOpenVault={() => {
                setSelectedCampaign(null);
                setActiveTab('wallet');
              }}
              user={user}
              campaigns={campaigns}
              transactions={transactions}
              payoutClaims={payoutClaims}
              auditLogs={auditLogs}
              registeredUsers={accounts}
              onSyncYouTube={handleManualYouTubeSync}
            />
          ) : activeTab === 'users' && user.role === 'admin' ? (
            <UsersView
              currentUser={user}
              accounts={accounts}
              members={members}
              onOpenReferral={() => setIsReferralOpen(true)}
              onAdjustBalance={handleAdjustMemberBalance}
            />
          ) : activeTab === 'payouts' && user.role === 'admin' ? (
            <PayoutsView
              user={user}
              onOpenVault={() => {
                setSelectedCampaign(null);
                setActiveTab('wallet');
              }}
              claims={payoutClaims}
              onSettleClaim={handleSettlePayoutClaim}
            />
          ) : activeTab === 'transactions' && user.role === 'admin' ? (
            <TransactionsView transactions={transactions} />
          ) : activeTab === 'settings' && user.role === 'admin' ? (
            <SettingsView user={user} />
          ) : activeTab === 'create-task' ? (
            <CreateTaskView
              user={user}
              onCreateCampaign={handleCreateCampaign}
              onNavigate={(tab) => {
                setSelectedCampaign(null);
                setActiveTab(tab);
              }}
              campaigns={campaigns}
            />
          ) : activeTab === 'tasks' ? (
            <TasksView
              campaigns={campaigns}
              onSelectCampaign={handleSelectCampaign}
              onOpenCreateCampaign={() => {
                setSelectedCampaign(null);
                setActiveTab('create-task');
              }}
              user={user}
            />
          ) : activeTab === 'wallet' ? (
            <WalletView
              user={user}
              accounts={accounts}
              transactions={transactions}
              payoutClaims={payoutClaims}
              depositRequests={depositRequests}
              onRequestDeposit={handleRequestDeposit}
              onApproveDeposit={handleApproveDeposit}
              onRejectDeposit={handleRejectDeposit}
              onDirectCreditUser={handleDirectCreditUser}
              onSettleClaim={handleSettlePayoutClaim}
              onRequestPayout={handleRequestPayout}
            />
          ) : activeTab === 'profile' ? (
            <ProfileView
              user={user}
              campaigns={campaigns}
              theme={theme}
              toggleTheme={toggleTheme}
              onSimulateReferral={handleSimulateReferral}
              onNavigate={(tab) => {
                setSelectedCampaign(null);
                setActiveTab(tab);
              }}
              onLogout={handleLogout}
              onOpenSupabase={() => setIsSupabaseModalOpen(true)}
              isSupabaseLive={isSupabaseLive}
              onUpdateChannelUrl={handleUpdateChannelUrl}
            />
          ) : (
            <HomeView
              onNavigate={(tab) => {
                setSelectedCampaign(null);
                setActiveTab(tab);
              }}
              onSelectCampaign={handleSelectCampaign}
              user={user}
              campaigns={campaigns}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation Bar (md:hidden - 5 Tabs) */}
        <MobileBottomBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedCampaign(null);
          }}
          onOpenCreateCampaign={() => {
            setActiveTab('create-task');
            setSelectedCampaign(null);
          }}
          user={user}
        />

      </main>

      {/* Command Palette Modal (⌘K / Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        campaigns={campaigns}
        onSelectCampaign={handleSelectCampaign}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSelectedCampaign(null);
        }}
        onOpenCreateCampaign={() => {
          setActiveTab('create-task');
          setSelectedCampaign(null);
        }}
        onOpenVault={() => {
          setActiveTab('wallet');
          setSelectedCampaign(null);
        }}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenLedger={() => {
          setActiveTab('wallet');
          setSelectedCampaign(null);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Auxiliary Modals */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        user={user}
        onCreateCampaign={handleCreateCampaign}
        onOpenVault={() => {
          setIsCreateCampaignOpen(false);
          setIsVaultOpen(true);
        }}
      />

      <UPILiquidVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        user={user}
        onRequestDeposit={handleRequestDeposit}
      />

      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        user={user}
        onSimulateReferral={handleSimulateReferral}
      />

      <LedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        transactions={transactions}
      />

      <VerificationModal
        isOpen={verificationModalState.isOpen}
        onClose={() => setVerificationModalState({ isOpen: false, campaign: null, sessionNonce: '' })}
        campaign={verificationModalState.campaign}
        sessionNonce={verificationModalState.sessionNonce}
        viewerId={user.id}
        onSuccess={handleVerificationSuccess}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        registeredUsers={accounts}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionChange={checkConnection}
      />

    </div>
  );
};

export default App;
