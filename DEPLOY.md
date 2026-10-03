# Deploy Skripsi Palembang SaaS

## 1. Backend → Railway

1. Buka https://railway.app → New Project → **Deploy from GitHub** → pilih repo `andraexcell-lang/skripsi-palembang-saas`
2. Klik service → Settings → ubah **Root Directory** ke `Skripsi-Palembang/backend`
3. Tab **Variables** → isi semua (lihat tabel di bawah) → Deploy otomatis jalan
4. Tab **Settings → Networking → Generate Domain** → dapat URL misal `https://skripsi-palembang-saas-production.up.railway.app`
5. Cek `https://<domain-railway>/health` → harus `{status:ok}`

### Env backend (wajib)

| Key | Isi / dapat dari |
|---|---|
| `PORT` | `5000` (Railway override otomatis via `$PORT` bila perlu — app memakai `process.env.PORT`) |
| `GEMINI_API_KEY` | Google AI Studio (aistudio.google.com → Get API Key). JANGAN commit |
| `SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL (`https://xxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase → API Keys → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → `service_role` (rahasia server saja) |
| `MIDTRANS_SERVER_KEY` | Midtrans Sandbox → Settings → Access Keys → Server Key (`SB-Mid-...`). Kosongkan = mode mock |
| `MIDTRANS_IS_PRODUCTION` | `false` (sandbox) / `true` (produksi) |
| `FRONTEND_URL` | `https://skripsi-palembang-saas.vercel.app` |
| `REDIS_HOST` / `REDIS_PORT` | Opsional — BullMQ nonaktif di jalur TS, boleh kosong |

## 2. Frontend → Vercel

1. Vercel → project `skripsi-palembang-saas` → Settings → **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = URL Railway backend (tanpa trailing slash)
   - `NEXT_PUBLIC_SUPABASE_URL` = sama dengan backend
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
2. Pastikan **Root Directory** = folder frontend (`Skripsi-Palembang/frontend`)
3. **Deployments → Redeploy**

## 3. Midtrans webhook

Midtrans Dashboard → Settings → General Settings/Configuration → **Payment Notification URL**:

```
https://<domain-railway>/api/billing/midtrans/webhook
```

Uji: bayar 1 paket termurah via QRIS sandbox → kredit harus masuk otomatis (cek `/dashboard/kredit`).

## 4. Checklist pasca-deploy

- [ ] `/health` Railway OK
- [ ] Login di Vercel app bisa masuk dashboard
- [ ] Saldo kredit tampil (bukan "Login untuk melihat saldo")
- [ ] Generate 1 bab potong 10 kredit
- [ ] Checkout Midtrans redirect ke Snap, webhook menambah kredit
