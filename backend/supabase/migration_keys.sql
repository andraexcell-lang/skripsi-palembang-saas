-- Tahap Artikel + API key
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Plugin Word',
  key_hash text not null,
  key_prefix text not null default '',
  created_at timestamptz default now()
);

alter table public.api_keys enable row level security;
drop policy if exists "own keys" on public.api_keys;
create policy "own keys" on public.api_keys for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
