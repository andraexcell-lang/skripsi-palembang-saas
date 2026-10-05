# Status Proyek Skripsi Palembang SaaS

Terakhir diperbarui: 3 Okt 2026. Acuan fitur: https://mantrariset.com (akun uji: dedibusro5@gmail.com).

## Arsitektur

- `frontend/` — Next.js 16 + React 19 + Tailwind 4, deploy **Vercel** (`skripsi-palembang-saas.vercel.app`, root dir = folder frontend)
- `backend/` — Express TS, deploy **Railway** (`skripsi-palembang-saas-production.up.railway.app`, root dir = `backend`)
- DB/Auth: **Supabase** project `nkujkrdwpywujcrynuhm` (hati-hati: service_role lama bocor di riwayat git → buat project baru sebelum user berbayar, lihat "Tunda")
- AI: Gemini `gemini-2.5-flash` · Referensi: OpenAlex + Crossref (gratis) · Bayar: Midtrans Snap (terintegrasi, key belum diisi)

## Env (nilai asli hanya di dashboard, JANGAN commit)

- Railway vars: PORT, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, MIDTRANS_SERVER_KEY (kosong=mock), MIDTRANS_IS_PRODUCTION=false, FRONTEND_URL, NIXPACKS_NODE_VERSION=22
- Vercel env: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (+Redeploy tiap ubah)
- Lokal: `backend/.env`, `frontend/.env.local` (keduanya gitignored)

## Migrasi SQL (sudah run di Supabase, file di `backend/supabase/`)

1. `schema.sql` — profiles, credit_ledger, transactions + trigger auto-profile
2. `migration_projects.sql` — projects
3. `migration_keys.sql` — api_keys
4. `migration_affiliate.sql` — referral_code, referred_by, referral_commissions
5. `migration_projprefs.sql` + `migration_projprefs2.sql` + `migration_projprefs3.sql` — tahap, sitasi, bahasa, min_year, ref_origin/scope, initial_data, custom_outline, fetch_fenomena, custom_sources
6. `migration_wordpair.sql` — word_pairings (pairing Word)
7. `migration_docs.sql` — documents (AI Writer)

## Selesai (terverifikasi e2e)

- Auth login/register + guard kredit + billing mock/real + ledger
- Proyek CRUD + Studio Bab I–V (10 kredit/bab) + sitasi nyata + daftar pustaka + sampul Word + refund gagal
- Upload/extract PDF/DOCX/XLSX/CSV (15MB), PPTX real (8), SPSS deskriptif+interpretasi (3)
- Artikel Sinta/Scopus (15), Cari Artikel OpenAlex + filter + paginasi + daftar referensi
- Simulasi sidang suara multi-turn + rapor (15/25), plagiasi estimasi jujur (15), parafrase (1)
- Affiliate kode + komisi 10% (mock confirm + webhook), admin plan bypass
- Tema terang default + toggle, rebrand, slash palette `/`, tutorial, pengaturan + API key
- Dashboard live (user/kredit/proyek), paritas form Skripsi
- Plugin Word: pairing device-code, outline edit tersimpan, streaming, cover builder, Ulangi, Judul bab, logo
- Asisten chat (1 kredit), brainstorming penuh, Lab Revisi proyek tersimpan + upload, AI Writer dokumen + sitasi
- Rapihkan .docx real (A4/TNR/TOC/halaman, 1 kredit), Lanjutkan dari file (deteksi Bab I-VII)

## Biaya kredit

bab 10 · parafrase 1 · ppt 8 · plagiasi 15 · artikel 15 · sidang 15/25 · spss 3 · smartpls 5 · kualitatif/dokumen/transkripsi 1 · brainstorming/kelayakan/novelty/cari gratis

## Tunda (butuh owner)

1. Project Supabase BARU (kunci bersih) + ulangi 5 migrasi + update env Railway/Vercel/lokal
2. Midtrans Server Key sandbox → vars → uji QRIS → webhook URL Railway
3. Konten: video tutorial, link Grup WA, payout affiliate manual, plugin Word
4. Custom domain `api.skripsiplg.my.id` (opsional)

## Akun uji (password minta ke owner)

- tester.palembang@gmail.com (saldo ±41, ada proyek contoh)
- andraexcell@gmail.com (admin, bypass kredit)
