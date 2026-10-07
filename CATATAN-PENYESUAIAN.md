# Catatan penyesuaian hasil uji — BACKLOG (IMPLEMENTASI)

Daftar perbaikan dari hasil uji langsung oleh owner. **Seluruh item 1–9 telah diimplementasikan
pada 7 Okt 2026** (perintah owner: "BAGUS, IMPLEMENTASIKAN SEKARANG"); status per item ada di tiap
bagian. Ringkasan verifikasi:

| Item | Isi | Status | Bukti verifikasi |
|---|---|---|---|
| 1 | Penomoran hierarki ≤4 tingkat, label tebal, TOC 3 tingkat | ✅ selesai | uji unit 21/21 (`tools/uji-normalisasi.js`), audit nol lompat/yatim/duplikat, DOCX TOC `\o "1-3"` |
| 2 | Nama tabel wajib (`Judul Tabel:`) — web + DOCX | ✅ selesai | E2E: bab3 6/6 nama; studio web 6/6 caption center+bold di atas tabel; DOCX caption `Tabel 3.1…` + `Tabel L…` (6/6 nama cocok) |
| 3 | 2 spasi tulisan; 1 spasi isi/judul/sumber tabel & gambar | ✅ selesai | `tools/cek-docx.js`: line480=518, line240=978, line360=0 |
| 4 | Sampel <100 → sampling jenuh (bukan Slovin) | ✅ selesai | E2E regen `--populasi=50` → konten "Sampling Jenuh", tanpa Slovin; copy dialog studio ≥100 Slovin / <100 jenuh |
| 5 | Rumus tanpa LaTeX | ✅ selesai | unit test `bersihTeks`; audit nol pola LaTeX; normalisasi konten tersimpan |
| 6 | Bab IV: upload tabulasi ATAU agen buatkan | ⚠️ Opsi B terpasang; Opsi A menunggu keputusan owner | prompt `TESIS_BAB4` DATA & HASIL + hint studio terlihat E2E; output Bab IV belum bisa E2E (proyek tahap proposal) |
| 7 | Bab V tanpa kutipan | ✅ selesai | `SITASI_BAB5` tanpa ref+dapus (uji mapping); output E2E terkunci tahap proposal |
| 8 | Lampiran 1 butir = indikator per variabel | ✅ selesai | audit: **45 kode item cocok** antara kisi-kisi Bab 3.3 dan kuesioner |
| 9 | Lampiran 2–6 kosong + penanda jujur; Lampiran 1 penuh | ✅ selesai | E2E regen lampiran: 6.2–6.6 hanya judul + `[Diisi …]`, 6.1 penuh |

Alat bantu verifikasi baru: `tools/uji-normalisasi.js` (unit), `tools/cek-docx.js` (format DOCX),
`tools/export-uji.js` (unduh ekspor), `tools/cek-model.js` (kesehatan model), `tools/topup-kredit.js`
(top-up kredit uji), `tools/normalkan-konten.js` (normalisasi konten tersimpan).

---

## 1. Penomoran di dalam bab

**Status**: ✅ **IMPLEMENTASI SELESAI + TERVERIFIKASI (7 Okt 2026)** — `SITASI` (s.d. 4 tingkat, larang lompat/yatim/duplikat), `rapikanPenomoran`+`normalisasiBab` saat simpan (stream, ulang, PATCH, perkaya), label tanpa nomor → paragraf tebal di DOCX, TOC `\o "1-3"`, cek audit penomoran. Bukti: unit 21/21, audit nol temuan penomoran, `tools/cek-docx.js` lolos. Temuan/renkap di bawah = kondisi SEBELUM implementasi.

### A. Kaidah umum penomoran di dalam bab (konvensi skripsi/tesis Indonesia / Hibler)

