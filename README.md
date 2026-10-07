# Skripsi Palembang — AI Riset Assistant

Layanan SaaS berbahasa Indonesia untuk membantu penyusunan skripsi, tesis, disertasi,
artikel jurnal, hingga tugas tutorial online (Tuton UT & Karil UT) dengan bantuan AI.
Antarmuka berparitas dengan mantrariset.com (analisis per tombol/halaman ada di
`hasil-analisis-mantrariset/`).

## Stack

| Lapisan   | Teknologi |
|-----------|-----------|
| Frontend  | Next.js 16 (App Router) + React 19 + Tailwind 4, deploy **Vercel** (`skripsi-palembang-saas.vercel.app`) |
| Backend   | Express + TypeScript, deploy **Railway** (`skripsi-palembang-saas-production.up.railway.app`) |
| Database  | Supabase (Postgres + Auth) |
| AI        | `gemini-2.5-flash` + fallback otomatis ke model cadangan |
| Pembayaran| Midtrans (QRIS/e-wallet/transfer), sandbox |

## Struktur

```
frontend/                 aplikasi Next.js (baca frontend/README.md untuk detail lokal)
backend/                  API Express (port 5000)
hasil-analisis-mantrariset/  dokumen analisis paritas + screenshot referensi
DEPLOY.md                 langkah deploy Vercel + Railway + env
PROJECT_STATUS.md         status tiap fase, keputusan owner, daftar item tertunda
```

## Menjalankan secara lokal

```bash
# Backend (port 5000)
cd backend && npm install && npm run dev

# Frontend (port 3000) — butuh env di frontend/.env.local
cd frontend && npm install && npm run dev
```

Env frontend: `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`),
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Env backend (rahasia, jangan di-commit): lihat `DEPLOY.md`.

## Uji (Fasa 6 — 7 Okt 2026)

Diverifikasi dengan browser sungguhan (Chromium) + Lighthouse, online (Vercel/Railway)
maupun build lokal:

- **Responsive** — 375px (mobile), 800px (tablet), 1280px (desktop): sidebar jadi
  drawer "Menu" di <1024px, grid billing 1→2→4 kolom, FAB 48×48 tidak menutup konten.
- **Mode gelap/terang** — toggle tema (radiogroup) bekerja dan persist antar halaman;
  varian `dark:` Tailwind dikunci ke class `.dark` (bukan tema OS).
- **Lighthouse** — Accessibility / Best Practices / SEO = **1.0 / 1.0 / 1.0**
  pada landing, login, register, hubungkan, dashboard, billing (kedua mode tema).
- **Performa** — FCP ±148ms (lokal), CLS 0.028 (<0.1).
- **Console** — nol error JavaScript di semua halaman yang diuji.
- **Cross-browser** — Firefox/Safari belum teruji otomatis (lingkungan uji hanya
  Chromium); gunakan output Tailwind sehingga risiko rendah, tetap perlu uji manual.

## Deploy

Lihat [DEPLOY.md](./DEPLOY.md). Status lengkap proyek:
[PROJECT_STATUS.md](./PROJECT_STATUS.md).
