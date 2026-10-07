# Analisis Tombol & Halaman — mantrariset.com (paritas UI)

Tanggal: 7 Okt 2026 · Akun uji: shairancaye@gmail.com (0 kredit, Paket Free) · Metode: klik tiap tombol + screenshot + ekstraksi DOM (computed style, ukuran, warna) langsung dari produksi.
Screenshot arsip: `hasil-analisis-mantrariset/screenshot-tombol/01..32-*.png`

## 1. Design token (dari DOM)

| Token | Nilai |
|---|---|
| Background body | `rgb(241,245,249)` (slate-100) |
| Teks utama | `rgb(15,23,42)` (slate-900) |
| Teks sekunder | `rgb(71,85,105)` (slate-600) |
| Teks tersier/placeholder | `rgb(148,163,184)` (slate-400) |
| Primer (tombol/aksen) | `rgb(37,99,235)` (blue-600), teks putih, radius 6px, font 14px/600 |
| Primer hover/aktif (chip terpilih) | bg `rgba(37,99,235,0.05)`, teks `rgb(37,99,235)`, radius 8px |
| Bahaya (kredit 0, hapus) | `rgb(220,38,38)` (red-600); badge kredit: bg `rgba(220,38,38,0.1)`, teks red-600, 12px/600, radius 6px |
| Sukses (WA) | `rgb(255,255,255)` teks di bg `rgb(37,211,102)` (green-500) |
| Input | bg putih, radius 6px, border tipis, 14px/400, placeholder slate-400 |
| Card | putih, radius 6–12px, border `rgb(225,231,239)` |
| H1 | 18–24px/700 slate-900 · H2 | 14–20px/700 · H3 | 14–16px/700 |
| FAB "Buka asisten" | 48×48, bg blue-600, radius 9999px, ikon chat putih |
| Tombol WA | 48×48, bg green-500, radius 9999px |
| Dark mode | body `rgb(11,18,32)`, teks `rgb(230,237,249)`, class `dark` di `<html>` |

## 2. Chrome global (semua halaman)

### Header (sticky, putih, border bawah)
- **Logo "Mantra Riset"** (134×32, 16px/400 slate-900) → `/dashboard/member`. Ikon logo SVG buku biru.
- **Badge "0 kredit"** (88×28) → `/dashboard/member/billing`. Ikon petir + teks; merah saat saldo 0.
- **Tombol "Menu"** (32×32, ikon hamburger) → toggle sidebar.
- **Tombol "Proyek Baru"** (130×32, bg blue-600, putih, 14px/600, radius 6px, ikon `+`) → `/dashboard/member/proyek-baru`.
- **Tombol "Notifikasi"** (36×36, radius 9999px, ikon lonceng) → dropdown.
- **Tombol "Menu akun"** (102×40, avatar lingkaran "S" + nama "shairan" + chevron) → dropdown.

### Dropdown Notifikasi (02-dashboard-notifikasi.png)
- Panel 318×48+ di bawah tombol, putih, radius 12px, shadow.
- Header "Notifikasi" (14px/700), isi "Belum ada notifikasi." (slate-400, rata tengah).

### Dropdown Menu akun (03-dashboard-menu-akun.png)
- Panel 206px lebar, putih, radius 12px.
- Header nama "shairan" (14px/700).
- Item "Pengaturan" (ikon gir, → `/dashboard/member/settings`).
- Item "Keluar" (ikon logout, teks red-600).

### Sidebar (31-sidebar-terang.png; overlay kiri, lebar ~264px, putih)
- Logo besar "Mantra Riset" di atas.
- Nav: Dashboard, AI Mantra Riset.
- Grup **PENELITIAN** (label 11px slate-400): Proyek Penelitian, Brainstorming Judul, Kelayakan Judul, Temukan Novelty, Cari Artikel, Olah Data, Generate PPT, Lanjutkan Skripsi.
- Grup **UJI & REVISI**: Simulasi Sidang, Cek Plagiasi, Lab Revisi, Rapihkan Skripsi.
- Nav: Parafrase, AI Writer, Karil UT.
- Grup **PENDAMPINGAN**: Tutorial.
- Grup **AKUN**: Riwayat Kredit, Billing, Affiliate, Pengaturan.
- **Radiogroup "Tema tampilan"**: "Terang" / "Gelap" (radio pill).
- Footer: avatar + "shairan" + "Keluar".
- Item aktif: bg `rgba(37,99,235,0.05)`, teks blue-600, radius 8px.

