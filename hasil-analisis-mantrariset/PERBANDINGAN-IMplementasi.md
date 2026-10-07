# Perbandingaan UI & Rencana Implementasi: Situs Kita vs Mantrariset.com

## 1. Gambaran Singkat

| Aspek | Mantra Riset (referensi) | Situs Kita (skripsi-palembang-saas) |
|---|---|---|
| **Desain visual** | Light mode: `rgb(241,245,249)` body; Dark mode: `rgb(11,18,32)` | Hanya light mode: `rgb(248,250,252)` body |
| **Tema** | Radiogroup "Terang/Gelap" (toggle class `dark` di `<html>`) | Tidak ada toggle tema |
| **Tombol primer** | `rgb(37,99,235)` (blue-600), radius 6px | `rgb(0,102,255)` (biru lebih terang), radius 6px |
| **Tombol secondary/pill** | bg `rgba(37,99,235,0.05)`, teks blue-600, radius 8px | bg `rgba(0,102,255,0.05)`, teks biru, radius 8px |
| **Chip/Tag** | Radius 12px, 13-14px font | Radius 12px, 14px font |
| **FAB/Icon tombol** | 48×48, radius penuh (9999px) | 36×36, radius 3.35e+07px (anomali CSS) |
| **Badge kredit** | Merah `rgb(220,38,38)` saat 0; `rgba(220,38,38,0.1)` | Kuning/Oranje, belum dicek warnanya saat 0 |
| **Empty state** | Ikon slate-300 + slate-400 teks + tombol biru | Ikon + teks + tombol biru (mirip) |
| **Sidebar** | Ada (kiri, 4 grup nav + radiogroup tema) | Tidak ada sidebar |
| **Navigasi utama** | Header sticky + sidebar + FAB | Header sticky + FAB di kanan-bawah |
| **Menu akun dropdown** | 2 item: Pengaturan, Keluar | 3 item: Profil, Ganti Password, Kunci API |
| **Input teks** | bg putih, radius 6px, placeholder slate-400 | bg `#21293B`, placeholder slate-400 |
| **Deskripsi chip** | Teks persis di dalam kotak input ("Enter untuk kirim · Shift+Enter baris baru · / untuk perintah") | Tidak ada deskripsi chip sama |
| **Dropdown `/`** | Saa: filter prefiks → isi input `<cmd> `; tutup otomatis karena spasi | Belum ada fitur slash-command |
| **10 slash-command** | `/judul`, `/skripsi`, `/tesis`, `/disertasi`, `/sinta`, `/scopus`, `/parafrase`, `/ppt`, `/cari artikel`, `/kelayakan judul` | Belum ada |
| **Panel Riwayat** | Ada (di asisten, 320px kanan atas, "Belum ada percakapan tersimpan") | Belum ada |
| **Kartu Referensi Terverifikasi** | DIHAPUS; sitasi → modal "Bukti Kutipan" | Masih ada (belum dihapus) |
| **Footer/Nav** | Logo + 4 grup + Radiogroup + Avatar + Keluar | Logo + menu horizontal + FAB |

## 2. Perbedaan Teknis per Halaman

### 2.1 Header & Navigasi

**Mantra Riset:**
- Header sticky putih, logo kiri (134×32), badge "0 kredit" kanan atas (88×28, merah saat 0)
- Sidebar kiri: 4 grup nav (PENELITIAN, UJI & REVISI, PENDAMPINGAN, AKUN) + radiogroup tema
- Footer: avatar "shairan" + "Keluar"
- Navigasi: Header + Sidebar + FAB kanan-bawah (48×48 blue, green WA, tutup WA 20×20)

**Situs Kita:**
- Header sticky light gray `rgb(248,250,252)`, logo kiri (171×24), menu horizontal (Proyek Baru, Tambah Kredit, Plugin Word, Grup WA)
- Tidak ada sidebar, tidak ada radiogroup tema
- FAB kanan-bawah 36×36 blue, anomali radius `3.35544e+07px` (CSS bug)
- Menu akun dropdown: 3 item (Profil, Ganti Password, Kunci API)

### 2.2 Dashboard Utama

**Mantra Riset:**
- H1 "Ruang kerja Mantra Riset" + sub
- Input chat "Tanya AI Mantra Riset, atau ketik / untuk mulai membuat proyek…" (655×28)
- Banner "Baru di Mantra Riset?" + tombol "Tonton Tutorial"
- Card "Mulai penelitian pertamamu" + grid 2 kolom x 6 kartu (Skripsi/Tesis/DS/Artikel Sinta/DS/UT)

