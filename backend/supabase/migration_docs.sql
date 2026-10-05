-- Dokumen AI Writer (penulisan bebas tersimpan)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Dokumen Baru',
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.documents enable row level security;
drop policy if exists "own documents" on public.documents;
create policy "own documents" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