### Floating action buttons (kanan bawah, fixed)
- **"Buka asisten"** 48×48 blue-600 → scroll/buka asisten.
- **"Chat admin via WhatsApp"** 48×48 green-500 → `https://wa.me/6282338049553?text=...`.
- **"Tutup tombol WhatsApp"** 20×20 putih → sembunyikan tombol WA.

## 3. Halaman per halaman

### 3.1 Dashboard — `/dashboard/member` (01)
- Hero: logo + H1 "Ruang kerja Mantra Riset" + sub.
- Bar: input "Tanya AI Mantra Riset, atau ketik / untuk mulai membuat proyek…" (655×28) + tombol "Buka asisten" (36×36 dark, panah atas).
- Banner "Baru di Mantra Riset?" + tombol "Tonton Tutorial" (putih, border, panah).
- Card "Mulai penelitian pertamamu" + tombol "Buat Proyek" (blue-600).
- Card "Paket Free": "0 kredit tersisa", tombol "Pilih Paket" (full-width, bg slate-100), link "Plugin Word" (blue-600) & "Grup WA" (green-500).
- Grid "Mulai buat karya" (2 kolom, 6 kartu 247×60): Skripsi/Tesis/Disertasi/Artikel Sinta/Artikel Scopus/Karil UT — tiap kartu: ikon + H3 + sub (mis. "S1 · Bab 1–5 lengkap").

### 3.2 Proyek Penelitian — `/dashboard/member/proyek` (04)
- H1 "Proyek Penelitian" + sub.
- Grid 2 kolom 8 kartu (383×68): Buat Skripsi, Buat Tesis, Buat Disertasi, Artikel Sinta, Artikel Scopus, Ubah Skripsi → Artikel, Tuton UT, Karil UT.
- Empty state: "Belum ada proyek. Pilih salah satu di atas untuk mulai."

### 3.3 Buat Proyek — `/dashboard/member/proyek-baru` (05)
- H1 "Buat Proyek Skripsi" (jenis mengikuti `?jenis=`).
- Link "Belum punya judul?" → brainstorming.
- Textarea judul (725×80).
- Upload logo kampus (drag area, PNG/JPG 2 MB).
- **Jenis penelitian** (4 pill 351×42): Skripsi (S1) / Tesis (S2) / Disertasi (S3) / Ubah Skripsi → Artikel. Tesis/Disertasi terkunci paket Profesor.
- **Metode** (10 pill 351×40–57): Kualitatif, Kuantitatif, Kuantitatif—Data Sekunder, Studi Pustaka, PTK, R&D, Mixed Method, Hukum Normatif, Hukum Empiris, Eksperimen/Rekayasa.
- **Tahap pengerjaan** (2 pill): Proposal (Bab I–III) / Skripsi Penuh (Bab I–V).
- **Identitas**: Nama lengkap, NIM, Universitas, Program studi, Fakultas (input 347/226×44).
- Toggle "Struktur bab kustom" (44×24 switch).
- **Data awal** (opsional): textarea + upload file (PDF/DOCX 10 MB) + checkbox "Cari data di internet".
- **Pengaturan sitasi**: select tahun, asal referensi, gaya sitasi (APA 7th/Harvard/IEEE/Vancouver/MLA/Chicago/Fullnote), bahasa penulisan; pill sumber: Umum/Terindeks Sinta/Terindeks Scopus.
- **Unggah artikel/buku** (opsional): textarea + pilih file (10 MB).
- Tombol utama: "Lanjut Generate Skripsi" (761×48, blue-600, ikon sparkle).

### 3.4 Brainstorming — `/dashboard/member/brainstorming` (06)
- H1 "Brainstorming Judul".
- Langkah 1 "Topik penelitian": textarea topik, input bidang ilmu, input lokasi (opsional).
- Langkah 2 "Jenis dan metode": 6 pill jenis karya (Skripsi/Tesis/Disertasi/Artikel Sinta/Artikel Scopus/Review Literatur SLR) + 11 pill metode + "Belum tahu".
- Langkah 3 "Pengaturan variabel": 1/2/3/4 variabel; opsional Mediasi/Moderasi/Kontrol.
- Info: "Gratis 3× cari judul — sisa 3×".
- Tombol "Buat 10 Judul" (blue-600).
- Area hasil (kosong: "Hasil judul akan muncul di sini setelah kamu generate.").

### 3.5 Kelayakan Judul — `/dashboard/member/kelayakan-judul` (07)
- H1 + sub "Gratis, tanpa kredit."
- Textarea judul (724×90) + counter "0/300 huruf".
- Tombol "Cek kelayakan" (162×44, blue-600, ikon sparkle).

