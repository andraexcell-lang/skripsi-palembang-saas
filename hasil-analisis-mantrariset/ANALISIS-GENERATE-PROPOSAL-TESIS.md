# Analisis End-to-End Generate Proposal Tesis — mantrariset.com

Tanggal uji: 6 Oktober 2026 · Akun: dedibusro5@gmail.com (Paket Profesor aktif)
Proyek: `529a31d2-ad17-438a-89e9-870c13f74a29`
Judul: "Pengaruh Budaya Kerja Digital dan Work Overload terhadap Prestasi Kerja ASN melalui Motivasi Kerja di Sekretariat Daerah Kabupaten PALI"

## 1. Formulir Buat Proyek (`/dashboard/member/proyek-baru`)

Bagian halaman (berurutan):
1. Judul penelitian (textarea) + tautan "Belum punya judul? Gunakan judul yang sesuai…"
2. Logo kampus (unggah PNG/JPG maks 2 MB)
3. Jenis dan metode penelitian — 3 grup radio pill:
   - Jenis: Skripsi (S1) / **Tesis (S2)** / Disertasi (S3) + tautan "Ubah Skripsi → Artikel"
   - Metode: Kualitatif / **Kuantitatif** / Kuantitatif — Data Sekunder / Studi Pustaka / PTK / R&D / Mixed Method / Hukum Normatif / Hukum Empiris / Eksperimen
   - Tahap: **Proposal (Bab I–III)** / Skripsi Penuh (Bab I–V)
     - ⚠️ FAKTA: hanya ada "Proposal (Bab I–III)" — **tidak ada opsi "Bab I–II"**
4. Identitas mahasiswa dan kampus: Nama lengkap, NIM, Universitas, Program studi, Fakultas
5. Struktur bab kustom (OPSIONAL)
6. Data awal penelitian (OPSIONAL) + checkbox "Cari data fenomena di internet…" (default aktif)
7. Pengaturan sitasi: Tahun terbit minimum (select 2006–2026/Semua tahun), Asal referensi (all/id/en), Gaya sitasi (APA 7th/Harvard/IEEE/Vancouver/MLA/Chicago/Turabian), Bahasa tulisan (id/en)
8. Sumber referensi (multi-toggle): Umum (default aktif) / Terindeks Sinta / Terindeks Scopus
9. Unggah artikel atau buku (OPSIONAL, 0/10 sumber)

Submit: tombol **"Lanjut Generate Skripsi"** → dialog konfirmasi **"Periksa dulu sebelum generate"**
berisi ringkasan (Judul, Jenis, Metode, Tahap, Gaya sitasi, Bahasa, Asal referensi, Sumber referensi,
Struktur bab: Baku) + tombol "Ubah dulu" / **"Ya, generate"**.

## 2. Alur Generate di Studio (temuan penting)

- Langsung membuka studio; chip bab: BAB 1–3 (tahap proposal), BAB 4–5 🔒, BAB 6, Pustaka (n).
- Progress bar global `role=progressbar` + persen; streaming status "Menulis <nama sub-bab>… NN%".
- **Bab 1 jalan otomatis.** Setelah selesai, generate **menggantung di 33%** sampai user:
  1. Klik chip BAB 2 → dialog **"Bagan Kerangka Berpikir"** → pilih "Biarkan AI menyusunkan"
     atau "Gambar sendiri bagannya" (kanvas) → **Bab 2 mulai** ("Menulis Landasan Teori…").
  2. Setelah Bab 2 selesai, klik BAB 3 → dialog input metodologi: **Jumlah Populasi**
     (number, placeholder "mis. 285" + checkbox "Populasi tidak diketahui → Lemeshow"),
     **Jenis/desain penelitian** (select 21 opsi, default "✨ Sarankan AI"), **software** (SPSS/SmartPLS/…)
     → tombol "Generate Bab III Metodologi" (disabled sampai terisi) + "Lewati".
- Setelah 3/3 100%: tahap bonus **"Menulis Kisi-Kisi Penelitian"** → BAB 6 (Lampiran) ikut jadi ✓.
- **Kredit: 153 → 129 = 24 kredit = 8 kredit/bab × 3 bab** (Bab 6/lampiran & pustaka tidak dipotong
  terpisah; unduhan juga gratis).

## 3. Tata letak bab & sub-bab (hasil)

Semua bab dirender dalam **satu halaman gulir panjang** (chip = jangkar scroll, bukan tab).

| Bab | Sub-bab | Karakter | Catatan |
|---|---|---|---|
| BAB I Pendahuluan | 8 (1.1–1.8) | 33.047 | 1.1 Latar Belakang 18.698 char, 23 paragraf, 10 sitasi; 1.7 **Kebaruan Penelitian**; 1.8 Sistematika (11 poin) |
| BAB II Tinjauan Pustaka | 6 (2.1–2.6) | 55.811 | 2.1 Landasan Teori 20.503 char (sub-sub 2.1.1–2.1.3, 5 tingkat: Teori/Pengertian/Dimensi/Indikator/Faktor); 2.4 Penelitian Terdahulu = **tabel No/Nama (Tahun)/Judul/Hasil/Gap** 10 studi; 2.5 Kerangka Berpikir = **gambar bagan** + tombol "Ubah bagan"; 2.6 Hipotesis |
| BAB III Metodologi | 7 (3.1–3.7) | 41.351 | 3.1 Jenis & Desain; 3.2 Populasi & Sampel (Slovin e=5%); 3.3 Definisi Operasional = tabel 5 kolom (Variabel/Definisi Konseptual/Operasional/Dimensi/Indikator/Skala/Sumber); 3.4 Kuesioner (3.4.1.1–.4 per variabel); 3.5 Analisis (uji validitas→reliabilitas→asumsi klasik→regresi→uji t/F→R²→mediasi path); 3.6 Etika; 3.7 Jadwal = **tabel Gantt 7 bulan** |
| BAB 6 (Lampiran) | 2 | 11.954 | Lampiran 1 Kisi-Kisi; Lampiran 2 Pernyataan Kuisioner (L2.1–L2.4 per variabel, indikator 4–6 per indikator) |