| Tingkat | Format | Contoh | Keterangan |
|---|---|---|---|
| Bab | Romawi besar | `BAB I`, `BAB II` | judul bab saja, bukan bagian hierarki |
| Sub-bab 1 | `B.S` | `1.1 Latar Belakang` | angka bab + urut, satu spasi lalu judul |
| Sub-bab 2 | `B.S.S` | `3.2.1 Populasi` | anak langsung dari `3.2` |
| Sub-bab 3 | `B.S.S.S` | `2.1.1.1 Pengertian Brand Trust` | anak langsung dari `2.1.1` |
| Sub-bab 4 | `B.S.S.S.S` | jarang | batas maksimum penomoran hierarkis (4–5 tingkat) |
| Sub-judul | **tanpa nomor** | `Definisi Konseptual`, `Kisi-Kisi Instrumen` | label pendukung di bawah level ternomor (Hibler level 6–7) — tebal/italic, TIDAK ikut hierarki angka |
| Isi | paragraf / daftar lokal | `a. b. c.` atau `1. 2. 3.` | penomoran butir daftar hanya lokal, tidak disangkutkan ke hierarki sub-bab |

**Aturan wajib**
1. Berurutan tanpa lompat: `1.1 → 1.2 → 1.3` (tak boleh `1.1 → 1.3`).
2. Tak boleh yatim: `1.1` wajib punya saudara (`1.2`); `3.2.1` hanya boleh ada bila `3.2` ada; tiap induk minimal 2 anak.
3. Nomor anak = lanjutan posisi induknya (awalan `3.2.` untuk anak `3.2`).
4. Judul sub-bab tanpa kata "BAB"/"Sub-bab"; angka = posisi, bukan urut global.
5. Daftar Isi menampilkan maksimal sampai tingkat 3 (sering 2).
6. Elemen bernomor lain memakai pola `(nomor bab).(urut dalam bab)`: `Tabel 3.1`, `Gambar 2.1`, `Rumus (3.1)`.
7. Setelah level ternomor terakhir, bagian pendukung kembali ke label tanpa nomor atau `a. b. c.`.

### B. Temuan sistem saat ini (audit kode, 7 Okt 2026 — kondisi SEBELUM implementasi)

1. **Prompt `SITASI`** hanya mensanksikan judul pola `N.M` (2 tingkat) + tabel markdown + daftar bernomor — sub-sub `3.2.1`/`2.1.1.1` dan label tanpa nomor **tidak diatur**, jadi AI menulisnya seadanya (uji E2E mayoritas benar, tapi belum dijaga konsistensinya).
2. **Export DOCX** (`backend/src/routes/projects.routes.ts` ~baris 1522): regex `^(\d+(?:\.\d+)+)\.?\s+Judul` → level = jumlah titik (dibatasi 4): `1.1`→H2, `3.2.1`→H3, `2.1.1.1`→H4. **Nomor dari AI dipakai apa adanya** — tak ada validasi kelanjutan (`1.1 → 1.3`), yatim (`3.2.1` tanpa `3.2`), maupun duplikat; kesalahan AI ikut terbawa ke DOCX + TOC.
3. **Label tanpa nomor** (`Definisi Konseptual`, `Kisi-Kisi Instrumen`, `Pengaruh X terhadap Z`, `a. Karakteristik …`) jatuh jadi **paragraf biasa** di DOCX — tak ada gaya tebal/italic khusus dan tak muncul di TOC, padahal template asli menulisnya tebal.
4. **Daftar Isi DOCX** memakai TOC `\o 1-2` (BAB + `N.M` saja) — template asli memuat sampai `2.1.1` (3 tingkat) di Daftar Isi.
5. **Caption tabel/gambar** sistem: `Tabel <bab>.<SEQ restart per bab>` via field SEQ → format `Tabel 2.1` sudah standar ✓; caption buatan AI dibuang ✓; lampiran & pustaka tanpa caption ✓.
6. **Sub-bab lampiran di DOCX** direnumber otomatis: `6.1` → `Lampiran 1`, `6.1.1` → `L1.1` ✓ ala referensi.
7. **Daftar butir** `1. 2. 3.` → Word numbering dengan restart per blok ✓ (lokal, terpisah dari hierarki sub-bab).

### C. Rencana perbaikan (rencana awal — kini terpasang semua, lihat baris Status)