### 3.6 Temukan Novelty — `/dashboard/member/novelty` (08)
- H1 + sub.
- Input topik (602×38) + tombol "Cari celah" (132×38, blue-600, ikon search).

### 3.7 Cari Artikel — `/dashboard/member/citation` (09)
- H1 "Cari Artikel" + sub "Jurnal ber-DOI · saring tahun, bahasa, SINTA/Scopus · gratis, tanpa kredit".
- Input "Topik atau judul artikel…" (692×40) + tombol "Cari" (48×40).
- 3 select filter: tahun, bahasa, indeks (masing 245×36).
- Tombol "DOI" (61×28) toggle.
- Panel kanan "Daftar Referensi 0" dengan tombol "DOI" — empty state.

### 3.8 Olah Data — `/dashboard/member/olah-data` (10)
- H1 + sub.
- Grid 2 kolom 6 kartu (375×232–278): Transkripsi Audio/Video (1 kredit/10 menit), Olah Data SPSS (3 kredit), Olah Data SmartPLS (5 kredit), Analisis Kualitatif (1 kredit/3 informan), Analisis Dokumen (1 kredit/3 segmen), Analisis Visual Video (~4 kredit). Tiap kartu: ikon, judul, tag KUALITATIF/KUANTITATIF, deskripsi, harga.

### 3.9 Generate PPT — `/dashboard/member/ppt` (11)
- H1 + sub.
- **Jenis presentasi** (2 kartu 353×109): Seminar Proposal (10–15 slide) / Seminar Hasil (12–18 slide).
- **Tema warna** (8 kartu 355×50 dengan swatch 2 lingkaran): Sempro Pro, Navy Emas, Biru Pro, Teal Modern, Hijau Emerald, Ungu Royal, Oranye Hangat, Maroon.
- **Sumber materi**: tombol "Unggah file" (blue-600) / "Dari Studio Skripsi" (outline); dropzone PDF/DOCX 10 MB.
- Info hasil: "PowerPoint (.pptx)", biaya 8 kredit.
- Tombol "Generate PPT" (272×40, blue-600).
- **Riwayat PPT**: empty state.

### 3.10 Lanjutkan Skripsi — `/dashboard/member/custom` (12)
- H1 "Lanjutkan Skripsi" + info "Perubahan akan disimpan otomatis di browser ini."
- Input judul (709×44).
- Jenis (3 pill): Skripsi/Tesis/Disertasi; Metode (10 pill) sama seperti proyek-baru.
- Identitas mahasiswa (5 input).
- **Skripsi yang Sedang Berjalan**: upload file (.pdf/.docx) + tombol "Baca skripsi → tandai bab yang selesai".
- Pengaturan sitasi (4 select + 3 pill sumber).
- **Susunan BAB**: checkbox halaman (Cover, Kata Pengantar, Lembar Persetujuan, Lembar Pengesahan, Lembar Keaslian, Abstrak, Abstract, Daftar Isi, Daftar Gambar, Daftar Tabel) + 5 bab collapsible dengan sub-bab (input nama bab/sub-bab, tombol tambah/hapus), badge "DITULIS DI SINI" + jumlah sub-bab; "Tambah Bab (mis. Bab 6/7)".
- Halaman Akhir: Daftar Pustaka (wajib), Lampiran.
- Tombol "Buat Proyek & Buka Studio" (full-width blue-600).

### 3.11 Simulasi Sidang — `/dashboard/member/sidang` (13)
- H1 + sub.
- 7 langkah bernomor: (1) Nama panggilan (input 725×44), (2) Pilih karya: "Dari proyek Studio" / "Unggah berkas" + file input, (3) Jenis sidang: Seminar Proposal / Seminar Hasil, (4) Bahasa: Indonesia / English, (5) Pilih dosen penguji (4 kartu 357×82 dengan avatar + label suara), (6) Gaya penguji: Ramah/Kritis/Killer, (7) Durasi: 15 menit (15 kredit) / 30 menit (25 kredit).
- Tombol "Mulai Simulasi Sidang" (725×48, blue-600, ikon mic).

