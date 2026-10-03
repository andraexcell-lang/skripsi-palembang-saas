-- Tahap Core AI Writer: tabel proyek skripsi
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  judul text not null,
  jenis text not null default 'skripsi',
  metode text default 'Kualitatif',
  tahap text default 'full',
  identitas jsonb default '{}',
  content jsonb default '{}',
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;
drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
