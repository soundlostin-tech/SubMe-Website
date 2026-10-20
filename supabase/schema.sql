-- ==============================================================================
-- SubMe Database Schema for Supabase (Project: elyhwhqsapymjzoqtcdz)
-- Paste this entire SQL into: https://supabase.com/dashboard/project/elyhwhqsapymjzoqtcdz/sql
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text,
  role text default 'user',
  handle text,
  avatar text,
  channel_url text,
  bug_balance numeric default 100.00,
  channel_subscribers integer default 0,
  referral_code text,
  completed_tasks_count integer default 0,
  active_campaigns_count integer default 0,
  reputation_score numeric default 98.0,
  subscribed_channel_ids jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. CAMPAIGNS TABLE
create table if not exists public.campaigns (
  id text primary key,
  youtube_id text not null,
  video_url text not null,
  title text not null,
  channel_name text not null,
  channel_avatar text,
  channel_id text not null,
  subscribers_count integer default 0,
  current_progress integer default 0,
  target_subscribers integer default 50,
  reward_bugs numeric default 20.00,
  watch_duration_sec integer default 30,
  thumbnail_url text,
  platform text default 'youtube',
  is_short boolean default false,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer_index integer default 0,
  is_vip boolean default false,
  category text default 'Tech & Dev',
  views_count integer default 0,
  likes_count integer default 0,
  uploaded_at text,
  status text default 'active',
  description text,
  creator_id text not null,
  created_at timestamptz default now()
);

-- 3. WALLET TRANSACTIONS TABLE
create table if not exists public.wallet_transactions (
  id text primary key,
  user_id text not null,
  type text not null,
  amount numeric not null,
  description text not null,
  category text,
  utr_ref text,
  hash text,
  campaign_title text,
  created_at timestamptz default now()
);

-- 4. PAYOUT CLAIMS TABLE
create table if not exists public.payout_claims (
  id text primary key,
  member_id text not null,
  member text not null,
  handle text not null,
  amount numeric not null,
  vpa text not null,
  requested_at text not null,
  status text default 'pending',
  utr text,
  created_at timestamptz default now()
);

-- 5. TASK VERIFICATION COMPLETIONS TABLE
create table if not exists public.task_completions (
  id text primary key,
  campaign_id text not null,
  viewer_id text not null,
  reward_bugs numeric not null,
  session_nonce text,
  sha256_hash text,
  created_at timestamptz default now()
);

-- 6. USER DEPOSIT REQUESTS (Admin Verifies & Credits BUGs)
create table if not exists public.deposit_requests (
  id text primary key,
  user_id text not null,
  user_name text not null,
  user_handle text not null,
  user_email text,
  amount numeric not null,
  utr text not null,
  status text default 'pending',
  requested_at text not null,
  timestamp bigint not null,
  reviewed_at text,
  reviewed_by text,
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.payout_claims enable row level security;
alter table public.task_completions enable row level security;
alter table public.deposit_requests enable row level security;

-- Create Open Permissive Policies for Web Client Access (or customize as needed)
drop policy if exists "Allow public read profiles" on public.profiles;
create policy "Allow public read profiles" on public.profiles for select using (true);

drop policy if exists "Allow public write profiles" on public.profiles;
create policy "Allow public write profiles" on public.profiles for all using (true);

drop policy if exists "Allow public read campaigns" on public.campaigns;
create policy "Allow public read campaigns" on public.campaigns for select using (true);

drop policy if exists "Allow public write campaigns" on public.campaigns;
create policy "Allow public write campaigns" on public.campaigns for all using (true);

drop policy if exists "Allow public read transactions" on public.wallet_transactions;
create policy "Allow public read transactions" on public.wallet_transactions for select using (true);

drop policy if exists "Allow public write transactions" on public.wallet_transactions;
create policy "Allow public write transactions" on public.wallet_transactions for all using (true);

drop policy if exists "Allow public read payouts" on public.payout_claims;
create policy "Allow public read payouts" on public.payout_claims for select using (true);

drop policy if exists "Allow public write payouts" on public.payout_claims;
create policy "Allow public write payouts" on public.payout_claims for all using (true);

drop policy if exists "Allow public read completions" on public.task_completions;
create policy "Allow public read completions" on public.task_completions for select using (true);

drop policy if exists "Allow public write completions" on public.task_completions;
create policy "Allow public write completions" on public.task_completions for all using (true);

drop policy if exists "Allow public read deposit_requests" on public.deposit_requests;
create policy "Allow public read deposit_requests" on public.deposit_requests for select using (true);

drop policy if exists "Allow public write deposit_requests" on public.deposit_requests;
create policy "Allow public write deposit_requests" on public.deposit_requests for all using (true);

-- Enable Realtime publication for live synchronization
alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.wallet_transactions;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.deposit_requests;