a. Perkuat `SITASI`: izinkan eksplisit sub-sub `N.M.K` s.d. 4 tingkat + aturan label tanpa nomor; larang nomor lompat/yatim/duplikat.
b. Validasi/renumber saat simpan (jalur stream & ulang): deteksi lompat/yatim/duplikat → koreksi otomatis sebelum tersimpan.
c. Label tanpa nomor → style heading khusus di DOCX (tebal/italic, tanpa nomor, tidak ikut TOC).
d. Putuskan kedalaman Daftar Isi (`\o 1-2` vs `1-3`; template = 3 tingkat).
e. Tambah cek audit penomoran (lompat / yatim / duplikat) di `tools/audit-hasil.js`.

---

## 2. Nama/judul tabel — WAJIB ada di setiap tabel, setiap bab, judul mencerminkan isi

**Status**: ✅ **IMPLEMENTASI SELESAI + TERVERIFIKASI (7 Okt 2026)** — `SITASI` mewajibkan baris `Judul Tabel:` sebelum tiap tabel (di semua bab, termasuk Lampiran 6.1), parser DOCX memakai baris itu sebagai judul caption (`Tabel 3.1 <nama>` / `Tabel L<n> <nama>`; fallback `judulAktif`), studio web menampilkan sebagai caption center+bold di atas tabel, audit menghitung judul per tabel (format lama = WARN). Bukti E2E: bab3 6/6, web 6/6, DOCX 6/6 nama cocok. Konten bab1/bab2 format lama tetap WARN — regen bila owner ingin seragam (1 kredit/bab).

**Permintaan owner**: setiap tabel wajib punya nama, berlaku di **setiap bab** (termasuk Lampiran),
dan **judulnya harus mencerminkan isi tabel** — bukan sekadar mengulang judul sub-bab.

### A. Temuan sistem saat ini (audit, 7 Okt 2026 — kondisi SEBELUM implementasi)

1. **Tampilan web (markdown): nol nama tabel** — proyek uji `200b68f5`: bab1 2 tabel, bab2 1, bab3 6, lampiran 7 = **16 tabel tanpa caption** di layar. Penyebab: `SITASI` melarang AI menulis caption ("penomoran dibuat otomatis oleh sistem"), dan sistem **hanya** menambah caption pada export DOCX — jadi web tidak pernah menampilkannya.
2. **Caption DOCX memakai judul sub-bab, bukan isi tabel** (`projects.routes.ts` ~1367-1381): caption = `Tabel <bab>.<SEQ>` + `judulAktif` (judul sub-bab level ≤2 terakhir, di-update hanya untuk `1.1`/`1.2`, bukan `3.2.1`). Akibat: ke-4 tabel kisi-kisi di 3.3 semua berjudul sama "Tabel 3.3 Variabel dan Definisi Operasional"; tabel di bawah sub level-3 memakai judul induknya — **tidak mencerminkan isi tabel**.
3. **Lampiran: caption sengaja dimatikan** (`if (!noBab || lampiran) return`) — 7 tabel lampiran (kuesioner, tabulasi, deskriptif, olah data) kosong nama di DOCX.
4. **Template rujukan**:53 caption `Tabel/Gambar` di seluruh dokumen, **0 di rentang lampiran** (template juga tak mencaption tabel lampiran — permintaan owner melampaui template, berlaku sebagai aturan baru).
5. Yang **sudah benar** (dipertahankan): caption di ATAS tabel, center+bold, nomor per-bab `Tabel 2.1` via field SEQ (restart per H1), caption buatan AI dibuang agar tak dobel.

### B. Rencana perbaikan (rencana awal — kini terpasang, lihat baris Status)

a. **Prompt (`SITASI` + panduan varian)**: larangan caption diubah jadi **kewajiban baris judul tabel TANPA nomor** sebelum tiap tabel, pola `Judul Tabel: <deskripsi spesifik isi>` — contoh "Judul Tabel: Kisi-Kisi Instrumen Variabel Prestasi Kerja ASN". Larang judul yang hanya menyalin judul sub-bab (harus menyebut objek/ukuran/tahun yang membedakan).
b. **Parser DOCX**: baris `Judul Tabel:` jadi sumber teks caption (gantikan `judulAktif`; `judulAktif` tetap fallback bila AI lupa); nomor tetap `Tabel <bab>.<SEQ>` — diperiksa juga level ≥3 supaya judul sub-bab salah-pakai tak terjadi.
c. **Web/studio**: tampilkan nama tabel di atas tiap tabel (opsi penomoran `Tabel 3.1 — …` mengikuti nomor bab kunci, atau tanpa nomor — ikut keputusan owner).
d. **Lampiran**: angkat pengecualian `lampiran` pada fungsi caption — penomoran pilihan: `Tabel L1.1` (mengikuti pola `L1.1` sub-bab lampiran) atau `Tabel 6.1` — **butuh keputusan owner**.
e. **Audit**: cek baru — tiap blok tabel punya baris judul sebelumnya; jumlah judul = jumlah tabel; judul ≠ judul sub-bab identik; caption DOCX muncul di semua bab.

