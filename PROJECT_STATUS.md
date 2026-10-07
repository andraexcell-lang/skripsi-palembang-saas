# Status Proyek Skripsi Palembang SaaS

Terakhir diperbarui: 7 Okt 2026. Akun login ulang: shairancaye@gmail.com (0 kredit, Paket Free). **Fase 0–4 SELESAI; Fase 5 (fitur lengkap) hampir selesai — lihat bagian "Fasa 5 (P4) — progres 7 Okt 2026" di bawah; Fasa 6 (testing & rilis) belum mulai** (build `next build` lolos + cek SSR status 200): (a) token paritas di `globals.css` — brand `#0066FF` → `#2563eb` (blue-600 mantrariset), hover `#1d4ed8`, token `--danger`/`--success`/`--radius-sm 6px`/`--fs-*` + utilitas `bg-primary`/`text-danger`; (b) `CreditBadge` paritas — chip 88×28 radius 6px, **merah red-600 hanya saat saldo 0**, netral bila >0; (c) `ThemeToggle` diberi semantik `role="radiogroup"`/`radio`; (d) **penanda halaman aktif sidebar** — menu sesuai route disorot + `aria-current` (khusus `/dashboard/studio/*` → "Proyek Penelitian"; logo & chip kredit dikecualikan); (e) **panel Riwayat percakapan** di `/dashboard/asisten` (keputusan owner #3: **panel riwayat saja**) — tombol "Riwayat" 94×32 kanan atas, panel 320px header "Riwayat percakapan" + ×, empty state "Belum ada percakapan tersimpan…", daftar + buka + **hapus**, persist `localStorage` (`sp-riwayat-asisten`, maks 50 sesi); **Urungkan & halaman `/syarat` ditunda** (tidak ada di dokumen analisis — butuh rujukan owner). **Temuan**: sidebar 4 grup, radiogroup tema, CreditBadge, dan 10 slash-command + dropdown `/` **sudah ada** sebelumnya — duplikasi sudah direvert. Estimasi kredit uji AI ≈ 50-80 kredit/hari (setelah top-up). 32 halaman mantrariset + 31 halaman situs sudah di-analisis DOM di `hasil-analisis-mantrariset/` (2 laporan + 32 screenshot **sudah di-commit** `31ec1ff`). **Sisa roadmap**: **P3 = SELESAI (7 Okt)** — (a) modal Bukti Kutipan + hapus kartu referensi sudah ada (`09cd676`); (b) **desain empty state paritas** (ikon slate-300 + teks slate-400 + tombol biru) via komponen bersama `components/EmptyState.tsx` di `/dashboard/proyek`, Lab Revisi (teks persis "Belum ada proyek yang bisa direvisi…" + "Ke Studio"), AI Writer ("Ruang menulis bebas dengan sitasi otomatis…" + "Buat Dokumen Pertama"), notifikasi slate-400; (c) **FAB "Buka asisten"** 48px radius penuh biru-600 kanan-bawah (keputusan owner: asisten saja, tombol WA ditunda konten nomor) — sebelumnya tak pernah ada (temuan, sisa P1 §3.3.2). Tinggal **P4** (affiliate mendetail, tutorial video grid, Karil UT lengkap, sistem paket lengkap).

## Fasa 5 (P4) — progres 7 Okt 2026 (commit `f101c01`, `5ecb41b`, `1d31423` — build lolos + SSR 200)

- **Olah Data 6 kartu paritas §3.8** (`f101c01`): Transkripsi Audio/Video (1 kredit/10 mnt), Olah Data SPSS (3), SmartPLS (5), Analisis Kualitatif (1/3 informan), Analisis Dokumen (1/3 segmen), Analisis Visual Video (±4) — ikon + tag KUALITATIF/KUANTITATIF + deskripsi + harga per kartu, prompt & `feature` backend per alat (`visual: 4` ditambah ke `FEATURE_COSTS`).
- **Chip "0 kredit" palsu dihapus** — 4 halaman (brainstorming, olah-data, plagiasi, generate-ppt) kini pakai `CreditBadge` asli (saldo live; chip statis = info menyesatkan).
- **Billing paritas §3.20** (`5ecb41b`): kartu "Paket {plan} aktif" + n kredit tersisa; grup **Paket Mahasiswa** (4 kartu) & **Paket Profesor** (4 kartu); checklist fitur per kartu (dasar 9 + Profesor 5 tambahan); badge "Populer"; catatan "Pembayaran via QRIS + scan, paket langsung aktif otomatis."; Riwayat Transaksi = tabel Tanggal/Status/Jumlah. **Keputusan owner**: Profesor Tahunan **Rp1.548.000 / 3000+500** (skala harga kita). **Ditunda**: kartu University (20/50/100 akun) beserta tombol "Hubungi Tim Kami" — teks harga referensi "kabur" + kontak resmi belum ada; aksi kolom Riwayat "Lihat/Batalkan" (tak ada endpoint cancel & target tak terdokumentasi); "Klaim Bonus" (analisis: "belum dicek").
- **Backend `applyPlan`**: `profiles.plan` kini di-update ke `mahasiswa`/`profesor` saat bayar lunas (mock confirm + webhook Midtrans) — sebelumnya selalu `free` → kartu paket & badge "Aktif" di dashboard salah.
- **Affiliate modal §3.21** (`1d31423`): modal "Berlangganan dulu, yuk!" (ikon gift + body persis + tombol biru "Lihat Paket Langganan" → `/billing` + ×) muncul bila **belum pernah ada transaksi `paid`**; sub judul ikut referensi.
- **Karil UT paritas §3.17**: halaman daftar = empty state "Belum ada Karil" + teks persis + tombol "Buat Karil →" → `/dashboard/karil/baru` (form dipindah ke rute baru) + kartu "Mengikuti Panduan Karil UT (MKWI4560)" tabel 6 baris persis screenshot + catatan kelulusan; `EmptyState` dapat prop opsional `judul`.
- **Tuton UT lengkap §3.26** (halaman baru `/dashboard/tuton`): 3 kartu langkah persis (Tempel lembar soal / Tulis jawaban 3-1 kredit / Unduh BJT), banner info + link skripsi, form Mata kuliah + Identitas sampul BJT, "Buat & tempel soal →"; workspace tempel soal (Tugas/Diskusi) → jawaban AI (`tuton_tugas: 3`, `tuton_diskusi: 1`) editable → **Unduh BJT** via route baru `POST /api/files/bjt` (docx bersampul UT, gratis); data lokal `sp-tuton`; item menu sidebar "Tuton UT".
- **Proyek Penelitian paritas §3.2**: grid 8 kartu (Buat Skripsi/Tesis/Disertasi, Artikel Sinta/Scopus, Ubah Skripsi → Artikel, Tuton UT, Karil UT) + empty state teks persis "Belum ada proyek. Pilih salah satu di atas untuk mulai."
- **Terverifikasi**: `next build` & `tsc` exit 0; SSR 200 semua halaman tersentuh (tuton, karil, karil/baru, proyek, billing, affiliate, olah-data, dsb).

**Sisa Fasa 5 yang belum dikerjakan**: tutorial video grid (P4), verifikasi visual perubahan ini di browser (sesi tanpa browser sampai sekarang). **Fasa 6** (responsive/dark/cross-browser/performance/README) belum mulai.

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

bab 10 (**tesis 8**) · **Lampiran GRATIS** (otomatis setelah Bab III) · sesuaikan 5 · tinjau 5 · **perkaya 1 (GRATIS sekali per bab, disimpan di `identitas.perkaya`)** · parafrase 1 · ppt 8 · plagiasi 15 · artikel 15 · sidang 15/25 · spss 3 · smartpls 5 · kualitatif/dokumen/transkripsi 1 · brainstorming/kelayakan/novelty/cari/cek-sitasi/unggah-artikel/referensi/hapus-sub-bab gratis

## Tunda (butuh owner)

1. Project Supabase BARU (kunci bersih) + ulangi 5 migrasi + update env Railway/Vercel/lokal
2. Midtrans Server Key sandbox → vars → uji QRIS → webhook URL Railway
3. **Kuota Gemini free tier** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier` = 20 req/hari per **model**; RPM 5, TPM 250 rb). **Sudah diakali dari kode** (commit `2228c7a`): `ai.service.ts` kini punya rantai fallback 8 model (`2.5-flash → 3.x flash → 3.x lite`) + jendela 4 request/menit per model; kalau satu model 429/kuota habis otomatis pindah model berikutnya, dan model yang kena `retryDelay` ditahan sesuai sisa waktunya → kapasitas harian = gabungan semua model (±150+ req/hari), bukan cuma 20. **Tetap disarankan**: pasang billing Google AI Studio (min $5) sebelum ada user riil, karena rantai fallback hanya menunda batas, bukan menghapusnya
4. Konten: video tutorial, link Grup WA (`https://chat.whatsapp.com/JFKzEThZQzDGwZKkMcxLq6`), payout affiliate manual, plugin Word
5. Custom domain `api.skripsiplg.my.id` (opsional)

## Akun uji (password minta ke owner)

- tester.palembang@gmail.com (saldo **16** setelah uji E2E generate; proyek paritas `200b68f5-0d1d-4249-a3f1-b84309ed9b08` + proyek contoh lama; jatah GRATIS perkaya bab1 & bab2 sudah terpakai waktu uji)
- andraexcell@gmail.com (admin, bypass kredit)
