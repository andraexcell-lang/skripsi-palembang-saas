-- Skripsi Palembang SaaS — skema minimal Auth + Kredit + Billing
-- Jalankan di Supabase SQL Editor.
-- Auth memakai supabase.auth.users bawaan.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  university text,
  major text,
  level text default 'S1',
  plan text default 'free',
  credits integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  ref text default '',
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id text not null,
  amount integer not null,
  credits integer not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own ledger" on public.credit_ledger;
create policy "own ledger" on public.credit_ledger for select using (auth.uid() = user_id);

drop policy if exists "own trx" on public.transactions;
create policy "own trx" on public.transactions for select using (auth.uid() = user_id);

-- Auto-create profile saat user register
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
