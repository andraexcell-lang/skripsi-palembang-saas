# frontend — Skripsi Palembang (Next.js 16)

Aplikasi web utama: App Router + React 19 + Tailwind 4. Deploy ke Vercel
(root directory = folder ini). Ringkasan proyek & arsitektur: lihat
[`../README.md`](../README.md); langkah deploy: [`../DEPLOY.md`](../DEPLOY.md).

## Menjalankan secara lokal

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi (sekalian type-check)
npm run start    # jalankan hasil build
```

Butuh backend jalan di `http://localhost:5000` (folder `../backend`).

## Environment (`frontend/.env.local` — jangan di-commit)

| Variabel | Fungsi |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | URL API backend, default `http://localhost:5000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

Catatan: ganti `NEXT_PUBLIC_API_URL` ke URL Railway bila ingin frontend lokal
memakai backend produksi. Karena `NEXT_PUBLIC_*` di-inline saat build, jalankan
`npm run build` ulang setelah mengubah env.

## Konvensi penting

- **Tema gelap** dikendalikan class `.dark` di `<html>` (ThemeToggle, radiogroup).
  Varian Tailwind `dark:` dikunci ke class yang sama lewat
  `@custom-variant dark (&:where(.dark, .dark *))` di `src/app/globals.css` —
  jangan kembalikan ke preferensi media/OS.
- Token warna (brand `--primary`, danger, success, muted, radius) ada di
  `src/app/globals.css`; paritas visual dengan mantrariset ada di
  `../PROJECT_STATUS.md`.
- Jangan menampilkan klaim/status sebelum data siap — pakai state "Memuat…"
  (lihat pola di `dashboard/billing/page.tsx`).