Sisipan tombol **"Perkaya"** di kepala tiap sub-bab.

## 4. Daftar Pustaka

- **62 entri di UI** (61 ter ekspor ke DOCX & RIS — selisih 1 entri).
- Format APA 7: `Penulis, A. B., & Penulis, C. (Tahun). Judul. Nama Jurnal, Vol(I), hal. https://doi.org/…`
- 52 beref DOI (51 hyperlink DOI di DOCX), rentang tahun 1959–2026 (buku metodologi bebas tahun),
  ≥22 entri berbahasa Indonesia, sisanya internasional.
- Kontrol: tahun minimum 2023 ditegakkan untuk **jurnal** saja; buku teori/metodologi dibebaskan
  (tercantum di help-text: "Buku teori (Bab II) dan buku metodologi (Bab III) sengaja dibebaskan").
- Aksi: **"Unduh RIS (Mendeley/Zotero)"** — gratis, tanpa kredit.

## 5. Format ekspor DOCX (`proposal-…​.docx`, 275.444 bytes)

- Halaman sampul: `TESIS` / judul / "Diajukan untuk memenuhi satu syarat…"/ Dedi Busro / NIM. 2541070212 /
  MANAJEMEN / EKONOMI / YOGYAKARTA / 2026.
- Front matter Heading1: KATA PENGANTAR, LEMBAR PERSETUJUAN, LEMBAR PENGESAHAN, LEMBAR PERNYATAAN
  KEASLIAN, ABSTRAK, ABSTRACT, DAFTAR ISI, DAFTAR GAMBAR, DAFTAR TABEL.
  - **ABSTRAK/ABSTRACT masih placeholder**: "Abstrak dibuat setelah penelitian selesai. Lanjutkan ke
    Bab IV–V lebih dulu; abstrak lalu tergenerate otomatis."
- Hierarki gaya: Heading1 (BAB, front/back matter) → Heading2 (1.1) → Heading3 (2.1.1) → Heading4 (2.1.1.1);
  total 587 paragraf (48 Heading4, 27 H3, 23 H2, 14 H1, 96 ListParagraph).
- Dasar: **Times New Roman 12 pt**; heading berwarna biru `2E74B5`.
- Field: `TOC \h \o "1-2"`, `TOC \a "Gambar"`, `TOC \a "Tabel"` (daftar isi otomatis — perlu F9 di Word),
  3 field footer (`PAGE`), **51 hyperlink**, 4 tabel/52 baris, 54 drawing (bagan + ikon inline).
- Footer tiap halaman: `PAGE` + disclaimer **"Draft dihasilkan dengan bantuan AI — wajib diverifikasi,
  dikritisi, dan direvisi oleh penulis. Tanggung jawab akademik & orisinalitas ada pada penulis
  (Permendiknas No. 17/2010)."`
- Ekspor diakses dari tombol **"Unduh Proposal"** (tahap proposal) → `GET /api/export/download?jobId=…&exp=…&sig=…`
  (URL bertanda tangan, tanpa biaya kredit).

## 6. RIS (`daftar-pustaka-….ris`, 21.135 bytes)

61 entri · 61 `TI` · 51 `DO` · field `TY/AU/PY/TI/JO/T2/VL/IS/SP/DO/ER` — siap Zotero/Mendeley.

## 7. Implikasi paritas untuk produk kita

1. Form buat proyek: pertahankan urutan + dialog konfirmasi ringkasan ("Periksa dulu sebelum generate").
2. Alur generate berantai **berhenti menunggu interaksi** (bagan Bab II → input metodologi Bab III)
   — kalau diimplementasikan, jangan menggantung diam-diam tanpa petunjuk.
3. Struktur Bab I punya **1.7 Kebaruan Penelitian** (opsi tersendiri) — cek apakah generator kita
   menghasilkannya; Bab II pakai pola 5 tingkat untuk tiap konstruk.
4. Tabel pola tetap: penelitian terdahulu (No/Nama/Judul/Hasil/Gap), definisi operasional 7 kolom,
   jadwal Gantt bulanan.
5. Ekspor DOCX: TOC field + footer disclaimer AI + sampul TESIS + nomor halaman + heading berwarna.
6. Biaya: **8 kredit/bab** untuk tesis — bandingkan dengan skema 10/bab (skripsi) milik kita.
7. Pustaka UI 62 vs ekspor 61 (selisih 1) — bug kecil di sisi mereka, jangan ditiru.
