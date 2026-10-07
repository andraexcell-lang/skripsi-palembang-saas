# Status Proyek Skripsi Palembang SaaS

Terakhir diperbarui: 7 Okt 2026. Akun login ulang: shairancaye@gmail.com (0 kredit, Paket Free). **Fase 0–4 SELESAI; Fase 5 (fitur lengkap) hampir selesai — lihat bagian "Fasa 5 (P4) — progres 7 Okt 2026" di bawah; Fasa 6 (testing & rilis) **SELESAI — uji browser + Lighthouse semua 1.0, lihat bagian "Fasa 6 — progres 7 Okt 2026" di bawah** (Firefox SUDAH teruji otomatis 15/15 — lihat "Uji cross-browser Firefox" di bawah; sisa: uji manual Safari di perangkat Apple; tutorial video §3.18 SELESAI)** (build `next build` lolos + cek SSR status 200): (a) token paritas di `globals.css` — brand `#0066FF` → `#2563eb` (blue-600 mantrariset), hover `#1d4ed8`, token `--danger`/`--success`/`--radius-sm 6px`/`--fs-*` + utilitas `bg-primary`/`text-danger`; (b) `CreditBadge` paritas — chip 88×28 radius 6px, **merah red-600 hanya saat saldo 0**, netral bila >0; (c) `ThemeToggle` diberi semantik `role="radiogroup"`/`radio`; (d) **penanda halaman aktif sidebar** — menu sesuai route disorot + `aria-current` (khusus `/dashboard/studio/*` → "Proyek Penelitian"; logo & chip kredit dikecualikan); (e) **panel Riwayat percakapan** di `/dashboard/asisten` (keputusan owner #3: **panel riwayat saja**) — tombol "Riwayat" 94×32 kanan atas, panel 320px header "Riwayat percakapan" + ×, empty state "Belum ada percakapan tersimpan…", daftar + buka + **hapus**, persist `localStorage` (`sp-riwayat-asisten`, maks 50 sesi); **Urungkan & halaman `/syarat` ditunda — keputusan final owner 7 Okt: tetap tunda** (tidak ada di dokumen analisis, tidak direka-reka). **Temuan**: sidebar 4 grup, radiogroup tema, CreditBadge, dan 10 slash-command + dropdown `/` **sudah ada** sebelumnya — duplikasi sudah direvert. Estimasi kredit uji AI ≈ 50-80 kredit/hari (setelah top-up). 32 halaman mantrariset + 31 halaman situs sudah di-analisis DOM di `hasil-analisis-mantrariset/` (2 laporan + 32 screenshot **sudah di-commit** `31ec1ff`). **Sisa roadmap**: **P3 = SELESAI (7 Okt)** — (a) modal Bukti Kutipan + hapus kartu referensi sudah ada (`09cd676`); (b) **desain empty state paritas** (ikon slate-300 + teks slate-400 + tombol biru) via komponen bersama `components/EmptyState.tsx` di `/dashboard/proyek`, Lab Revisi (teks persis "Belum ada proyek yang bisa direvisi…" + "Ke Studio"), AI Writer ("Ruang menulis bebas dengan sitasi otomatis…" + "Buat Dokumen Pertama"), notifikasi slate-400; (c) **FAB "Buka asisten"** 48px radius penuh biru-600 kanan-bawah (keputusan owner: asisten saja, tombol WA ditunda konten nomor) — sebelumnya tak pernah ada (temuan, sisa P1 §3.3.2). Tinggal **P4** (affiliate mendetail, tutorial video grid, Karil UT lengkap, sistem paket lengkap).

## Paritas mantrariset — 9 item backlog (7 Okt 2026, commit `8390370` — terpasang & terverifikasi)

Perintah owner "BAGUS, IMPLEMENTASIKAN SEKARANG" → seluruh item 1–9 di `CATATAN-PENYESUAIAN.md` diimplementasikan (backend prompt/parser/DOCX, studio web, audit) + 6 alat baru (`uji-normalisasi`, `cek-docx`, `export-uji`, `cek-model`, `topup-kredit`, `normalkan-konten`). **Detail + bukti per item: `CATATAN-PENYESUAIAN.md` (tabel ringkasan di atas).**

**Verifikasi teknis yang sudah lulus**
- Unit `tools/uji-normalisasi.js` **21/21**; `tsc --noEmit` backend & frontend **0 error**; `next build` **lolos** (34 halaman).
- `tools/cek-docx.js` atas ekspor DOCX: **13/13 PASS** — spasi2 (line480=518) · spasi1 (240=978) · **360=0** · TOC `1-3` · caption `Tabel 3.x`+`Tabel L` (SEQ) · 6/6 nama dari `Judul Tabel:` jadi caption · label tebal · `Sumber:`/caption line240.
- Studio web E2E (browser): bab3 **6/6 tabel** tampil caption `Judul Tabel:` center+bold di atas tabel; hint Bab IV ("…Agen menyusun tabulasi & hasil olahannya sendiri…") terlihat; copy dialog metodologi ≥100 Slovin / <100 sampling jenuh.
- Audit `tools/audit-hasil.js`: penomoran semua bab **0 dup/lompat/yatim**; bab3 **6/6 `Judul Tabel:`**; nol LaTeX; item9 (6.2–6.6 kosong+penanda) ✓.

**TERTUNGGU — kuota Gemini free tier (bukan kode)**
- `gen-uji` 4× percobaan regen bab3 final: model utama kena **kuota harian 20 req/hari/model** (`GenerateRequestsPerDayPerProjectPerModel`, reset ~00:00 UTC = **07:00 WIB**) → jatuh ke `gemini-*-lite` yang selalu berhenti ~11rb kar. Akibat: bab3 = **10.565 kar (FAIL ≥25rb), dapus 7 (FAIL ≥8), kode kisi BD01–BD08 ≠ lampiran BKD… (FAIL item8)** — ketiganya bakal **lulus kembali setelah 1× regen bab3 normal** (puluhan ribu kar) saat model utama hidup. Lampiran sempat ter-regen rusak (8.987, kode 60→36) → **sudah direstore** dari backup (`%TEMP%\backup-content-200b68f5.json`) → 17.303 kar utuh.
- Regen ulang nanti: `node tools/gen-uji.js 200b68f5-… bab3` (1 kredit, saldo **6**) → `… lampiran` (0 kredit) → `tools/audit-hasil.js` target **0 FAIL** → export `tools/export-uji.js` → `tools/cek-docx.js`.
- Sisa WARN audit = konten format lama bab1 (2 tabel) + bab2 (1 tabel) + lampiran (4 tabel) tanpa `Judul Tabel:` → regen bila owner ingin seragam (±4 kredit).
- **Aksi owner terkait**: billing Google AI Studio min $5 mengangkat batas 20/hari (akar masalahnya); Bab4/Bab5 (item6/7) baru teruji kode/prompt — output E2E terkunci tahap proyek uji; **Opsi A** upload tabulasi `.xlsx/.csv` menunggu keputusan (Opsi B sudah jalan).

## Fasa 6 (Testing & Rilis) — SELESAI 7 Okt 2026 (commit `173febc` — Lighthouse 1.0/1.0/1.0)

Uji browser sungguhan (Chromium via tool OpenCode) + Lighthouse, pada produksi (Vercel/Railway) dan build lokal (`npm run start`).

**Cakupan uji**
- **Responsive**: 375px (mobile) — kartu 1 kolom + hamburger, overlay iframe; 800px (tablet) — grid 2 kolom, drawer "Menu"; 1280px (desktop) — sidebar stasioner, grid billing **4 kolom** (verifikasi `gridTemplateColumns` + screenshot berskala). Touch target: tombol hamburger 32→**40px**, chip kredit 28→**40px** (negative margin, tampilan identik), FAB 48×48 ✓.
- **Tema**: toggle radiogroup terang↔gelap berfungsi + **persist antar halaman**; diuji di kedua tema.
- **Halaman diuji** (nol error console): landing, login, register, hubungkan, dashboard, proyek, olah-data, tuton, karil, affiliate, asisten, billing.
- **Performa (lokal)**: FCP 148ms, DCL 66ms, **CLS 0.028** (<0.1), API Railway ±1,3s per panggilan.
- **Cross-browser**: **belum** — lingkungan uji hanya Chromium; Firefox/Safari perlu uji manual saat rilis.

**Hasil Lighthouse (a11y / best-practices / SEO)** — semuanya **1.0 / 1.0 / 1.0** di landing, login, register, hubungkan, dashboard, billing (terang & gelap). Sebelum perbaikan: dashboard 0.96 (4 kontras + 1 label), landing/login 0.98 (tanpa `<main>`).

**Perbaikan di commit fasa-6**
1. **BUG tema (penting)**: varian `dark:` Tailwind 4 default mengikuti `prefers-color-scheme` **OS**, sedangkan ThemeToggle mengendalikan class `.dark` → saat OS ≠ pilihan user, latar `dark:bg-*` hardcode bertabrakan dengan token terang (kartu gelap + teks hitam). Dibetulkan: `@custom-variant dark (&:where(.dark, .dark *))` di `globals.css` — semua `dark:` kini mengikuti class `.dark`.
2. **Kontras mode gelap**: `--text-muted` `#64748B`→`#7e8fa8` (3,3:1→4,7:1), teks brand `#2563eb`→`#60a5fa` di `.dark` (kecuali berelemen `text-white`/tombol solid — background tombol tetap paritas), placeholder prompt ikut token.
3. **Kontras mode terang**: `--text-muted` `#94a3b8`→`#5b6b80` (2,1:1→4,8:1), badge "Gratis" `emerald-600`→`emerald-800`, link "Grup WA" `#25D366`→`#0B7A38` di terang (gelap tetap `#25D366`), baris "Diperbarui…"/"Gratis untuk mulai" memakai token `text-text-muted`.
4. **Landmark & label**: `<main>` di landing, login, register, hubungkan; input login/register/hubungkan punya `htmlFor`/`id` terasosiasi.
5. **WCAG 2.5.3**: aria-label tombol akun dihapus — nama aksesible kini = teks visibel (lolos axe `label-content-name-mismatch`).
6. **Anti janji palsu (Billing)**: state `ready` — klaim "Midtrans belum dikonfigurasi — mode mock", "Login dulu lalu pastikan backend jalan", dan "Belum ada transaksi" tidak lagi muncul sebagai flash sebelum data termuat (kini "Memuat…").

**Terverifikasi di produksi (deploy `a1eec3e`, sebelum commit ini)**: halaman Tuton (3 langkah + form), grid Proyek 8 kartu + empty state, Olah Data 6 kartu, Billing 8 kartu + Rp1.548.000 Profesor Tahunan + tabel riwayat, Karil (empty + panduan), Asisten (slash commands), modal Affiliate **tidak** muncul untuk akun tester yang sudah pernah bayar (pemicu benar), sidebar 4 grup + item Tuton UT + radiogroup tema, FAB "Buka asisten". Catatan: request ke Railway sempat `ERR_TUNNEL_CONNECTION_FAILED` (proxy uji sementara) — backend hidup (dicek dari shell/webfetch, 401 tanpa token = normal); `204` pada log = preflight CORS, bukan bug.

**Fasa 6 selesai (7 Okt)**: commit `173febc` sudah di-push ke `feat/mantrariset-paritas` **dan** `main`, deploy Vercel live (login menyajikan `<main>` + label terasosiasi), spot-check Lighthouse produksi login & landing = **1.0/1.0/1.0 nol kegagalan**. **Sisa rilis**: uji manual **Safari** di perangkat Apple (Firefox selesai 15/15 otomatis); opsional audit Lighthouse produksi halaman dashboard/billing (login). **Fasa 5 = SELESAI (7 Okt)** — tutorial video grid §3.18 terakhir selesai.

## Fasa 5 (P4) — progres 7 Okt 2026 (commit `f101c01`, `5ecb41b`, `1d31423` — build lolos + SSR 200)

- **Olah Data 6 kartu paritas §3.8** (`f101c01`): Transkripsi Audio/Video (1 kredit/10 mnt), Olah Data SPSS (3), SmartPLS (5), Analisis Kualitatif (1/3 informan), Analisis Dokumen (1/3 segmen), Analisis Visual Video (±4) — ikon + tag KUALITATIF/KUANTITATIF + deskripsi + harga per kartu, prompt & `feature` backend per alat (`visual: 4` ditambah ke `FEATURE_COSTS`).
- **Chip "0 kredit" palsu dihapus** — 4 halaman (brainstorming, olah-data, plagiasi, generate-ppt) kini pakai `CreditBadge` asli (saldo live; chip statis = info menyesatkan).
- **Billing paritas §3.20** (`5ecb41b`): kartu "Paket {plan} aktif" + n kredit tersisa; grup **Paket Mahasiswa** (4 kartu) & **Paket Profesor** (4 kartu); checklist fitur per kartu (dasar 9 + Profesor 5 tambahan); badge "Populer"; catatan "Pembayaran via QRIS + scan, paket langsung aktif otomatis."; Riwayat Transaksi = tabel Tanggal/Status/Jumlah. **Keputusan owner**: Profesor Tahunan **Rp1.548.000 / 3000+500** (skala harga kita). **Kartu University (7 Okt, keputusan owner)**: 3 kartu **20/50/100 akun TANPA harga** + checklist fitur Profesor + tombol "Hubungi Tim Kami" → Grup WA. **Ditunda**: aksi kolom Riwayat "Lihat/Batalkan" (tak ada endpoint cancel & target tak terdokumentasi); "Klaim Bonus" (analisis: "belum dicek").
- **Backend `applyPlan`**: `profiles.plan` kini di-update ke `mahasiswa`/`profesor` saat bayar lunas (mock confirm + webhook Midtrans) — sebelumnya selalu `free` → kartu paket & badge "Aktif" di dashboard salah.
- **Affiliate modal §3.21** (`1d31423`): modal "Berlangganan dulu, yuk!" (ikon gift + body persis + tombol biru "Lihat Paket Langganan" → `/billing` + ×) muncul bila **belum pernah ada transaksi `paid`**; sub judul ikut referensi.
- **Karil UT paritas §3.17**: halaman daftar = empty state "Belum ada Karil" + teks persis + tombol "Buat Karil →" → `/dashboard/karil/baru` (form dipindah ke rute baru) + kartu "Mengikuti Panduan Karil UT (MKWI4560)" tabel 6 baris persis screenshot + catatan kelulusan; `EmptyState` dapat prop opsional `judul`.
- **Tuton UT lengkap §3.26** (halaman baru `/dashboard/tuton`): 3 kartu langkah persis (Tempel lembar soal / Tulis jawaban 3-1 kredit / Unduh BJT), banner info + link skripsi, form Mata kuliah + Identitas sampul BJT, "Buat & tempel soal →"; workspace tempel soal (Tugas/Diskusi) → jawaban AI (`tuton_tugas: 3`, `tuton_diskusi: 1`) editable → **Unduh BJT** via route baru `POST /api/files/bjt` (docx bersampul UT, gratis); data lokal `sp-tuton`; item menu sidebar "Tuton UT".
- **Proyek Penelitian paritas §3.2**: grid 8 kartu (Buat Skripsi/Tesis/Disertasi, Artikel Sinta/Scopus, Ubah Skripsi → Artikel, Tuton UT, Karil UT) + empty state teks persis "Belum ada proyek. Pilih salah satu di atas untuk mulai."
- **Terverifikasi**: `next build` & `tsc` exit 0; SSR 200 semua halaman tersentuh (tuton, karil, karil/baru, proyek, billing, affiliate, olah-data, dsb).

**Sisa Fasa 5: TIDAK ADA** — tutorial video grid §3.18 selesai (7 Okt, placeholder jujur). **Fasa 6** (responsive/dark/cross-browser/performance/README) belum mulai.

## Arsitektur

- `frontend/` — Next.js 16 + React 19 + Tailwind 4, deploy **Vercel** (`skripsi-palembang-saas.vercel.app`, root dir = folder frontend)
- `backend/` — Express TS, deploy **Railway** (`skripsi-palembang-saas-production.up.railway.app`, root dir = `backend`)
- DB/Auth: **Supabase** project `nkujkrdwpywujcrynuhm` (hati-hati: service_role lama bocor di riwayat git → buat project baru sebelum user berbayar, lihat "Tunda")
- AI: Gemini `gemini-2.5-flash` · Referensi: OpenAlex + Crossref (gratis) · Bayar: Midtrans Snap **AKTIF (sandbox)**

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
- Daftar proyek terakhir + hapus, slash palette, tutorial, admin bypass
- **Paritas Dashboard** (baris atas + notifikasi lonceng dari ledger + menu akun, kartu AI, kartu paket, "Mulai buat karya" 6 kartu, proyek terakhir 6 + segmented filter, chip kredit di sidebar, Grup WA)
- **Paritas Studio**: tab `Bab VI: Lampiran` + panel sub-bab + tombol **Generate Lampiran**, tab `Pustaka (N)` (daftar + Unduh RIS), **Unggah Artikel Sendiri** (PDF/DOCX → DOI Crossref → `identitas.refs`, maks 10), **Sesuaikan Skripsi** (timpa Tujuan/Hipotesis/Kerangka + catatan Bab III), **Tinjau Hasil** (kelebihan/kekurangan/pertanyaan penguji), **Cek Sitasi** (GRATIS: total/nyata/yatim + verifikasi Crossref per sitasi yatim), rail PPT + Cek Plagiasi + tab Revisi, badge GRATIS & teks tooltip sesuai referensi
- Parser `pdf-parse` v2 (kelas `PDFParse`) — sebelumnya cabang PDF di `/from-file` & analisis berkas error `fn is not a function`
- Export `.docx` ikut menyertakan BAB VI Lampiran
- **Paritas kontrol sub-bab & rail studio** (lihat "Status verifikasi kontrol sub-bab" di bawah): rail desktop (header judul + badge SKRIPSI + progres "N dari 5 Bab / NN% selesai" + daftar bab/panel utilitas persis referensi), chip rail horizontal mobile `BAB N ✓ / Pustaka (N) / Revisi`, toolbar sticky dua grup, tombol hover **Perkaya** & **Hapus sub-bab** per sub-bab, footer **Generate Ulang Bab Ini** dengan `window.prompt` arahan → `window.confirm`, disclaimer teks persis + toggle **Lihat/Tutup**
- **Paritas tampilan sempit (<1024px)**: baris progres `N/5 Bab — bar — NN%` di atas chip mobile, ikon lucide (inline SVG, tanpa dependency) pada tombol cepat/chip/toolbar/rail, app shell `md:` → `lg:` dengan header hamburger + drawer off-canvas (overlay + Escape)

## Status verifikasi studio (6 Okt 2026)

| Fitur | API | UI produksi |
| --- | --- | --- |
| Tab Bab VI + Generate Lampiran | ✅ 11.500 karakter, ikut export | ✅ panel sub-bab + tombol |
| Tab Pustaka + RIS | ✅ 21 entri (1 unggahan) | ✅ |
| Unggah Artikel Sendiri | ✅ DOI `10.24912/jmk.v5i2.23409` terbaca | ✅ panel biru + input file |
| Cek Sitasi (gratis) | ✅ semua proyek (termasuk jalur yatim 17/17) | ✅ modal GRATIS |
| Sesuaikan Skripsi (5) | ✅ 3 bagian ditimpa + catatan Bab III | ✅ klik nyata → panel "2 bagian diperbarui" + catatan Bab III (12 dtk) |
| Tinjau Hasil (5) | ✅ 4/5/5 butir (parser tangguh + refund bila gagal) | ✅ klik nyata → modal 4/5/5 butir (10 dtk) |

Dua klik UI terakhir benar-benar terdebit di ledger (`-5` @ 20:55:16 dan `-5` @ 20:56:30, saldo 37 → 27) — bukan uji mock. Satu percobaan UI sebelumnya sempat gagal di AI dan **otomatis di-refund** (`+5` @ 20:39:09), membuktikan jalur refund jalan di produksi.

## Status verifikasi kontrol sub-bab & rail (6 Okt 2026)

| Item | Hasil (produksi) |
| --- | --- |
| `POST /:id/perkaya/cek` | ✅ `{gratis:true, biaya:1, namaBab:'Bab I', sisaKredit:27}`; panggilan kedua → `gratis:false` |
| `POST /:id/perkaya` | ✅ gratis pertama per bab (16,6 dtk, **tanpa debit ledger**), isi lama utuh (paragraf asli tetap `Contains`), 4275 → 6298 karakter, balasan `sisaKredit:27` |
| `POST /:id/sub-bab/hapus` | ✅ sub-bab hilang permanen (4275 → 3907), gratis, dicegah bila jadi sub-bab terakhir |
| UI **Perkaya** (klik nyata) | ✅ konfirmasi **persis teks referensi** ("Perdalam \"2.1 Disiplin Kerja\"? Isi yang sudah ada TIDAK diubah — hanya ditambah … GRATIS — ini pemakaian pertama untuk Bab II. Berikutnya 1 kredit. Lanjutkan?") → pesan sukses `Sub-bab "2.1 Disiplin Kerja" diperdalam — GRATIS. Sisa kredit 27.` |
| UI **Hapus sub-bab** | ✅ `window.confirm` → 2.4 Kerangka Berpikir hilang dari DOM + pesan `Sub-bab "2.4 Kerangka Berpikir" dihapus.` (naskah di-restore via `PATCH /:id/content`) |
| UI **Generate Ulang Bab Ini** | ✅ `window.prompt` arahan (teks 100% sama dengan referensi) → `window.confirm` (sama, minus butir riwayat) → stream: 4273 → 7969 karakter, arahan "statistik" terbukti dihasilkan, `Bab I Pendahuluan selesai ditulis ulang.`, debit `-10` @ 05:29:56 (saldo 27 → **17**) |
| Rail chip mobile | ✅ `BAB 1 ✓ BAB 2 ✓ BAB 3 BAB 4 BAB 5 BAB 6 ✓ Pustaka (21) Revisi`, sticky `lg:hidden`, klik ganti bab jalan |
| Rail desktop (aside) | ✅ judul + badge SKRIPSI + `2 dari 5 Bab / 40% selesai` + bar progres; item `Bab I Pendahuluan … Lampiran ✓ / Daftar Pustaka (N) / Lab Revisi / Tambah Sitasi GRATIS / Unggah Artikel Sendiri (+deskripsi) / Prediksi Soal Sidang (+deskripsi) / Tinjau Hasil / Abstrak ID+EN` — tersembunyi di <1024px seperti referensi |
| Toolbar sticky | ✅ grup mobile `Unggah Artikel · Prediksi Soal · Tinjau · PPT · Cek Sitasi` (lg:hidden) + grup grid `Unduh Word · RIS · Cek Plagiasi · select Nomor · Abstrak ID+EN · Sesuaikan Skripsi` + judul proyek (`xl:block`) |
| Disclaimer | ✅ teks lengkap referensi (`⚠️ Disclaimer: Hasil ini adalah DRAFT AWAL … Permendiknas No. 17 Tahun 2010 … Selengkapnya`) + tombol `Lihat/Tutup` (`aria-expanded`/`aria-controls="disclaimer-studio"`, `sm:hidden`) |
| Hover sub-bab | ✅ `opacity:0` → `0.95→1` saat hover (perangkat `hover:hover`), tombol `Perkaya` + ikon `Hapus sub-bab` |

## Status verifikasi tampilan sempit <1024px (6 Okt 2026, produksi)

Jendela 800px = varian `lg:hidden` (chip), bukan rail bab. Semua di bawah diverifikasi via DOM + screenshot di `skripsi-palembang-saas.vercel.app` (commit `29a7688`).

| Item | Hasil (produksi) |
| --- | --- |
| Baris progres mobile | ✅ `2/5 Bab` + bar `role="progressbar" aria-valuenow=40 aria-label="Progres penulisan 40 persen"` + `40%`, di atas chip, pembungkus sticky `lg:hidden` — struktur sama dengan referensi |
| Ikon tombol cepat | ✅ `Unggah Artikel`(upload) · `Prediksi Soal`(circle-help) · `Tinjau`(clipboard-list) · `PPT`(presentation) · `Cek Sitasi`(shield-check) — SVG lucide inline, tiap `<button>` punya `<svg>` |
| Ikon chip rail | ✅ `Pustaka (21)` (book-open) + `Revisi` (flask-conical) |
| Ikon toolbar & rail desktop | ✅ `Unduh Word`/`RIS` (download), `Cek Plagiasi` (shield), `Sesuaikan Skripsi` (sparkles); rail: Lab Revisi (flask), Tambah Sitasi (quote), Unggah Artikel (upload), Prediksi Soal (help), Tinjau Hasil (clipboard) |
| Header sempit | ✅ `lg:hidden`, berisi logo + `CreditBadge` (angka asli dari `/api/credits/balance`) + tombol `aria-label="Menu"` `aria-expanded` |
| Drawer sidebar | ✅ `<aside id="sidebar-utama">`: `display:none` saat tertutup → `flex` + `x=0` (lebar 256) saat dibuka → overlay gelap `z-30` muncul → tutup via overlay **dan** `Escape` (`aria-expanded` ikut `false`) |
| Sidebar desktop | ✅ urutan CSS benar: `.lg\:flex` (offset 39285) **setelah** `.hidden` (12487) dalam `@media (min-width:64rem)` → di ≥1024px tampil statis (`lg:static`, `lg:translate-x-0`, `lg:flex`) |
| Header disembunyikan di desktop | ✅ `.lg\:hidden` ada di bundle CSS |
| Konsolidasi | ✅ `npx tsc --noEmit` lolos, `next build` lolos (32 halaman), console produksi **0 error** |

### Penyempurnaan yang ikut terbukti/butuh diketahui

- Deteksi sub-bab kini menerima dua format penomoran: `1.1 Judul` **dan** `1.1. Judul` (+ normalisasi markdown `**…**` di `cariJudul`/`batasBagian`) — format lama proyek uji memakai `**1.1. Judul**` sehingga kontrol baru sempat tak muncul (commit `7edfc5f`)
- Regenerate bab lama butuh ±10 menit di produksi (rantai fallback menunggu jeda model yang diblokir) tetapi tetap selesai; `perkaya` jalan ±16 detik
- **Selisih sadar** (dibuat, bukan terlewat): (a) konfirmasi tulis-ulang **tanpa** butir "riwayat/Urungkan" karena kita belum punya fitur riwayat — janji palsu lebih buruk daripada teks beda; (b) **biaya tulis-ulang** — keputusan owner 7 Okt: **1 kredit** sesuai referensi (dialog konfirmasi & backend `?ulang=1` sudah disamakan; sebelumnya 10/8 kredit); (c) link `Selengkapnya` menunjuk `/dashboard/tutorial` sebab tidak ada halaman `/syarat`; (d) `Abstrak ID+EN` tetap ada di grup toolbar (fitur kita tak ada di referensi)

## Editor inline naskah (paritas referensi) — verifikasi 6 Okt 2026, produksi

Fitur lama yang dulu tak berfungsi (klik paragraf tak membuka apa pun) kini identik dengan mantrariset. Akar bug: penutup (closure) `onClick` memakai variabel loop `let i`, sehingga **semua** paragraf mengirim indeks akhir loop (`i = lines.length`) → `editIdx` tak pernah cocok dengan baris mana pun (commit `342d3c3` fitur, `8bbd4bc` perbaikan).

| Item | Hasil (produksi) |
| --- | --- |
| Klik paragraf | ✅ paragraf mana pun (termasuk paragraf pertama & terakhir, indeks baris berbeda-beda) → `<textarea>` menggantikan paragraf itu, `autoFocus` aktif, isi = teks paragraf persis (uji indeks 1 dan terakhir, `isiSesuai:true`) |
| Markup editor | ✅ identik referensi: `div.space-y-1` → `textarea` (`w-full resize-none overflow-hidden rounded-md border-…/40 bg-…/5 p-3 text-sm leading-relaxed focus:ring-1`, `min-height:6rem`, tinggi auto-grow 206px utk paragraf 694 char) + `<p class="text-[11px]">` petunjuk Markdown **teks sama persis** |
| Petunjuk | ✅ "Ketik langsung seperti di Word. Klik di luar kotak untuk menyimpan. (Markdown: **tebal**, tabel \|…\|, poin, ### sub-sub-bab.)" |
| Simpan saat blur | ✅ uji round-trip nyata: ketik ` [UJI-EDIT]` → blur → PATCH `/:id/content` → reload → marker **ada** di server → hapus → reload → naskah kembali persis (`ujungPar` sama dengan aslinya, marker hilang) |
| Tanpa perubahan → tanpa kirim | ✅ buka & tutup editor tanpa ubahan → nilai sama → tidak ada PATCH, tak ada pesan `Gagal menyimpan` |
| Tanpa biaya | ✅ PATCH `content` tanpa potong kredit — kredit `17` tetap sebelum & sesudah |
| Gagal simpan | ✅ pesan `Gagal menyimpan perubahan: …` + editor dibuka kembali berisi teks lama (rollback), tak ada kehilangan ketikan |
| Klik tautan sitasi | ✅ klik `<a>` di dalam paragraf **tidak** membuka editor (guard `closest('a')`), tetap pindah ke kutipan |
| Reset saat pindah tab | ✅ `useEffect([active])` menutup editor — indeks baris tab lama tak berlaku di tab baru |

## Verifikasi E2E alur generate (6 Okt 2026, produksi)

Uji dengan judul paritas mantrariset: *"Pengaruh Budaya Kerja Digital dan Work Overload terhadap Prestasi Kerja ASN melalui Motivasi Kerja di Sekretariat Daerah Kabupaten PALI"* — Tesis, Kuantitatif, Proposal, Dedi Busro/2541070212 (proyek `200b68f5-0d1d-4249-a3f1-b84309ed9b08`).

| Tahap | Hasil |
| --- | --- |
| Halaman buat + kartu "Periksa dulu sebelum generate" | ✅ ringkas Judul/Jenis/Metode/Tahap/Gaya sitasi/Bahasa/Asal+Sumber referensi/Struktur bab; "Ya, generate" → proyek terbentuk (diuji 2×; 1× gagal `Failed to fetch` karena cold-start Railway ±12 dtk, retry sukses) |
| `?mulai=1` → Bab I auto-generate | ✅ tanpa klik, streaming langsung jalan, selesai → 8 kredit (tesis) |
| Dialog Bagan Kerangka Berpikir (Bab II) | ✅ teks persis referensi; "Biarkan AI menyusunkan" → **langsung generate** (diperbaiki di `2f7c32c` — sebelumnya malah membuka textarea); "Gambar sendiri bagannya" → textarea deskripsi kotak/panah |
| Dialog metodologi (Bab III) | ✅ "Jumlah Populasi" + input angka, checkbox Lemeshow + Kepercayaan/Margin/Proporsi, select desain (20 opsi kuantitatif + "✨ Sarankan AI"), select alat + "Lainnya…", tombol "Lewati" / "✦ Generate Bab III Metodologi"; isi 285 + Asosiatif → naskah memuat 285, rumus Slovin, "penelitian asosiatif", SPSS, 3.6 Etika + 3.7 Jadwal (outline 7 sub) |
| Lampiran auto setelah Bab III | ✅ **GRATIS** (kredit 40 → 16 = 3×8 saja), isi kisi-kisi + tabel markdown |
| Label unduh | ✅ "Unduh Proposal" saat tahap proposal, "Unduh Word" saat full |
| Ekspor DOCX | ✅ sampul TESIS (nama/NIM/tahun) → KATA PENGANTAR/LEMBAR/DAFTAR ISI (TOC `\h \o "1-2"` + `\a Gambar` + `\a Tabel`) → isi (Heading1/3/4, 1.7 & 3.6/3.7 ada) → DAFTAR PUSTAKA (hangus/indent) → LAMPIRAN; 3 section footer: sampul tanpa nomor, isi PAGE + disclaimer AI (Permendiktas No. 17/2010) |
| Ekspor RIS | ✅ tombol RIS menghasilkan entri `TY/PY/TI/DO/ER` |

**Bug diperbaiki selama uji:** (a) `loading` macet "Menggenerate..." setelah Bab I (cabang rantai `return` melewati `setLoading(false)`) — `2f7c32c`; (b) tombol AI pada dialog bagan tidak langsung generate — `2f7c32c`; (c) nama file ekspor hardcode `skripsi.docx` → ambil `Content-Disposition` jadi `proposal-tesis-*.docx`, RIS jadi `daftar-pustaka.ris`; (d) `CreditBadge` hanya fetch saat mount → kini refresh 30 dtk + event `sp:balance` — `d202c11`.

**Selisih sadar (dicatat, bukan bug):** kanvas drag bagan referensi vs textarea deskripsi kita; kartu konfirmasi kita inline (referensi pakai pola serupa); backend cold-start ±12 dtk saat tidur.

## Paritas DOCX vs referensi (6 Okt 2026, commit `2d1b99f`)

Perbandingan menyeluruh DOCX ekspor kita vs unduhan referensi (proyek paritas yang sama). Semua diperbaiki & terverifikasi via XML + render Word→PDF + ukuran piksel:

| Aspek | Sebelum | Sesudah (terverifikasi) |
| --- | --- | --- |
| Hierarki heading | H1→H3→**H4** (Heading2 = 0) → TOC `\o "1-2"` hanya judul bab | H1→**H2**→H3→H4 persis referensi; TOC memuat sub-bab 1.1–1.8 |
| Gaya heading | biru (2E74B5/1F4D78), H1 16pt | **hitam bold** H1 14pt center + **caps**, H2/3/4 12pt left, line 360 — identik gaya efektif referensi (piksel heading = rgb(72,72,72) = sama) |
| docDefaults | `pPrDefault` kosong → paragraf tanpa spacing eksplisit = single | `spacing after=0 before=0 line=360` — **identik referensi** → TOC pitch 25,5pt = sama persis |
| Judul bab | "BAB I" tanpa sub-judul / "BAB II TINJAUAN PUSTAKA" 1 baris | H1 dua baris "BAB II" ⏎ "Tinjauan Pustaka" (caps via style), tanpa paragraf ulangan — struktur opener = referensi |
| "Daftar Pustaka Bab Ini" | muncul 4× sebagai H1 (entri sampah TOC) | dibuang total (referensi tidak punya; DAFTAR PUSTAKA global sudah ada) |
| Lampiran | H1 "LAMPIRAN INSTRUMEN PENELITIAN" + H3 "6.1 …" | H1 "LAMPIRAN" + H2 "Lampiran 1 …" |
| Tabel | tanpa spacing eksplisit | cell `line=240` (4 tabel, 378 sel — sama referensi) |
| Rumus | teks justify berindentasi | ditengahkan spasi tunggal (referensi memakai 52 gambar PNG — selisih sadar, lihat bawah) |
| Marker markdown | `*italic*`/`_italic_` bocor mentah (95 `*`, 58 `_`) | jadi italic sungguhan (referensi sendiri bocor `_…_` mentah — kita tidak menyalin bug itu) |
| Sampul | tanpa spacing | before 600/240/240/480/480 + line 360 — nilai identik referensi |
| Sub-bab | "1.1 Latar Belakang" (1 spasi) | "1.1  Latar Belakang" (2 spasi, 21 heading — sama referensi) |

**Selisih sadar tersisa (konten, bukan format):** (a) referensi menyisipkan 52 gambar PNG rumus uji (3.5.x) — kita tulis rumus sebagai teks terpusat; (b) kedalaman sub-bab konten berbeda (referensi H3=27/H4=28 vs kita 18/26 — AI mereka membuat sub-sub lebih dalam); (c) referensi 2 lampiran vs kita 4 (konten). Struktur & gaya dokumen = paritas.

## Status verifikasi struktur bab baku per varian metode & modal "Bukti Kutipan" (6 Okt 2026, commit `09cd676`)

**Konteks**: kartu "Referensi Terverifikasi" yang selama ini muncul di studio **bukan milik mantrariset** — hasil `git log -S` menunjukkan berasal dari commit kita `6e145b7 feat: sitasi lompat ke entri terverifikasi`. Referensi justru punya perilaku berbeda: klik sitasi di naskah → **modal "Bukti Kutipan"** (paritas chunk 7997), bukan kartu daftar permanen. Kami hapus kartu + pasang modal paritas.

| Item | Hasil |
| --- | --- |
| `/meta/outline?metode=&jenis=` | ✅ 12 kombinasi diuji via `curl` localhost:5000 — semua persis paritas referensi (lihat tabel di `ANALISIS-PROMPT-DAN-STRUKTUR-BAB.md` bagian 5e) |
| Kuantitatif + skripsi | ✅ Bab I 7 sub (tanpa Kebaruan), Bab III 6 (tanpa Etika) — cocok base varian |
| Kuantitatif + tesis | ✅ Bab I 8 (+Kebaruan sebelum Sistematika), Bab III 7 (+Etika sebelum Jadwal), Bab IV 6 (+Temuan sebelum Pembahasan, +Implikasi Teoretis setelah Pembahasan), Bab V 3 (+Agenda setelah Saran) — overlay `f` persis |
| Kuantitatif + disertasi | ✅ overlay `f+y`: State of the Art & Research Gap (bab1), Kerangka Teori Besar & Critical Review & Proposisi (bab2), Landasan Filosofis (bab3), Kontribusi (bab5) |
| Kualitatif + tesis | ✅ Bab II "Kajian Pustaka" (4 sub, tanpa Hipotesis), Bab IV 8 sub (Temuan sudah di base → overlay skip; +Implikasi Teoretis), Lampiran Pedoman Wawancara |
| PTK + skripsi | ✅ 6 bab1, Bab II 4 sub (Hipotesis Tindakan), Bab III 7 (Siklus, Instrumen, Indikator), Bab IV 5 (Pra-Siklus/Siklus I/II/Perbandingan) |
| Studi Pustaka + skripsi | ✅ **tanpa Lampiran** (paritas — varian pustaka tidak punya lampiran di kamus referensi) |
| Hukum Normatif | ✅ 9 bab1 (Keaslian, Kerangka Konseptual), Asas Hukum, Bahan Hukum; **tanpa Lampiran** |
| R&D + tesis | ✅ **tanpa overlay** (rnd dikecualikan dari `METODE_OVERLAY` — paritas fungsi `P` referensi) |
| Mixed + tesis | ✅ kuantitatif + Lampiran 3 sub (+Pedoman Wawancara) |
| Default (tanpa param) | ✅ kuantitatif skripsi — kompatibilitas konsumen lama |
| `babPrompt` struktur per varian | ✅ diuji via `node tes-prompt.cjs` — kualitatif bab3: Miles & Huberman + keabsahan; kuantitatif bab3 skripsi: GANTT di 3.6; pustaka bab2: tabel terdahulu tanpa hipotesis |
| Frontend studio `load()` | ✅ fetch `/meta/outline?metode=&jenis=` setelah proyek |
| Label bab dari varian | ✅ `labelBab(bid)` = `outline[bid].bab` \|\| fallback `BABS` — dipakai di desktop chips, pesan generate, pesan ulang, indikator lampiran |
| Kartu "Referensi Terverifikasi" | ✅ **DIHAPUS** dari DOM (baris 1048–1060 lama) — tidak ada di mantrariset, penyebab "terus muncul" (dirender tiap tab selama `refs.length > 0 && !isPustaka`, di atas naskah, `load()` refetch tiap bab) |
| Modal "Bukti Kutipan" | ✅ klik sitasi → `setBukti(refs[ri])` → modal `fixed inset-0 z-50 bg-black/40` card `max-w-lg`: header "Bukti Kutipan" + "Tutup", `Penulis (Tahun)`, `Judul. *Jurnal*`, amber-note bila tanpa DOI + link Google Scholar, tombol "Buka di tab Pustaka" (scroll ke entri). `ri<0` → `setActive('pustaka')` |
| Warning hipotesis Bab II | ✅ variant-aware: cek `outline.bab2.subs` cari `Hipotesis` (bukan `metode === 'Kuantitatif'`) |
| Taskpane `word/taskpane.html` | ✅ fetch outline ditambah `?metode=&jenis=` dari proyek |
| Backend `tsc` build | ✅ `npm run build` sukses, `node tes-prompt.cjs` lolos |
| **Uji produksi e2e (Vercel + Railway, 6 Okt)** | ✅ setelah login ulang (sesi sempat expired): kartu "Referensi Terverifikasi" **hilang walau refs=20** (kondisi yang dulu memunculkannya); 16 sitasi `<button title="Lihat bukti kutipan">` / **0** `<a>`; klik → **modal "Bukti Kutipan"** tampil (header + Tutup, `Arsuni (2022)`, judul lengkap, `doi.org/…`, "Buka di tab Pustaka"); klik "Buka di tab Pustaka" → modal tertutup + tab Pustaka aktif + 20 entri `ref-*` tampil dan `ref-0` ter-scroll ke viewport; `/api/projects/meta/outline?metode=&jenis=` responsif di Railway (kuantitatif 7 sub, kualitatif-tesis 8 sub, pustaka tanpa lampiran) |
| **Ekspor DOCX: 5 perbaikan kualitas (7 Okt)** | ? caption center+bold di ATAS objek `Tabel {bab}.{urut} {judul H2}` / `Gambar …` + field SEQ `SEQ Tabel \s 1` (reset per H1 - Daftar Tabel/Gambar terisi saat F9; nilai cache tampil tanpa F9); parser tabel: pipe eksternal opsional, sel kosong dipertahankan, separator `:--` (2 strip) diterima - tabel penelitian terdahulu + 3 tabel lampiran kembali jadi tabel (7 total); bagan berpanah ↓/→ dirender PNG `@napi-rs/canvas` ? `ImageRun` (**wajib `type:'png'`**, docx v9 - tanpa itu part `.undefined` & DOCX rusak); penomoran: duplikat "Tinjauan Pustaka" hilang (konsumsi baris identik setelah H1), `**6.1. …**` lampiran ? H2 `Lampiran N`, tiap blok daftar bernomor reference unik (nomor restart per blok; indent markdown ? level nesting), rumusan masalah paragraf pertanyaan ? daftar bernomor; ALL-CAPS: `rapikanJudul()` (rasio besar >62% & >20 huruf; akronim + kata hubung dijaga) utk kolom "Judul" tabel & judul Daftar Pustaka (20 ? 0 caps = paritas referensi); prompt `SITASI`: format tabel pipe wajib, larangan caption manual, larangan teks HURUF KAPITAL; `nota1` + `rumusan_masalah: daftar bernomor`; studio `renderDoc` parser tabel identik dengan ekspor. ? **Tambahan (7 Okt)**: `mbab` uji `dt` (tanpa `**`) **hanya saat `noBab===0`** - judul bab bold `**BAB II TINJAUAN PUSTAKA**` kualitatif dikenali (H1 BAB II pulih; entri sistematika selalu setelah H1 ? tetap paragraf); `caption()` skip bila `lampiran` ? tesis lampiran "BAB VI" tak lagi bikin `Tabel 6.x` (paritas: hanya bab isi). ? **Diuji silang 3 proyek lokal**: `b64ac847` 7 tabel/4 caption/1 gambar/0 caps (tanpa regresi); `d9844568` tesis - caption hanya `Tabel 1.1`, H1 bab I-VI utuh; `c96384d2` kualitatif - H1 `BAB II ⏎ Kajian Pustaka` muncul. ? **Font bagan di Linux (7 Okt)**: ekspor produksi awal menghasilkan PNG `144×340` tanpa TES-label (container Railway tanpa font sistem → `measureText`=0 & `fillText` tak tergambar; lokal Windows `450×340` normal) - selisih ukuran docx 39.162 vs 50.862 = PNG produksi jauh lebih kecil karena KONTEN hilang (144×340 kotak+panah tanpa teks - `measureText`=0 menyempitkan kotak; lokal 450×340 berlabel; keduanya RGBA); **fix**: `backend/fonts/diagram-serif.ttf` (DejaVuSerif, 380 KB, lisensi bebas) didaftarkan via `GlobalFonts.registerFromPath` ke alias `Times New Roman`/`Liberation Serif`/`Nimbus Roman`/`serif` sekali per proses sebelum pengukuran; panah digambar sebagai path (tak butuh glyph); **terverifikasi di produksi** (ekspor Railway `a232b0c`: PNG `514×340` berlabel (5,6% piksel gelap) + `verifikasi-baru.py` **ok 88** — 5 masalah asli lulus semua di Railway) |
| **QUICK asisten 4 → 10 slash-command (7 Okt)** | ✅ paritas penuh `/dashboard/asisten` vs mantrariset (DOM diverifikasi langsung): **10 command** teks & urutan identik (`/judul`, `/skripsi`, `/tesis`, `/disertasi`, `/sinta`, `/scopus`, `/parafrase`, `/ppt`, `/cari artikel`, `/kelayakan judul`); **dropdown `/`** saat mengetik (filter prefiks → opsi isi input `<cmd> `; tertutup otomatis karena `<cmd> ` mengandung spasi); chip = tombol **isi input** bukan link (paritas: tanpa navigasi); textarea auto-grow maks 12rem (Enter kirim, Shift+Enter baris baru), placeholder & hint **di dalam kotak input** persis referensi ("Enter untuk kirim · Shift+Enter baris baru · / untuk perintah"); subtitle persis; urutan DOM (judul+sub → pesan → input → chips `sm:grid-cols-2 gap-2`); tombol **Percakapan baru** muncul saat chat aktif; prompt chat memahami slash-command (`/judul` → tanya metode → 10 judul); `?q=` bar pencarian dipra-isi. Riwayat percakapan SUDAH diimplementasi (7 Okt, keputusan owner #3): tombol "Riwayat" 94×32 + panel 320px kanan atas, daftar + buka + hapus, persist localStorage. `tsc` + `npm run build` Next 16 lolos |
| **Analisis semua tombol & halaman (7 Okt)** | ✅ **SELESAI — dokumentasi penuh, belum diimplementasi** (perintah owner: simpan & pahami dulu). Login ulang `shairancaye@gmail.com` (sesi lama expired). **28 halaman + chrome global** diklik satu per satu + screenshot + ekstraksi DOM (computed style): header (logo, badge kredit, Menu, Proyek Baru, Notifikasi, Menu akun), sidebar (4 grup nav + radiogroup tema), FAB (Buka asisten, WhatsApp, tutup WA), Dashboard, Proyek, Proyek Baru, Brainstorming, Kelayakan Judul, Novelty, Cari Artikel, Olah Data, Generate PPT, Lanjutkan Skripsi, Simulasi Sidang, Cek Plagiasi, Lab Revisi, Rapihkan, Parafrase, Penulisan AI, Karil UT, Tutorial, Riwayat Kredit, Billing (2 paket + University), Affiliate (modal), Pengaturan (profil/password/tampilan/akun/API), Asisten (+panel Riwayat), Artikel Sinta, Artikel Scopus, Tuton, Studio, dark mode. Design token: primer `rgb(37,99,235)` radius 6px; pill radius 8px; FAB 48×48 radius penuh; body `rgb(241,245,249)`; dark `rgb(11,18,32)`. Arsip: `hasil-analisis-mantrariset/screenshot-tombol/01–32*.png` + laporan `ANALISIS-TOMBOL-SEMUA-HALAMAN.md`. **Tidak ada kredit terpakai** (semua generate hanya dilihat UI-nya) |

**Deviasi terdokumentasi (keputusan, bukan bug):** (a) pustaka & hukum normatif tetap menampilkan BAB 6 chip sebagai fallback outline (kamus referensi tidak punya `lampiran` untuk kedua varian itu) — ekstra, bukan kurang; (b) overlay `f`/`y` tidak punya flag `skipKualitatif`/`onlyKualitatif` di teks chunk — efek serupa tercapai otomatis via cek `e.sub.some(s => s.key === a.key)`; (c) prompt referensi tetap 100% server-side mereka — tidak bisa & tidak perlu disalin.

**Sumber data (artefak di repo):** `hasil-analisis-mantrariset/varian-struktur-mantrariset.json` (JSON hasil ekstrak penuh chunk 5702) + `hasil-analisis-mantrariset/varian-blok.ts` (blok TS hasil generate) + `backend/tes-prompt.cjs` (skrip uji prompt).

## Biaya kredit

bab 10 (**tesis 8**) · **tulis-ulang 1** (generate ulang bab + arahan, keputusan owner 7 Okt) · **Lampiran GRATIS** (otomatis setelah Bab III) · sesuaikan 5 · tinjau 5 · **perkaya 1 (GRATIS sekali per bab, disimpan di `identitas.perkaya`)** · parafrase 1 · ppt 8 · plagiasi 15 · artikel 15 · sidang 15/25 · spss 3 · smartpls 5 · kualitatif/dokumen/transkripsi 1 · brainstorming/kelayakan/novelty/cari/cek-sitasi/unggah-artikel/referensi/hapus-sub-bab gratis

## Tutorial video §3.18 — SELESAI 7 Okt 2026

Grid video paritas di `/dashboard/tutorial` (acuan: `hasil-analisis-mantrariset/screenshot-tombol/20-tutorial.png`): H1 + sub, **grid 2 kolom** berisi 6 kartu (thumbnail 16:9 + overlay judul + baris channel "Skripsi Palembang" + tombol play) dan judul kapital tebal di body, urut sesuai referensi dengan penyesuaian brand: TUTORIAL SKRISI PALEMBANG · CARA MENCARI JUDUL SKRIPSI/TESIS/DISERTASI/ARTIKEL · TUTORIAL MENCARI ARTIKEL · TUTORIAL PENGERJAAN SKRIPSI/TESIS/DISERTASI KUANTITATIF · TUTORIAL PENGERJAAN ARTIKEL SINTA DAN SCOPUS · TUTORIAL MENAMBAH DAN MENCARI SITASI. **Keputusan owner: video belum ada → placeholder jujur** — badge "Video segera hadir", **tanpa link YouTube**; begitu `url` di array `VIDEOS` (`frontend/src/app/dashboard/tutorial/page.tsx`) diisi, thumbnail `i.ytimg.com` + badge "Tonton di YouTube" otomatis aktif (regex mendukung watch/youtu.be/shorts/embed). Panduan teks (GUIDES) tetap ada di bawah grid. Aset video/thumbnail mantrariset TIDAK dipakai. Verifikasi lokal: 6 kartu, 0 link palsu, 0 error console.

## Uji cross-browser Firefox — 15/15 PASS 7 Okt 2026

Playwright 1.63 + Firefox 155 (build v1543) di Windows, skrip **`tools/ff-smoke.js`** (jalankan dengan server lokal hidup + env `UJI_EMAIL`/`UJI_PASS` akun admin). Hasil: halaman publik `/`, `/login`, `/register` — `<main>` ada + **nol error console** ✓; login admin ✓; `/dashboard`, `/billing`, `/proyek`, `/tutorial` nol error ✓; **kartu University** — 3× "Hubungi Tim Kami", nol teks "Rp" ✓; **§3.18** — 6 kartu, 6 placeholder, 0 link YouTube ✓; **responsif tutorial** — 375px = 1 kolom, 800px = 2 kolom ✓; **tema gelap** — class `.dark` menyala + screenshot terang/gelap benar ✓. Catatan teknis: downloader resmi Playwright timeout ke CDN (di lingkungan ini) — unduh zip Firefox manual via `curl` lalu ekstrak ke `%LOCALAPPDATA%\ms-playwright\firefox-1543` + file marker `INSTALLATION_COMPLETE`. Jebakan uji: `innerText` Firefox menerapkan `text-transform` (header grup terbaca "PAKET UNIVERSITY"). **Safari**: tidak bisa diuji di Windows — uji manual di perangkat Apple: buka landing/login/dashboard/billing, toggle tema gelap, cek sidebar & grid billing, laporkan ke owner.

## Keputusan owner (7 Okt 2026)

1. **Billing Google AI Studio $5** — YA, dipasang sebelum ada user riil (menunggu aksi owner di aistudio.google.com); rantai fallback 8 model hanya menunda batas free tier.
2. **Biaya tulis-ulang → 1 kredit** (paritas referensi, bukan 10/8) — dialog konfirmasi studio + penagihan backend `generate-bab-stream?ulang=1` kini `cost = 1`. **Lampiran tetap 0/GRATIS** (tombol yang sama dipakai "Generate Ulang Lampiran" — biaya `biayaBab===0 ? 0 : 1`). *Terverifikasi*: (a) browser — prompt+confirm tersangkut penuh, mengandung "• Dikenakan 1 kredit." tanpa jejak 8/10; (b) backend E2E **tanpa request AI** — akun 0 kredit kirim `?ulang=1` → SSE `event: error` `"Kredit kurang. Butuh 1, sisa 0."` (kode lama akan "Butuh 10") + saldo tetap 0.
3. **`Unduh Word` `col-span-2`** di grid toolbar studio (mobile/tablet; di `lg` tetap flex). *Terverifikasi*: computed `grid-column: span 2 / span 2`, lebar 480px = 2×236px (RIS 236px) @viewport 800px.
4. **FAB WhatsApp: tidak dibuat** (final) — hanya FAB "Buka asisten"; Grup WA tetap via link di dashboard. Alasan: `wa.me/6282338049553` pada referensi = admin mantrariset, nomor bukan milik kita.
5. **Kartu University: dibuat tanpa harga** — 3 kartu 20/50/100 akun + "Hubungi Tim Kami" → Grup WA (`chat.whatsapp.com/JFKzEThZQzDGwZKkMcxLq6`, `target=_blank rel=noopener`). Alasan tanpa harga: teks harga referensi kabur. *Terverifikasi di browser*: 3 grup (Mahasiswa/Profesor/University), 11 kartu total, nol teks "Rp" di kartu University.
6. **Urungkan & `/syarat`: tetap tunda** (final) — tak ada di dokumen analisis, tidak direka-reka; link "Selengkapnya" tetap `/dashboard/tutorial`.

**Verifikasi build 7 Okt**: `next build` (34 halaman) + `tsc` backend lolos; uji browser lokal (backend lokal + frontend lokal) di 2 halaman yang diubah — nol error JavaScript (hanya 401 sesi uji yang memang tanpa token).

## Peningkatan mutu hasil generate — SELESAI 7 Okt 2026

**Temuan audit awal** (proyek `200b68f5`, judul SAMA dengan uji referensi mantrariset): Bab I 23.485 kar (71% referensi), Bab II 26.798 (48%), Bab III 11.920 (29%); pustaka cuma **6 entri** (Crossref dengan query judul-penuh → sampah preprint OSF, tanpa buku teks); konten berhenti **alami** (`finish=STOP`, bukan terpotong) → model menulis dangkal karena prompt tak punya target kedalaman.

**Perubahan kode**:
1. **`ai.service.ts`** — `maxOutputTokens: 32768` (fallback otomatis tanpa konfigurasi kalau model menolak) + log `finish=` + `out=`/`total` token tiap request → potongan `MAX_TOKENS` kini terdeteksi (uji: ketiga bab `finish=STOP`).
2. **Referensi kaya** (`refsUntuk()` di projects.routes) — kata kunci judul (STOP-list boilerplate akademik) → **Crossref (10) + OpenAlex (6, dengan venue & abstrak)**, merge + dedupe maks 12. `refBlock` dua bagian: jurnal wajib dari daftar (DOI hanya di sini) + **blok 8 buku teks kanonik NYATA** (Sugiyono 2019, Ghozali 2018, Hair 2019, Creswell 2018, Miles & Huberman 2014, Moleong 2017, Rahmat 2015, Sekaran & Bougie 2016) + teori klasik tanpa DOI (Maslow/Herzberg/Likert) — paritas referensi yang membebaskan buku dari filter tahun. `SITASI` diselaraskan; semua query judul-penuh lain (tab Referensi, pustaka global 40 entri, karil, artikel, ekspor RIS) ganti `kataKunci()`.
3. **`TARGET KEDALAMAN` per bab** di `babPrompt` (varian-aware): Bab I ≥25.000 kar (sub pertama ≥12.000), Bab II ≥40.000 (5-tingkat 300–500 kata/tingkat; kuantitatif: tabel ≥10 studi + hipotesis berjustifikasi), Bab III ≥30.000 (kuesioner per variabel ≥5 butir Likert + analisis per tahap berumus), Bab IV 15–30rb, Bab V ≥7rb, Lampiran ≥9rb.
4. **`bersihTeks()`** — strip `**bold**` deterministik di semua jalur simpan & stream model (model tetap nekat menulis emphases); konten lama proyek uji dibersihkan (178 pasang `**`). Ekspor DOCX sudah menanganinya: `*italic*` → italic sungguhan (pustaka APA), `**` → teks biasa.

**Hasil uji ulang** (3 kredit bab + lampiran gratis, ±4 menit, `gemini-2.5-flash`, nol potongan):

| Bab | Sebelum | Sesudah | Referensi | % paritas |
|---|---|---|---|---|
| Bab I | 23.485 | **33.374** | 33.047 | **101%** |
| Bab II | 26.798 | **84.856** | 55.811 | **152%** |
| Bab III | 11.920 | **34.407** | 41.351 | 83% |
| Lampiran | 10.031 | **19.352** | 11.954 | **162%** |

**Audit otomatis** `node tools/audit-hasil.js <project-id>` (nol kuota AI): 41 cek — panjang vs target & referensi, sub-bab, tabel khas (5-kolom terdahulu, definisi operasional 7 kolom, Gantt, 5-tingkat, kuesioner per variabel), larangan format, DOI valid, pustaka ≥8 entri, peringatan preprint. **Baseline 30/45 (11 gagal) → sekarang 39/41, 0 gagal, 0 peringatan** (2 SKIP = bab4/5 dikunci tahap proposal). Kualitas terverifikasi: bab2 108 paragraf **0 duplikat**; pustaka 31 entri berisi teori klasik nyata (Adams 1965, Bandura 1986, Blau 1964, Bakker & Demerouti 2007, Campbell 1993) + jurnal SINTA; struktur `3.4.1.1–.4` kuesioner per variabel = pola mantrariset.

**Runner uji tanpa browser** `node tools/gen-uji.js <project-id> <bab1|…|lampiran> [--studi=10]` — env `UJI_EMAIL`/`UJI_PASS` + backend lokal; `?ulang=1` = 1 kredit (lampiran gratis). *Catatan*: regenerasi E2E baru dijalankan pada varian **kuantitatif (tesis proposal)**; varian lain menunggu uji serupa agar hemat kuota free tier (prompt target umum & varian-aware).

## Struktur baku baru KHUSUS tesis kuantitatif (TEMPLATE TESIS.docx) — verifikasi 7 Okt 2026

**Permintaan owner**: analisis `C:\Users\user\Downloads\TEMPLATE TESIS.docx` (tesis lengkap Universitas Tridinanti, Magister Manajemen, kuantitatif SEM-PLS) lalu buatkan prompt agar agen AI mengisi bab/sub-bab sesuai template. Template berisi ±20 paragraf **"INSTRUKSI UNTUK PROMPT"** yang ditanamkan pembuat template — semuanya diterjemahkan menjadi panduan prompt.

**Arsitektur**: varian baru **`V_TESIS_KUANTITATIF`** di `projects.routes.ts` — menggantikan **base+overlay tesis HANYA** untuk kombinasi `jenis=tesis` + `metode=kuantitatif` (`varianFor()` special-case, tanpa overlay `f` lama); jenis/metode lain terverifikasi tidak tersentuh (uji outline: skripsi kuantitatif & tesis kualitatif tetap struktur lama).

**Struktur baru** (label persis template):
- **Bab I** (6 sub): Latar Belakang · Identifikasi Masalah · Pembatasan Masalah · Perumusan Masalah · Tujuan Penelitian · Kegunaan Penelitian (Teoretis+Praktis).
- **Bab II** (4 sub): Kajian Pustaka (per variabel bertingkat `2.1.x.1 Pengertian` = 10 definisi + sintesis, dimensi/indikator + sintesis) · Hasil Penelitian Yang Relevan (**tabel 6 kolom** No|Peneliti(Tahun)|Judul|Persamaan|Perbedaan|Hasil ≥10 studi) · Kerangka Berpikir (narasi per jalur + bagan) · Hipotesis Penelitian (H1..Hn).
- **Bab III** (5 sub): Tempat dan Waktu (+Gantt di 3.1) · Populasi dan Sampel (`3.2.1/3.2.2` + Slovin + Purposive + kriteria inklusi) · Variabel dan Definisi Operasional (**kisi-kisi per variabel** `Dimensi|Indikator|No. Item Pernyataan`, kode item unik KM/BT/…) · Instrumen (Likert SS=5..STS=1) · Teknik Analisis Data (jalur SEM-PLS outer/inner/hipotesis + tabel keputusan t **atau** jalur regresi, konsisten sampai Bab IV).
- **Bab IV** (2 sub): Hasil Analisis (demografis → deskriptif → inferensial, tabel 4.x lengkap `Original Sample (O) | Sample Mean (M) | STDEV | T Statistics | P Values`) · Pembahasan Hasil (5 paragraf per hipotesis, angka konsisten dengan 4.1).
- **Bab V** (3 sub): Kesimpulan (per rumusan) · Implikasi Kebijakan (4 butir) · Saran (Praktis/Pihak Terkait/Akademis).
- **Lampiran** (6 sub): Kuesioner (salam + screening ☐ + identitas + kuesioner utama per variabel Likert ☐) · Tabulasi · Deskriptif · Olah Data · **Turnitin placeholder JUJUR** (tanpa persentase karangan) · Artikel Ilmiah.

**Target kedalaman varian tesis**: Bab I ≥25rb (umum) · Bab II ≥40rb · **Bab III ≥25rb + per-sub minimum** (3.1 ≥1,2rb / 3.2 ≥4,5rb / 3.3 ≥8rb / 3.4 ≥1rb / 3.5 ≥10rb — disesuaikan karena kuesioner pindah ke Lampiran; template asli BAB III = 26.821 kar) · Bab IV 25–50rb · Bab V ≥7rb · Lampiran ≥9rb.

**Audit sadar-varian** (`tools/audit-hasil.js`): `tesisKuant` = jenis tesis + metode kuantitatif → ganti cek lama (5-kolom terdahulu, definisi operasional 7 kolom, kuesioner `3.4.x`) dengan cek template: tabel 6 kolom, sub-sub kajian ≥8 + sintesis ≥4, kisi-kisi ≥4 tabel, Gantt, Likert, Slovin/Purposive, `Original Sample`, pembahasan per hipotesis, screening/☐/Turnitin jujur; `minSubs` Bab IV = 2; `TARGETS_TESIS_KUANT.bab3 = 25000`.

**Hasil uji E2E** proyek `200b68f5` (tesis kuantitatif, proposal;2 kredit bab + lampiran gratis; `finish=STOP` semua):

| Bab | Struktur lama | Struktur baru | Target | % |
|---|---|---|---|---|
| Bab II | 84.856 (struktur lama) | **49.676** | ≥40.000 | **124%** |
| Bab III | 34.407 (struktur lama) | **34.008** | ≥25.000 | **136%** |
| Lampiran | 19.352 (struktur lama) | **18.893** | ≥9.000 | **210%** |

**Audit akhir:44/46 lolos · 0 gagal · 0 peringatan** (2 SKIP = bab4/5 dikunci tahap proposal) — semua cek khas varian tesis baru PASS (bab2: tabel 6 kolom +9 sub-sub +4 sintesis; bab3:4 kisi-kisi + Gantt + Likert + Slovin; lampiran: kuesioner+screening + ☐ + Turnitin jujur). Catatan: Bab I masih konten struktur lama (lolos cek umum) — regenerasi bab1 (1 kredit) bila owner ingin sinkron penuh; bab4/bab5 terkunci sampai tahap `full`.

## Tunda (butuh owner)

1. Project Supabase BARU (kunci bersih) + ulangi 5 migrasi + update env Railway/Vercel/lokal
2. Midtrans Server Key sandbox → vars → uji QRIS → webhook URL Railway
3. **Kuota Gemini free tier** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier` = 20 req/hari per **model**; RPM 5, TPM 250 rb). **Sudah diakali dari kode** (commit `2228c7a`): `ai.service.ts` kini punya rantai fallback 8 model (`2.5-flash → 3.x flash → 3.x lite`) + jendela 4 request/menit per model; kalau satu model 429/kuota habis otomatis pindah model berikutnya, dan model yang kena `retryDelay` ditahan sesuai sisa waktunya → kapasitas harian = gabungan semua model (±150+ req/hari), bukan cuma 20. **Tetap disarankan**: pasang billing Google AI Studio (min $5) sebelum ada user riil, karena rantai fallback hanya menunda batas, bukan menghapusnya. **Keputusan owner 7 Okt**: YA — pasang billing $5 (menunggu aksi owner). **Langkah konkret**: (1) buka `aistudio.google.com/apikey` (login akun yang punya `GEMINI_API_KEY` backend), (2) di tabel API key cari project free-tier → tombol **"Set up billing"** pada kolom *Billing Tier*, (3) ikuti wizard: setuju ToS negara → kontak → metode pembayaran → **prabayar minimum $5** (atau postpay), (4) aktifkan *auto-reload* agar tak kehabisan di tengah user, (5) verifikasi di halaman Billing AI Studio: status Paid/Prepay + saldo > $0. Pastikan API key di env Railway `GEMINI_API_KEY` berada di **project yang sama** yang di-upgrade (kalau beda project, kuartanya tetap free tier)
4. Konten: video tutorial, link Grup WA (`https://chat.whatsapp.com/JFKzEThZQzDGwZKkMcxLq6`), payout affiliate manual, plugin Word
5. Custom domain `api.skripsiplg.my.id` (opsional)

## Akun uji (password minta ke owner)

- uji.tulisulang7@gmail.com — dibuat 7 Okt untuk uji biaya tulis-ulang (0 kredit, email dikonfirmasi via admin Supabase, proyek "Uji Biaya Tulis Ulang Backend"). Password: `321_Bayartulisulang`

- tester.palembang@gmail.com (saldo **16** setelah uji E2E generate; proyek paritas `200b68f5-0d1d-4249-a3f1-b84309ed9b08` + proyek contoh lama; jatah GRATIS perkaya bab1 & bab2 sudah terpakai waktu uji)
- andraexcell@gmail.com (admin, bypass kredit)
