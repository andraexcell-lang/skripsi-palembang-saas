-- Preferensi proyek ala proyek-baru: tahap, sitasi, bahasa, data awal
alter table public.projects add column if not exists tahap text default 'full';
alter table public.projects add column if not exists citation_style text default 'APA 7th';
alter table public.projects add column if not exists language text default 'Indonesia';
alter table public.projects add column if not exists min_year integer;
alter table public.projects add column if not exists ref_origin text default 'semua';
alter table public.projects add column if not exists ref_scope text default 'umum';
alter table public.projects add column if not exists initial_data text default '';