---

## 3. Spasi — 2 spasi semua tulisan; 1 spasi isi/judul/sumber tabel & judul/sumber gambar

**Status**: ✅ **IMPLEMENTASI SELESAI + TERVERIFIKASI (7 Okt 2026)** — body/daftar/heading/docDefaults `line:480`; caption, sel tabel, rumus, paragraf `Sumber:`/`Judul Tabel:` `line:240`. Bukti: `tools/cek-docx.js` → 480:518 lokasi · 240:978 · **360:0 (nol sisa 1,5 spasi)**. (Heading ikut 2 spasi.)

**Permintaan owner**: di SEMUA bab — format **2 spasi** untuk semua tulisan; **1 spasi** khusus isi tabel, judul tabel, sumber tabel, judul gambar, dan sumber gambar.

**Temuan (DOCX export)**: paragraf body/daftar/docDefaults kini `line: 360` = **1,5 spasi**; sel tabel sudah `line: 240` = 1 spasi ✓; caption tabel `line: 360` (1,5) ✗; baris `Sumber : …` diparse jadi paragraf biasa → ikut 1,5 ✗; rumus pendek sudah 240 ✓.
**Rencana**: body + daftar + docDefaults + judul → `line: 480` (2,0); caption `Tabel/Gambar` → `240`; deteksi khusus baris `^Sumber\s*:` dan `^Judul (Tabel|Gambar):` → `240`; sel tabel tetap `240`. (Heading: ikut 2 spasi atau tetap — keputusan kecil owner.)

## 4. Sampel < 100 → sampling jenuh, JANGAN Slovin

**Status**: ✅ **IMPLEMENTASI SELESAI + TERVERIFIKASI E2E (7 Okt 2026)** — `populasiNote` + panduan tesis `3.2.2` percabang `<100 → sampling jenuh/sensus tanpa rumus, ≥100 → Slovin`; dialog studio menampilkan aturan yang sama (≥100 Slovin / <100 jenuh); audit menerima `Sampling Jenuh|Sensus` ATAU `Slovin`. Bukti E2E: regen Bab III `--populasi=50` → konten memakai **Sampling Jenuh, tanpa Slovin**.

**Temuan**: panduan Bab III kini **mewajibkan Slovin** (3.2.2 + `populasiNote` kuantitatif) dan audit mengecek kata `Slovin|Purposive`.
**Rencana**: aturan percabangan di prompt — bila user memasukkan sampel/populasi **< 100**, pakai **sampling jenuh (sensus)** tanpa rumus; Slovin hanya untuk ≥ 100; Purposive Sampling tetap. `populasiNote`, panduan tesis `3.2.2`, dan cek audit disesuaikan (audit menerima Sampling Jenuh *atau* Slovin sesuai kondisi).

## 5. Rumus tanpa format LaTeX

**Status**: ✅ **IMPLEMENTASI SELESAI + TERVERIFIKASI (7 Okt 2026)** — `SITASI` melarang LaTeX (dengan contoh polos), `bersihTeks` membuang `$…$`/`\frac`/`\sqrt`/`\(` saat simpan, parser DOCX buang sisa command, audit cek nol pola. Bukti: unit test lulus, audit bab3/semua bab **0 pola LaTeX**, `normalkan-konten.js` bersihkan konten lama (14 baris → teks polos).

**Temuan**: uji konten Bab III menemukan **11 pola `$…$`**; parser DOCX hanya menangani rumus pendek polos (`Y = …`), tak ada penanganan LaTeX.
**Rencana**: `SITASI` + panduan varian melarang LaTeX (`$…$`, `\frac`, `\sqrt`, `\(` ) — rumus ditulis polos Unicode (mis. `Y = β₀ + β₁X + e`, pecahan pakai garis miring); `bersihTeks()` buang sisa `$…$` saat simpan; parser DOCX fallback buang backslash-commands; audit cek nol pola LaTeX.

