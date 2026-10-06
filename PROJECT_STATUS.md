# Status Proyek Skripsi Palembang SaaS

Terakhir diperbarui: 6 Okt 2026. Acuan fitur: https://mantrariset.com (akun uji: dedibusro5@gmail.com).

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
- **Selisih sadar** (dibuat, bukan terlewat): (a) konfirmasi tulis-ulang **tanpa** butir "riwayat/Urungkan" karena kita belum punya fitur riwayat — janji palsu lebih buruk daripada teks beda; (b) **biaya tulis-ulang 10 kredit** (harga bab milik owner) sementara referensi menilai 1 — menunggu keputusan owner; (c) link `Selengkapnya` menunjuk `/dashboard/tutorial` sebab tidak ada halaman `/syarat`; (d) `Abstrak ID+EN` tetap ada di grup toolbar (fitur kita tak ada di referensi)

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

## Biaya kredit

bab 10 (termasuk Lampiran) · sesuaikan 5 · tinjau 5 · **perkaya 1 (GRATIS sekali per bab, disimpan di `identitas.perkaya`)** · parafrase 1 · ppt 8 · plagiasi 15 · artikel 15 · sidang 15/25 · spss 3 · smartpls 5 · kualitatif/dokumen/transkripsi 1 · brainstorming/kelayakan/novelty/cari/cek-sitasi/unggah-artikel/referensi/hapus-sub-bab gratis

## Tunda (butuh owner)

1. Project Supabase BARU (kunci bersih) + ulangi 5 migrasi + update env Railway/Vercel/lokal
2. Midtrans Server Key sandbox → vars → uji QRIS → webhook URL Railway
3. **Kuota Gemini free tier** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier` = 20 req/hari per **model**; RPM 5, TPM 250 rb). **Sudah diakali dari kode** (commit `2228c7a`): `ai.service.ts` kini punya rantai fallback 8 model (`2.5-flash → 3.x flash → 3.x lite`) + jendela 4 request/menit per model; kalau satu model 429/kuota habis otomatis pindah model berikutnya, dan model yang kena `retryDelay` ditahan sesuai sisa waktunya → kapasitas harian = gabungan semua model (±150+ req/hari), bukan cuma 20. **Tetap disarankan**: pasang billing Google AI Studio (min $5) sebelum ada user riil, karena rantai fallback hanya menunda batas, bukan menghapusnya
4. Konten: video tutorial, link Grup WA (`https://chat.whatsapp.com/JFKzEThZQzDGwZKkMcxLq6`), payout affiliate manual, plugin Word
5. Custom domain `api.skripsiplg.my.id` (opsional)

## Akun uji (password minta ke owner)

- tester.palembang@gmail.com (saldo **17**, ada proyek contoh; jatah GRATIS perkaya bab1 & bab2 sudah terpakai waktu uji)
- andraexcell@gmail.com (admin, bypass kredit)
