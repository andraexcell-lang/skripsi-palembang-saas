-- Paritas proyek-baru: outline kustom, flag fenomena, scope multi
alter table public.projects add column if not exists custom_outline text default '';
alter table public.projects add column if not exists fetch_fenomena boolean default true;
