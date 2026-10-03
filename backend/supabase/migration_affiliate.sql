-- Tahap Affiliate: kode referral + komisi 10%
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id);

create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referee_id uuid not null references public.profiles(id) on delete cascade,
  transaction_id uuid references public.transactions(id),
  amount integer not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table public.referral_commissions enable row level security;
drop policy if exists "own commissions" on public.referral_commissions;
create policy "own commissions" on public.referral_commissions for select using (auth.uid() = referrer_id);