**Situs Kita:**
- H1 "SkripsiPalembang - AI Riset Assistant" + sub
- Input "Tanya AI Skripsi Palembang, atau ketik / untuk mulai membuat proyek…"
- Banner "Sudah punya akun? Masuk" + tombol login/register
- Empty state card "Belum ada proyek. Ayo buat proyek skripsi pertamamu."

### 2.3 Proyek & Pembuatan

**Mantra Riset:**
- Halaman "Proyek Penelitian": grid 8 kartu (383×68 each) + empty state
- "Buat Proyek": form lengkap (judul, upload logo, jenis 4 pill, metode 10 pill, tahap pengerjaan, identitas, toggle struktur bab kustom, data awal opsional, pengaturan sitasi, unggah artikel, tombol "Lanjut Generate Skripsi" 761×48)

**Situs Kita:**
- Halaman "Proyek Penelitian": grid 2 kartu hanya (+ Buat Proyek)
- "Buat Proyek": form sederhana (judul, select jenis, select metode, input identitas minimal, tombol "Baca Skripsi → Buka Studio", tombol "Buat Proyek")

### 2.4 Brainstorming & Kelayakan Judul

**Mantra Riset:**
- 3 langkah: topik, jenis & metode, variabel
- "Gratis 3× cari judul — sisa 3×"
- Tombol "Buat 10 Judul" (blue-600)
- Empty state: hasil akan muncul setelah generate

**Situs Kita:**
- 3 langkah mirip: topik, jenis & metode, variabel
- Select metode berbeda (Kualitatif/Kuantitatif dll)
- Tombol "Buat 10 Judul →" (lab color blue)
- Counter "0/300 huruf" di kelayakan judul

### 2.5 Cari Artikel & Referensi

**Mantra Riset:**
- Input + 3 filter (tahun, bahasa, indeks) + tombol "DOI"
- Panel kanan "Daftar Referensi" (empty state)
- Filter: SINTA/Scopus/Acak

**Situs Kita:**
- Input + 3 filter (tahun, bahasa, indeks) + tombol "DOI"
- Panel kanan kosong (belum ada referensi)
- Empty state: "Hanya artikel ber-DOI yang ditampilkan — semuanya bisa disitasi"

### 2.5 Generate PPT

**Mantra Riset:**
- Jenis: Seminar Proposal (10–15 slide) / Seminar Hasil (12–18 slide)
- Tema warna: 8 kartu swatch (Sempro Pro, Navy Emas, dll)
- Sumber: "Unggah file" / "Dari Studio Skripsi"
- Biaya: 8 kredit
- Tombol "Generate PPT" (272×40)

**Situs Kita:**
- Jenis: Seminar Proposal / Seminar Hasil (mirip)
- Tema warna: label "Tema warna (Demo Mode)" + daftar warna (Sempro Pro, dll) tetapi dalam mode demo
- Sumber: textarea contoh + tombol "Unduh .pptx (8 kredit)" + "Generate PPT"
- Perbedaan: situs kita masih mode demo/limited

### 2.6 Simulasi Sidang

**Mantra Riset:**
- 7 langkah bernomor: nama panggilan, pilih karya, jenis sidang, bahasa, pilih dosen, gaya dosen, durasi
- Durasi: 15 menit (15 kredit) / 30 menit (25 kredit)
- 4 pilihan dosen dengan avatar + label suara

**Situs Kita:**
- 5 langkah: nama panggilan, ringkasan proposal, jenis sidang, pilih dosen, mulai simulasi
- Durasi: 15 menit · 15 kredit / 30 menit · 25 kredit
- 3 pilihan dosen dengan nama & spesialisasi

### 2.7 Cek Plagiasi

**Mantra Riset:**
- Banner: "Cek Plagiasi hanya untuk paket berbayar aktif."
- 2 checkbox: Kecualikan Daftar Pustaka, Kecualikan Kutipan
- Dropzone .docx/.doc/.pdf maks 25 MB
- Proses ±10–30 menit, 15 kredit per cek

**Situs Kita:**
- Judul: "Skripsi Palembang × Mulfu"
- 2 input file (keduanya 16×16)
- Textarea "Paste bab skripsi atau paragraf di sini..."
- Tombol "Cek Sekarang" (163×42, lab color blue)
- Tidak ada info kredit/biaya di UI