### 3.12 Cek Plagiasi — `/dashboard/member/turnitin` (14)
- H1 + sub "Didukung mesin Mulfu".
- Banner biru: "Cek Plagiasi hanya untuk paket berbayar aktif."
- **Unggah Dokumen**: 2 checkbox (Kecualikan Daftar Pustaka, Kecualikan Kutipan), dropzone (.docx/.doc/.pdf maks 25 MB), info "Proses ±10–30 menit · 15 kredit per cek."
- Tombol "Cek Sekarang" (148×36, blue-600).
- **Riwayat Cek Plagiasi** + tombol "Cek Status" (119×32).

### 3.13 Lab Revisi — `/dashboard/member/revisi` (15)
- H1 + sub.
- 2 tab pill: "Proyek Web" / "File dari Luar".
- Empty state: ikon lab + "Belum ada proyek yang bisa direvisi…" + tombol "Ke Studio" (blue-600).

### 3.14 Rapihkan Skripsi — `/dashboard/member/rapihkan` (16)
- H1 + sub "margin, spasi, huruf, penomoran bab, daftar isi, nomor halaman".
- Bar: tombol "Pilih berkas .docx" (blue-600) + teks "Word (.docx) dari mana pun — maks 8 MB. Berkasnya tidak kami simpan."

### 3.15 Parafrase — `/dashboard/member/parafrase` (17)
- H1 "Parafrase Akademik" + sub.
- 2 tab: "Proyek Saya" / "Tempel Teks" (aktif).
- Pilihan: Bahasa (Indonesia/English), Gaya (Formal/Semi-formal) — pill radius 8px.
- Textarea "Tempel teks (maks 10.000 karakter)…" (725×222) + counter.
- Tombol "Parafrase (1 kredit)" (full-width 725×44, blue-600).
- Panel "Hasil" (empty state).

### 3.16 Penulisan AI (AI Writer) — `/dashboard/member/penulisan` (18)
- H1 "Penulisan AI" + tombol "Dokumen Baru" (blue-600, kanan atas).
- Empty state: ikon dokumen + teks "Ruang menulis bebas dengan sitasi otomatis…" + tombol "Buat Dokumen Pertama".

### 3.17 Karil UT — `/dashboard/member/karil` (19)
- H1 "Karil UT" + sub "Karya Ilmiah (artikel ilmiah) Universitas Terbuka · MKWI4560".
- Empty state + tombol "Buat Karil" → `/dashboard/member/karil/baru`.
- Card "Mengikuti Panduan Karil UT (MKWI4560)": tabel Sistematika, Format, Panjang, Abstrak, Penulis, Rujukan + catatan kelulusan.

### 3.18 Video Tutorial — `/dashboard/member/tutorial` (20)
- H1 + sub.
- Grid 2 kolom kartu video (thumbnail + judul): TUTORIAN MANTRA RISET, CARA MENCARI JUDUL, TUTORIAL MENCARI ARTIKEL, TUTORIAL PENGERJAAN KUANTITATIF, TUTORIAL ARTIKEL SINTA DAN SCOPUS, TUTORIAL MENAMBAH DAN MENCARI SITASI. Tiap kartu: badge "Tonton di YouTube".

### 3.19 Riwayat Kredit — `/dashboard/member/kredit` (21)
- H1 + sub.
- Card "SISA KREDIT": angka besar "0" (merah), "Terpakai 0 dari 0 kredit", badge "Gratis", tombol "Pilih paket berlangganan" (blue-600).
- Banner merah muda: "Akun gratis belum punya kredit…".
- Card "Rincian Aktivitas": empty state.
- Footnote: saldo resmi akun.

### 3.20 Billing — `/dashboard/member/billing` (22)
- H1 "Billing" + sub.
- Card "Paket Free aktif" (0 dari 0 kredit).
- **Pilih Paket** → 2 grup:
  - **Paket Mahasiswa** (4 kartu 369×602–641): Bulanan Rp 109.000 (100+10 bonus), 3 Bulan Rp 299.000 (300+65, badge "Populer"), Semester Rp 599.000 (600+150), Tahunan Rp 999.000 (1200+300). Tiap kartu: daftar fitur dengan checklist (skripsi lengkap, unduh Word & PPT, parafrase, sitasi, Lab Revisi, generate pertanyaan sidang, Simulasi Sidang, Cek Turnitin, Grup WA) + tombol pilih (blue-600 untuk populer).
  - **Paket Profesor** (4 kartu 369×602): Bulanan Rp 159.000 (150+10), 3 Bulan Rp 450.000 (450+75, Populer), Semester Rp 900.000 (900+200), Tahunan Rp 1.800.000 (3000+500). Fitur tambahan: Tesis/Disertasi, cek referensi, ubah skripsi→artikel, AI Writer, Artikel Scopus/SINTA.
  - **University** (3 kartu): 20/50/100 akun, "Hubungi Tim Kami".
