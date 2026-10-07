# Catatan penyesuaian hasil uji — BACKLOG

Daftar perbaikan dari hasil uji langsung oleh owner. **Disimpan dulu, diimplementasikan satu per satu
sesuai urutan keputusan owner** (item aktif ditandai `Status: SIAP implementasi`).

---

## 1. Penomoran di dalam bab

**Status**: kaidah umum + temuan sistem sudah dianalisis — **IMPLEMENTASI DITUNGGU** perintah owner.

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

### B. Temuan sistem saat ini (audit kode, 7 Okt 2026 — belum diubah)

1. **Prompt `SITASI`** hanya mensanksikan judul pola `N.M` (2 tingkat) + tabel markdown + daftar bernomor — sub-sub `3.2.1`/`2.1.1.1` dan label tanpa nomor **tidak diatur**, jadi AI menulisnya seadanya (uji E2E mayoritas benar, tapi belum dijaga konsistensinya).
2. **Export DOCX** (`backend/src/routes/projects.routes.ts` ~baris 1522): regex `^(\d+(?:\.\d+)+)\.?\s+Judul` → level = jumlah titik (dibatasi 4): `1.1`→H2, `3.2.1`→H3, `2.1.1.1`→H4. **Nomor dari AI dipakai apa adanya** — tak ada validasi kelanjutan (`1.1 → 1.3`), yatim (`3.2.1` tanpa `3.2`), maupun duplikat; kesalahan AI ikut terbawa ke DOCX + TOC.
3. **Label tanpa nomor** (`Definisi Konseptual`, `Kisi-Kisi Instrumen`, `Pengaruh X terhadap Z`, `a. Karakteristik …`) jatuh jadi **paragraf biasa** di DOCX — tak ada gaya tebal/italic khusus dan tak muncul di TOC, padahal template asli menulisnya tebal.
4. **Daftar Isi DOCX** memakai TOC `\o 1-2` (BAB + `N.M` saja) — template asli memuat sampai `2.1.1` (3 tingkat) di Daftar Isi.
5. **Caption tabel/gambar** sistem: `Tabel <bab>.<SEQ restart per bab>` via field SEQ → format `Tabel 2.1` sudah standar ✓; caption buatan AI dibuang ✓; lampiran & pustaka tanpa caption ✓.
6. **Sub-bab lampiran di DOCX** direnumber otomatis: `6.1` → `Lampiran 1`, `6.1.1` → `L1.1` ✓ ala referensi.
7. **Daftar butir** `1. 2. 3.` → Word numbering dengan restart per blok ✓ (lokal, terpisah dari hierarki sub-bab).

### C. Rencana perbaikan (belum dieksekusi — menunggu perintah)

a. Perkuat `SITASI`: izinkan eksplisit sub-sub `N.M.K` s.d. 4 tingkat + aturan label tanpa nomor; larang nomor lompat/yatim/duplikat.
b. Validasi/renumber saat simpan (jalur stream & ulang): deteksi lompat/yatim/duplikat → koreksi otomatis sebelum tersimpan.
c. Label tanpa nomor → style heading khusus di DOCX (tebal/italic, tanpa nomor, tidak ikut TOC).
d. Putuskan kedalaman Daftar Isi (`\o 1-2` vs `1-3`; template = 3 tingkat).
e. Tambah cek audit penomoran (lompat / yatim / duplikat) di `tools/audit-hasil.js`.

---

## 2. Nama/judul tabel — WAJIB ada di setiap tabel, setiap bab, judul mencerminkan isi

**Status**: temuan & rencana tercatat — **IMPLEMENTASI DITUNGGU** perintah owner (mengikuti item 1).

**Permintaan owner**: setiap tabel wajib punya nama, berlaku di **setiap bab** (termasuk Lampiran),
dan **judulnya harus mencerminkan isi tabel** — bukan sekadar mengulang judul sub-bab.

### A. Temuan sistem saat ini (audit, 7 Okt 2026 — belum diubah)

1. **Tampilan web (markdown): nol nama tabel** — proyek uji `200b68f5`: bab1 2 tabel, bab2 1, bab3 6, lampiran 7 = **16 tabel tanpa caption** di layar. Penyebab: `SITASI` melarang AI menulis caption ("penomoran dibuat otomatis oleh sistem"), dan sistem **hanya** menambah caption pada export DOCX — jadi web tidak pernah menampilkannya.
2. **Caption DOCX memakai judul sub-bab, bukan isi tabel** (`projects.routes.ts` ~1367-1381): caption = `Tabel <bab>.<SEQ>` + `judulAktif` (judul sub-bab level ≤2 terakhir, di-update hanya untuk `1.1`/`1.2`, bukan `3.2.1`). Akibat: ke-4 tabel kisi-kisi di 3.3 semua berjudul sama "Tabel 3.3 Variabel dan Definisi Operasional"; tabel di bawah sub level-3 memakai judul induknya — **tidak mencerminkan isi tabel**.
3. **Lampiran: caption sengaja dimatikan** (`if (!noBab || lampiran) return`) — 7 tabel lampiran (kuesioner, tabulasi, deskriptif, olah data) kosong nama di DOCX.
4. **Template rujukan**:53 caption `Tabel/Gambar` di seluruh dokumen, **0 di rentang lampiran** (template juga tak mencaption tabel lampiran — permintaan owner melampaui template, berlaku sebagai aturan baru).
5. Yang **sudah benar** (dipertahankan): caption di ATAS tabel, center+bold, nomor per-bab `Tabel 2.1` via field SEQ (restart per H1), caption buatan AI dibuang agar tak dobel.

### B. Rencana perbaikan (belum dieksekusi)

a. **Prompt (`SITASI` + panduan varian)**: larangan caption diubah jadi **kewajiban baris judul tabel TANPA nomor** sebelum tiap tabel, pola `Judul Tabel: <deskripsi spesifik isi>` — contoh "Judul Tabel: Kisi-Kisi Instrumen Variabel Prestasi Kerja ASN". Larang judul yang hanya menyalin judul sub-bab (harus menyebut objek/ukuran/tahun yang membedakan).
b. **Parser DOCX**: baris `Judul Tabel:` jadi sumber teks caption (gantikan `judulAktif`; `judulAktif` tetap fallback bila AI lupa); nomor tetap `Tabel <bab>.<SEQ>` — diperiksa juga level ≥3 supaya judul sub-bab salah-pakai tak terjadi.
c. **Web/studio**: tampilkan nama tabel di atas tiap tabel (opsi penomoran `Tabel 3.1 — …` mengikuti nomor bab kunci, atau tanpa nomor — ikut keputusan owner).
d. **Lampiran**: angkat pengecualian `lampiran` pada fungsi caption — penomoran pilihan: `Tabel L1.1` (mengikuti pola `L1.1` sub-bab lampiran) atau `Tabel 6.1` — **butuh keputusan owner**.
e. **Audit**: cek baru — tiap blok tabel punya baris judul sebelumnya; jumlah judul = jumlah tabel; judul ≠ judul sub-bab identik; caption DOCX muncul di semua bab.

---

## 3. (item berikutnya — diisi saat owner menyampaikan)
