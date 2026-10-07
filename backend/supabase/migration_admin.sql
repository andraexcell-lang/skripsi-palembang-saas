-- Dashboard Admin (tahap 1): pengaturan global aplikasi
-- Jalankan di SQL Editor Supabase (sama seperti migrasi lain).

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS aktif tanpa policy = client anon/pengguna TIDAK bisa baca/tulis sama sekali;
-- hanya backend (service role key) yang lewat — key API & flags sensitif aman.
alter table public.app_settings enable row level security;

-- Isi awal (opsional, boleh dikosongkan — backend punya nilai default):
--   key 'ai_models'      -> array entri model (id, provider, baseUrl, apiKey, aktif)
--   key 'feature_flags'  -> object { slug_fitur: true/false }
insert into public.app_settings (key, value)
values ('feature_flags', '{}'::jsonb)
on conflict (key) do nothing;