- Tombol "Hubungi Tim Kami" → `/kontak`.
- **Riwayat Transaksi**: empty state.
- Catatan: "Pembayaran via QRIS + scan, paket langsung aktif otomatis."

### 3.21 Affiliate — `/dashboard/member/affiliate` (23)
- H1 "Program Affiliate" + sub "10% per transaksi referral".
- Modal (23): ikon gift, "Berlangganan dulu, yuk!", tombol "Lihat Paket Langganan" (blue-600) + tombol tutup ×.

### 3.22 Pengaturan — `/dashboard/member/settings` (24)
- H1 "Pengaturan".
- **Profil**: avatar 80×80 + "Unggah foto (JPG/PNG, maks 8 MB)"; input Nama, Email (disabled, "Email tak bisa diubah"), Universitas, Jurusan, Jenjang (select S1/S2/S3); tombol "Simpan Perubahan".
- **Ganti Password**: 3 input (saat ini, baru min 8, ulangi) + tombol mata toggle + "Simpan Password".
- **Tampilan Hasil Generate**: 2 kartu pilihan — "Per sub-bab" (aktif, biru) / "Kata per kata".
- **Akun**: "Keluar dari akun" + zona merah "Hapus Akun" + "Hapus Akun Saya" (red-600).
- **Kunci API**: input nama kunci + "Buat kunci"; info keamanan.

### 3.23 AI Mantra Riset — `/dashboard/member/asisten` (25)
- Header: logo + "AI Mantra Riset" + tombol "Riwayat" (94×32, kanan atas).
- H1 "Apa yang ingin kamu kerjakan?" (24px/700) + sub.
- Input chat (683×36) placeholder "Tulis pesan, atau ketik / untuk perintah" + tombol "Kirim" (36×36).
- Hint dalam kotak: "Enter untuk kirim · Shift+Enter baris baru · / untuk perintah".
- 10 chip (332×38, radius 12px, 13px): /judul, /skripsi, /tesis, /disertasi, /sinta, /scopus, /parafrase, /ppt, /cari artikel, /kelayakan judul — tiap chip: perintah biru + deskripsi.
- **Panel Riwayat** (32): 320px, kanan atas, header "Riwayat percakapan" + tombol ×; empty state: "Belum ada percakapan tersimpan…".

### 3.24 Artikel Sinta — `/dashboard/member/artikel-sinta` (26)
- H1 "Buat Artikel Sinta" + sub.
- Empty state + tombol "Buat Artikel" → `/dashboard/member/artikel-sinta/baru`.
- Header kanan: tombol "Artikel Baru".

### 3.25 Artikel Scopus — `/dashboard/member/artikel-scopus` (27)
- H1 "Buat Artikel Scopus" + sub "berbahasa Inggris… (Q1–Q4)".
- Empty state + tombol "Buat Artikel" → `/dashboard/member/artikel-sinta/baru?scopus=1`.

### 3.26 Tuton UT — `/dashboard/member/tuton` (28)
- H1 "Tuton UT" + sub.
- 3 langkah card: Tempel lembar soal / Tulis jawaban (3 kredit per Tugas, 1 per Diskusi) / Unduh BJT.
- Info banner + link "Buat proyek skripsi di sini".
- Form: Mata kuliah (nama, kode), Identitas sampul BJT (nama, NIM, UPBJJ, masa ujian).
- Tombol "Buat & tempel soal" (blue-600).

### 3.27 Studio Skripsi — `/dashboard/member/studio` (29)
- H1 "Studio Skripsi" + sub + tombol "Proyek Baru" (kanan atas).
- Empty state + tombol "Buat Proyek".

### 3.28 Dark mode (30)
- Toggle di sidebar (radio Gelap). Body `rgb(11,18,32)`, teks `rgb(230,237,249)`, class `dark` di `<html>`. Sidebar tetap gelap, FAB biru tetap.

## 4. Catatan perilaku

- Semua tombol utama biru `rgb(37,99,235)` radius 6px; pill/opsi radius 8px; FAB radius penuh.
- Badge kredit merah saat 0; header menampilkan saldo selalu.
- Empty state konsisten: ikon besar slate-300 + teks slate-400 + tombol biru.
- Modal affiliate menutup dengan × atau klik luar.
- Tidak ada aksi yang mengurangi kredit dilakukan saat analisis (semua generate hanya dilihat UI-nya).
