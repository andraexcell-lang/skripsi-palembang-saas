-- Pairing perangkat Word via kode pendek
create table if not exists public.word_pairings (
  code text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  temp_key text,
  consumed boolean default false,
  status text not null default 'pending',
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '10 minutes'
);

alter table public.word_pairings enable row level security;