### 2.8 Lab Revisi & Rapihkan Skripsi

**Mantra Riset:**
- Lab Revisi: 2 tab (Proyek Web, File dari Luar) + empty state
- Rapihkan Skripsi: tombol "Pilih berkas .docx" (blue-600) + teks instruksi

**Situs Kita:**
- Lab Revisi: 2 tab (Lihat kredit, Proyek Web + File dari Luar) + textarea instruksi + tombol "Revisi Sekarang" (1 kredit)
- Rapihkan Skripsi: tombol "Pilih berkas .docx" (blue-700) + teks "Word (.docx) dari mana pun — maks 8 MB. Berkasnya tidak kami simpan."

### 2.9 Parafrase & AI Writer

**Mantra Riset:**
- 2 tab: "Proyek Saya" / "Tempel Teks"
- Pilihan: Bahasa (Indonesia/English), Gaya (Formal/Semi-formal) — pill radius 8px
- Textarea "Tempel teks (maks 10.000 karakter)…" + counter
- Tombol "Parafrase (1 kredit)" (full-width)

**Situs Kita:**
- AI Writer: "+ Dokumen Baru" (blue-500) + input judul + textarea "Tulis atau tempel teks. Blok kalimat → Tambah Sitasi." (520×394)
- Tombol "Lanjutkan dengan AI (1 kredit)" (blue-500)
- Tambah Sitasi + Simpan tombol

### 2.10 Pengaturan

**Mantra Riset:**
- Profil: avatar + unggah foto + input Nama/Email/Universitas/Jurusan/Jenjang + "Simpan Perubahan"
- Ganti Password: 3 input + tombol mata toggle + "Simpan Password"
- Tampilan Hasil Generate: 2 pilihan (Per sub-bab / Kata per kata)
- Akun: "Keluar dari akun" + "Hapus Akun Saya" (red-600)
- Kunci API: input nama kunci + "Buat kunci"; info "Belum ada kunci aktif"

**Situs Kita:**
- Profil: input Email (readonly), Nama, Universitas, Jurusan, Jenjang (select S1/S2/S3) + "Simpan Perubahan"
- Ganti Password: 3 input + tombol mata toggle + "Simpan Password"
- Tidak ada sub-menu "Tampilan Hasil Generate" atau "Kunci API" (belum ada)
- Tidak ada opsi "Hapus Akun"

### 2.11 Affiliate

**Mantra Riset:**
- H1 "Program Affiliate" + sub "10% per transaksi referral"
- Modal: ikon gift + "Berlangganan dulu, yuk!" + tombol "Lihat Paket Langganan"

**Situs Kita:**
- H1 "Program Affiliate" + sub mirip
- Tidak ada modal lihat paket (hanya teks deskriptif)

### 2.12 Tutorial

**Mantra Riset:**
- Grid 2 kolom kartu video dengan judul: TUTORIAN MANTRA RISET, CARA MENCARI JUDUL, dll
- Setiap kartu: badge "Tonton di YouTube"

**Situs Kita:**
- H1 "Video Tutorial" + sub
- Tidak ada grid kartu video (belum ada)

### 2.13 Karil UT

**Mantra Riset:**
- H1 "Karil UT" + sub "Karya Ilmiah (artikel ilmiah) Universitas Terbuka · MKWI4560"
- Empty state + tombol "Buat Karil"

**Situs Kita:**
- H1 "Karil UT" + sub mirip
- Tombol "Buat Karil (15 kredit)" (blue-500)
- Form: textarea judul + tombol "Buat Karil"

### 2.13 Dark Mode

**Mantra Riset:**
- Toggle di sidebar (radio Gelap/Terang)
- Body `rgb(11,18,32)`, class `dark` di `<html>`
- FAB biru tetap, sidebar gelap

**Situs Kita:**
- Tidak ada fitur toggle tema (hanya light mode)
- Body `rgb(248,250,252)`

## 3. Rencana Implementasi (belum diimplementasi)

### 3.1 Desain Visual & Token

1. **Warna primer**: Sesuaikan `rgb(0,102,255)` → `rgb(37,99,235)` (mirip mantrariset) atau tetap paket kami
2. **Radius tombol**: Radius 6px utama, 8px pill, FAB radius penuh
3. **Badge kredit**: Saat 0 kredit, tampil merah `rgb(220,38,38)` dengan background `rgba(220,38,38,0.1)`
4. **Tema gelap**: Tambah radiogroup di sidebar, toggle class `dark` di `<html>`, ubah warna body

