-- Sumber wajib (artikel/buku pembimbing)
alter table public.projects add column if not exists custom_sources jsonb default '[]';