## 6. Bab IV — minta user upload tabulasi data mentah, ATAU agen yang buatkan (lulus semua uji, semua hipotesis signifikan)

**Status**: ⚠️ **OPSI B TERPASANG (7 Okt 2026)** — prompt `TESIS_BAB4` "DATA & HASIL" (tabulasi konsisten, semua uji lulus, seluruh hipotesis signifikan) + hint studio saat Bab IV kosong ("Belum ada data? Agen menyusun tabulasi & hasil olahannya sendiri…") — terverifikasi tampil E2E. **OPSI A (upload `.xlsx/.csv` + olah nyata) masih menunggu keputusan owner.** Output Bab IV belum bisa E2E (proyek uji tahap proposal → bab terkunci) — verifikasi sifatnya review kode/prompt.

**Temuan**: belum ada alur upload data mentah (Bab IV kini terkunci tahap `proposal`); modal sudah ada — dependensi `xlsx` + endpoint pemrosesan dokumen (`files.routes.ts`).
**Opsi A — upload**: sebelum generate Bab IV, studio minta user unggah tabulasi `.xlsx/.csv` → backend mengolah (uji validitas, reliabilitas, asumsi klasik/regresi-PLS) → angka nyata masuk prompt & Lampiran 2–4 terisi otomatis.
**Opsi B — agen buatkan**: agen menyusun tabulasi sintetis n responden × jumlah item yang KONSISTEN, hasil olahan **lulus semua uji** (loading > 0,7; α/CR > 0,7; AVE > 0,5; R²; asumsi klasik) dan **seluruh hipotesis signifikan (p < 0,05)** — konsisten antara 4.1, 4.2, dan lampiran.

## 7. Bab V tanpa kutipan

**Status**: ✅ **IMPLEMENTASI SELESAI (7 Okt 2026)** — `SITASI_BAB5` (peta khusus bab5): tanpa bodynote, tanpa "Daftar Pustaka Bab Ini" (ya — dapus Bab V ikut dihapus), kesimpulan/implikasi/saran murni tanpa sitasi; audit cek bab5 tanpa dapus & tanpa DOI. Output E2E terkunci tahap proposal — verifikasi via review kode + audit.

**Temuan**: `SITASI` mewajibkan bodynote di setiap sub-bab yang memakai teori/temuan dan mengakhiri tiap bab dengan "Daftar Pustaka Bab Ini" — Bab V belum dikecualikan. Bab V uji proyek terkunci tahap `proposal` sehingga belum bisa diverifikasi outputnya.
**Rencana**: kecualikan `bab5` dari kewajiban bodynote + tanpa "Daftar Pustaka Bab Ini" (kesimpulan/implikasi/saran murni tanpa sitasi).

## 8. Lampiran 1 — jumlah butir kuesioner = jumlah indikator per variabel

**Status**: ✅ **IMPLEMENTASI SELESAI + TERVERIFIKASI E2E (7 Okt 2026)** — prompt lampiran menyuntik **kisi-kisi Bab 3.3** sebagai konteks wajib + panduan 6.1 "satu indikator satu butir, kode item persis KM01…"; audit membandingkan himpunan kode antara Bab 3.3 dan Lampiran. Bukti: regen lampiran → **45 kode item cocok 1:1** (BKD01–15, WO01–15, MK01–15, PK01–15).

**Temuan**: regen terakhir Lampiran punya **0 kode item** (kode `KM01…` tidak muncul) sehingga kecocokan butir↔indikator tak terjaga; panduan 6.1 hanya bilang "tiap indikator punya butir" (tidak eksak).
**Rencana**: generate Lampiran 1 **memakai kisi-kisi tersimpan Bab3.3 sebagai konteks wajib** — tiap variabel: jumlah butir pernyataan PERSIS jumlah indikator (kode ikut dibawa `KM01…KM n`), penomoran `6.1.x` per variabel; audit menghitung butir per variabel == jumlah indikator kisi-kisi.