### 3.2 Fitur Dasar yang Ditujukan

1. **Sidebar navigasi**: Tambah sidebar kiri dengan 4 grup navigasi (seperti mantrariset)
2. **Radiogroup tema**: Tambah opsi Terang/Gelap di sidebar
3. **10 slash-command**: Implementasikan `/judul`, `/skripsi`, `/tesis`, `/disertasi`, `/sinta`, `/scopus`, `/parafrase`, `/ppt`, `/cari artikel`, `/kelayakan judul`
   - Chip di dalam input chat
   - Dropdown `/` saat mengetik (filter prefiks)
   - Tertutup otomatis ketika input mengandung spasi
   - Chip = tombol isi input (tidak navigasi)
4. **Panel Riwayat percakapan**: Tambah panel di kanan atas halaman asisten
   - Header "Riwayat percakapan"
   - Empty state: "Belum ada percakapan tersimpan..."
   - Tombol tutup ×
5. **Hapus kartu Referensi Terverifikasi**: Hapus elemen kartu dari DOM; ganti dengan modal "Bukti Kutipan" saat klik sitasi
6. **Modal sitasi → Bukti Kutipan**: Saat klik sitasi, tampil modal fixed inset-0 z-50 bg-black/50 dengan:
   - Header "Bukti Kutipan"
   - Penulis (Tahun)
   - Judul. *Jurnal*
   - amber-note bila tanpa DOI/tautan + link Google Scholar
   - Tombol "Buka di tab Pustaka"

### 3.3 Perbaikan Layout & Komponen

1. **Header navigasi**: Susun header horizontal seperti situs kita tapi tambahkan badge kredit kanan atas
2. **FAB**: Perbaiki radius dari anomali `3.35544e+07px` menjadi 9999px atau radius penuh
3. **Empty state**: Sesuaikan desain empty state dengan ikon + teks + tombol biru seperti mantrariset
4. **Chip deskripsi**: Tambahkan hint teks di dalam kotak input chat: "Enter untuk kirim · Shift+Enter baris baru · / untuk perintah"
5. **Dropdown `/`**: Implementasikan filter prefiks dan tutup otomatis
6. **Desain konsisten**: Pastikan warna, radius, font konsisten antar halaman

### 3.4 Backend & Fungsionalitas

1. **API endpoints**: Buat endpoint untuk slash-command processing
2. **AI fallback**: Implementasikan rantai fallback 8 model (seperti mantrariset) untuk menghasilkan 10 judul
3. **Sistem kredit**: Integrasikan potongan kredit per operasi (generate, plagiasi, revisi, dll)
4. **Riwayat cakap**: Simpan riwayat percakapan di localStorage atau backend
5. **Sistem paket**: Implementasikan 2 paket (Mahasiswa/Profesor) dengan fitur lengkap

### 3.5 Prioritas Implementasi

1. **P1 (Critical)**: Desain token visual (warna, radius), FAB radius, header badge kredit
2. **P2 (High)**: Sidebar navigasi + radiogroup tema, 10 slash-command + dropdown `/`, panel riwayat
3. **P3 (Medium)**: Modal bukbu kutipan, hapus kartu referensi terverifikasi, desain empty state
4. **P4 (Low)**: Fitur affilate mendetail, tutorial video grid, Karil UT lengkap, sistem paket lengkap

## 4. Catatan Implementasi

- **Jangan langsung implementasikan**: Dokumen ini hanya untuk merancang dan merangkum perbedaan
- **Verifikasi desain**: Lakukan preview di lebar <1024px dan >1024px
- **Penguji kredit**: Pastikan kuota kredit berjalan sebelum mengimplementasi fitur generate AI
- **Testing lintas browser**: Test di Chrome, Firefox, Safari
- **Responsive**: Pastikan semua halaman bekerja di mobile (lebar <768px)

---

*Catatan: Data ini dikumpulkan pada 7 Oktober 2026. Sesi login mantrariset telah kadaluarsa dan perlu login ulang untuk analisis selanjutnya. Data DOM disimpan di `hasil-analisis-mantrariset/screenshot-tombol/01-32*.png` dan laporan terstruktur.*