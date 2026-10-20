import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  KeyRound, 
  Layers,
  ShieldCheck
} from 'lucide-react';
import { 
  DEFAULT_SUPABASE_URL, 
  SUPABASE_PROJECT_ID, 
  getSupabaseAnonKey, 
  setSupabaseAnonKey, 
  clearSupabaseAnonKey, 
  checkSupabaseConnection 
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const [anonKey, setAnonKey] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    tablesFound?: boolean;
  }>({
    tested: false,
    connected: false,
    message: '',
  });
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentKey = getSupabaseAnonKey();
      setAnonKey(currentKey);
      testConnection();
    }
  }, [isOpen]);

  const testConnection = async () => {
    setIsTesting(true);
    const result = await checkSupabaseConnection();
    setConnectionStatus({
      tested: true,
      connected: result.connected,
      message: result.message,
      tablesFound: result.tablesFound,
    });
    setIsTesting(false);
  };

  const handleSaveKey = () => {
    if (!anonKey.trim()) {
      clearSupabaseAnonKey();
    } else {
      setSupabaseAnonKey(anonKey.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    testConnection();
    if (onConnectionChange) onConnectionChange();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(DEFAULT_SUPABASE_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#131D28] border border-slate-200 dark:border-slate-800 rounded-xl shadow-elevated flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-[#16222F]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                Supabase Connection Manager
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Project ID: {SUPABASE_PROJECT_ID}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#16222F] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Status Banner */}
          <div className={`p-3.5 border rounded-lg flex items-start gap-3 ${
            connectionStatus.connected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {connectionStatus.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold text-slate-900 dark:text-white text-xs">
                {connectionStatus.connected ? 'Supabase Project Active' : 'Anon API Key Required'}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                {connectionStatus.message || 'Checking connection status...'}
              </p>
            </div>
            <button
              onClick={testConnection}
              disabled={isTesting}
              className="px-2.5 py-1 text-[11px] font-mono font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-subtle"
            >
              <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
              Test
            </button>
          </div>

          {/* Project Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Supabase Project URL
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={DEFAULT_SUPABASE_URL}
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300 select-all outline-hidden shadow-subtle"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#16222F] text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer shadow-subtle"
                  title="Copy URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-emerald-500" />
                  <span>Project anon / public key</span>
                </label>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-deep-ocean dark:text-matcha-green hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Get Key from Supabase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <textarea
                rows={3}
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0E1620] border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-deep-ocean dark:focus:border-slate-500 outline-hidden shadow-subtle"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Paste your anon/public key here or add it to <code className="font-mono bg-slate-100 dark:bg-[#16222F] px-1 py-0.5 rounded">.env</code> as <code className="font-mono text-emerald-600 dark:text-emerald-400">VITE_SUPABASE_ANON_KEY</code>.
              </p>
            </div>
          </div>

          {/* Quick Steps Box */}
          <div className="p-3.5 bg-slate-50/70 dark:bg-[#16222F]/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 shadow-subtle">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-deep-ocean dark:text-matcha-green" />
              <span>Step 2: Initialize Database Tables</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              We generated <code className="font-mono text-emerald-600 dark:text-emerald-400">supabase/schema.sql</code> with all tables (profiles, campaigns, wallet_transactions, task_completions). Paste and execute it in your Supabase SQL editor:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-semibold font-mono text-[11px] rounded-lg flex items-center gap-1.5 transition-colors shadow-subtle"
              >
                <span>Open SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-slate-400 font-mono">
                File: supabase/schema.sql
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16222F] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            {saveSuccess ? (
              <span className="text-emerald-600 dark:text-matcha-green flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Key saved successfully!
              </span>
            ) : (
              <span>Safe fallback: local data operates smoothly offline</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1A2634] font-mono text-xs rounded-lg cursor-pointer shadow-subtle"
            >
              Close
            </button>
            <button
              onClick={handleSaveKey}
              className="px-4 py-1.5 bg-deep-ocean dark:bg-slate-700 hover:bg-deep-ocean-dark text-white font-semibold font-mono text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-subtle"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-matcha-green" />
              <span>Save &amp; Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