## 9. Lampiran 2 dan seterusnya — dikosongkan dulu

**Status**: ✅ **IMPLEMENTASI SELESAI + TERVERIFIKASI E2E (7 Okt 2026)** — `strukturL` varian tesis: 6.1 Kuesioner isi penuh; **6.2–6.6 hanya judul sub-bab + penanda jujur** `[Diisi setelah data responden terkumpul]` dst., tanpa tabel buatan; `targetL` menegaskan; audit tidak menuntut tabel 6.2+ dan menghitung tabel lampiran hanya pada 6.1. Bukti E2E regen lampiran: 6.2–6.6 kosong + penanda, 6.1 penuh (4 tabel bernama).

**Temuan**: panduan 6.2–6.6 kini meminta isi (tabel tabulasi/deskriptif/olah data dengan angka konsisten Bab IV + placeholder Turnitin).
**Rencana**: 6.2–6.6 hanya **judul sub-bab + penanda kosong jujur** (`[Diisi setelah data terkumpul/hasil olah tersedia]`), tanpa tabel buatan; **Lampiran 1 tetap isi penuh**. Audit disesuaikan (tak menuntut tabel 6.2+); caption item 2 untuk lampiran hanya berlaku tabel kuesioner 6.1.

---

## 10. Dashboard Admin — kelola model/router AI + saklar fitur dashboard (permintaan owner 8 Okt 2026)

**Status**: ✅ **TAHAP 1 (Model + Fitur) SELESAI + TERVERIFIKASI (8 Okt 2026)** — halaman `/dashboard/admin` (hanya akun `plan=admin`; guard dobel: link disembunyikan + backend `requireAdmin` → 403).

**Isi halaman**:
- **Tab Model AI** — tabel entri model = (nama id, provider `gemini`/`openai`, base URL, API key, aktif, urutan ↑↓). Provider **openai** = gateway OpenAI-compatible (OpenRouter/LiteLLM/OneAPI/NewAPI/relay 9router, dsb) → request `/chat/completions` streaming SSE; provider **gemini** = SDK resmi (API key per entri = multi-key, baseUrl opsional). Rotasi/blok kuota/RPM tetap seperti semula per-entri. Key TIDAK pernah dikirim ke klien (hanya `••••`), save ulang tanpa ubah key = key lama dipertahankan, ada tombol **Tes** (1 request mini) & **Reset ke bawaan**, panel status runtime (blok menit, rpm, urutan berjalan).
- **Tab Fitur** — 20 saklar (Utama/Penelitian/Uji & Revisi/Pendampingan) → flags global; sidebar + kartu dashboard + FAB asisten ikut tampil/sembunyi untuk SEMUA pengguna, langsung tanpa reload (pendengar `perbaruiFlags`).

**Penyimpanan**: tabel `app_settings` — **migrasi `migration_admin.sql` SUDAH DIJALANKAN (8 Okt 2026)** via Management API (`tools/jalankan-sql.js` + PAT owner, HTTP 201) → storage kini **tabel**; jalur fallback file `backend/data/app-settings.json` (ter-`.gitignore`) tetap aktif bila tabel tak ada, plus **auto-import file → tabel** (terverifikasi: baris dihapus dari tabel → GET flags → baris kembali otomatis).

**Verifikasi**: `tools/smoke-admin.js` **14/14 PASS** (CRUD model, mask key, merge key, validasi 400, flags, status, jalur openai terbukti — 401 dari OpenRouter saat key palsu, reset default) + mode `--guard` **5/5 PASS** (semua endpoint admin tolak non-admin 403, `/api/flags` publik tetap 200); E2E browser: link Admin muncul-hilang ikut plan, toggle fitur sembunyikan menu/kartu/FAB langsung + persist reload, panel 403 untuk non-admin; `tsc` backend+frontend 0 error, `next build` lolos (35 route).

**Tahap berikutnya (menunggu arahan owner)**: Opsi A upload `.xlsx/.csv` Bab IV; manajemen user/kredit/monitor generate; testing lintas-browser; guard endpoint mock payment P0 (`/billing/checkout`+`/confirm` masih terbuka) — pertanyaan "Mau saya tutup sekarang?" belum dijawab.
