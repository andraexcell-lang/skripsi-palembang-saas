# Analisis Prompt/Skill Agen & Struktur Bab Baku — mantrariset.com

Tanggal cek: 6 Okt 2026 · Akun: dedibusro5@gmail.com · Metode: inspeksi DOM, 31 chunk JS, HTML halaman, network capture (tab referensi)

## 1. PROMPT — apakah mereka punya prompt khusus untuk agennya?

### Temuan: prompt ada, tapi 100% di sisi server (tidak terekspos ke klien)

| Bukti | Hasil |
|---|---|
| Grep 31 chunk JS (`_next/static/chunks/*.js`) atas `Anda adalah`, `kamu adalah`, `systemPrompt`, `prompt khusus`, `berperan sebagai`, `instruksi khusus` | **0 hit** prompt sistem |
| Satu-satunya kata `prompt` di JS | `window.prompt(...)` — dialog "Tulis ulang {bab} — apa yang perlu diperbaiki?" (input arahan user, bukan prompt AI) |
| HTML studio (termasuk payload RSC) atas `prompt/systemPrompt/Anda adalah` | hanya teks konten abstrak referensi ("prompt optimization") — **bukan prompt sistem** |
| Alur generate | Next.js **server action** (header `next-action: 00c96369…`, POST ke URL halaman) → prompt disusun di server compile-time, tidak bisa dibaca dari frontend |

### Bukti bahwa prompt terstruktur & dipilih otomatis (dari materi resmi mereka)

Landing page `mantrariset.com` → bagian "Cara Kerja":

> "**Kamu fokus pada ide. Sistem yang mengurus prompt, referensi, dan format.**"
> 01 Isi data sederhana — "Cukup tulis topik dan pilih metode. **Tidak perlu paham prompt engineering.**"
> 02 **AI menyusun di balik layar** — "**Sistem memilih prompt yang tepat**, menarik referensi, dan menerapkan format kampusmu."

FAQ: "Apakah saya perlu paham prompt AI untuk memakai Mantra Riset?"

### Indikasi arsitektur prompt mereka (dari struktur data di chunk 5702)

- Tiap sub-bab punya **`key` stabil** (`latar_belakang`, `rumusan_masalah`, `landasan_teori`, `analisis_spss`, …) → konsisten dengan pola **prompt-per-key** (template server-side per jenis sub-bab).
- Node outline kustom mendukung **`judul` (≤140 char) + `arahan` (≤300 char) + `anak` (berjenjang)** → arahan user ikut dikirim ke server sebagai instruksi per blok.
- Input arahan lain: `window.prompt` tulis-ulang (1 kredit), dialog "Generate Ulang Bab" dengan arahan, "✨ Sarankan AI" (desain/metodologi), checkbox `fetch_fenomena`.

**Kesimpulan prompt:** mereka TIDAK mengekspos prompt sistemnya ke publik/klien. Yang terekspos hanya kerangkanya: key-per-sub-bab, arahan per node, dan klaim marketing "sistem memilih prompt yang tepat". Tidak ada yang bisa disalin langsung dari frontend — dan tidak perlu (prompt kita sudah dibuat sendiri).

## 2. SKILL — apakah agen mereka punya skill khusus?

Ya. Halaman **AI Mantra Riset** (`/dashboard/member/asisten`) punya **10 slash-command** (ditekan `/` di chat):

| Command | Fungsi (teks persis mereka) |
|---|---|
| `/judul` | Buatkan 10 judul dari tema & metode |
| `/skripsi` | Mulai skripsi dari judul yang sudah kamu punya |
| `/tesis` | Mulai tesis dari judul yang sudah kamu punya |
| `/disertasi` | Mulai disertasi dari judul yang sudah kamu punya |
| `/sinta` | Mulai artikel jurnal Sinta dari judulmu |
| `/scopus` | Mulai artikel jurnal Scopus (Bahasa Inggris) |
| `/parafrase` | Parafrase teks langsung di chat (1 kredit) |
| `/ppt` | Unggah skripsi/proposal → jadi PPT, diunduh dari chat |
| `/cari artikel` | Cari artikel jurnal: tahun, indeks, asal |
| `/kelayakan judul` | Nilai kelayakan judulmu: skor, kekuatan, celah — gratis |

Deskripsi asisten: "Saya bisa menyusun judul, lalu memandu sampai proyeknya siap ditulis." · "Enter untuk kirim · Shift+Enter baris baru · **/ untuk perintah**"

**Kita (paritas):** `/dashboard/asisten` QUICK baru **4** (`/judul`, `/skripsi`, `/parafrase`, `/kelayakan judul`); command palette `/` di search bar punya 12 (`/novelty`, `/artikel-sinta`, `/artikel-scopus`, `/ppt`, `/sidang`, `/plagiasi`, `/olah-data`, `/billing` tambahan). **Selisih:** QUICK asisten tidak memuat `/tesis`, `/disertasi`, `/sinta`, `/scopus`, `/ppt`, `/cari artikel`.

## 3. STRUKTUR BAB BAKU — apakah mereka punya struktur standar?

Ya — **sistem struktur baku lengkap**, terekspos penuh di chunk `5702-d00db968a5b82f86.js`:

### 3a. Penegasan di UI

- Form proyek baru → "Struktur bab kustom (OPSIONAL) — Atur bab, subbab, dan sub-subbab secara manual atau dengan bantuan AI. **Jika tidak diaktifkan, sistem menggunakan struktur standar Bab I–V.**"
- Dialog konfirmasi sebelum generate menampilkan ringkasan "**Struktur bab: Baku**".

### 3b. Kamus varian per metode (`d`)

| Kunci | Varian |
|---|---|
| `skripsi_kuantitatif` | Bab I (7 sub) Pendahuluan · Bab II Tinjauan Pustaka (6) · Bab III Metodologi (6) · Bab IV Hasil & Pembahasan (4) · Bab V Penutup (2) · Lampiran (2) |
| `skripsi_kualitatif` | Bab II "Kajian Pustaka" (4), Bab III: Subjek & Informan + Uji Keabsahan, Bab IV: Deskripsi Informan/Penyajian/Triangulasi/Temuan (7), Lampiran: Kisi-Kisi + **Pedoman Wawancara** |
| `skripsi_ptk` | Siklus pra/I/II, Setting & Subjek, Instrumen, Indikator Keberhasilan; Lampiran: Lembar Observasi |
| `skripsi_pustaka` | Tanpa identifikasi masalah; bab ringkas + `slr_*` |
| `mixed` | = kuantitatif + Pedoman Wawancara |
| `hukum_normatif` | 9 sub Bab I (Keaslian, Kerangka Konseptual…), Asas Hukum, Bahan Hukum, dll. |
| `hukum_empiris` | varian hukum lain |
| `rnd` | Spesifikasi Produk, Model Pengembangan, Validasi Produk; Lampiran: Lembar Validasi Ahli |
| `sekunder` / `eksakta` | terdeteksi di pemetaan metode |
| `artikel_sinta_kuant` / `artikel_sinta_kualit` | struktur IMRAD 6 bab (`o`) / 5 (`p` SLR) |

Seleksi: fungsi `S(a,e,n,s,k)` → deteksi metode dari string (`/mixed|kombinasi|campur/`, `/hukum/`, `/sekunder/`, …); custom outline (bila diisi) menimpa baku dengan **validasi** (nomor 1–10, dedup key/label, `judul` ≤140, `arahan` ≤300, `anak` berjenjang).

### 3c. Overlay conditional (`f` untuk TESIS, `f+y` untuk DISERTASI)

Fungsi `P(a,e,n)`: hanya jenis **tesis/disertasi** yang mendapat overlay:

**`f` (tesis):**
- bab1 **Kebaruan Penelitian** → sebelum Sistematika Penulisan
- bab3 **Etika Penelitian** → sebelum Jadwal Penelitian
- bab4 **Temuan Penelitian** → sebelum Pembahasan (`skipKualitatif`)
- bab4 **Implikasi Teoretis** → setelah Pembahasan (`skipKualitatif`)
- bab5 **Agenda Penelitian Lanjutan** → setelah Saran

**`y` (disertasi saja, ditambah):** State of the Art & Research Gap (bab1), Kerangka Teori Besar & Critical Review (bab2), Proposisi Penelitian (`onlyKualitatif`), Landasan Filosofis — Ontologi/Epistemologi/Aksiologi (bab3), Kontribusi terhadap Ilmu (bab5).

### 3d. Verifikasi terhadap proyek uji (tesis kuantitatif)

Struktur teramati = base `skripsi_kuantitatif` + overlay `f` **persis**: Bab I 8 sub (7 + Kebaruan), Bab III 7 sub (6 + Etika), Lampiran 2 ✓.

## 4. IMPLIKASI PARITAS UNTUK KITA

| # | Selisih | Status kita | Rekomendasi |
|---|---|---|---|
| 1 | **Struktur per metode** — mereka 10+ varian; kita **1** (`OUTLINE` tetap kuantitatif) | `OUTLINE` di `projects.routes.ts` baris 19–26 | Tambah kamus varian (kualitatif, PTK, pustaka, mixed, hukum, R&D) → pilih per `p.metode`; **prioritas tinggi** (user kualitatif dapat struktur kuantitatif) |
| 2 | Overlay tesis bab4/5 (Temuan, Implikasi Teoretis, Agenda Penelitian) | Bab1/Bab3 overlay sudah ada (1.7, 3.6 ✓), bab4/5 belum | Tambah 3 sub overlay untuk tesis |
| 3 | Disertasi overlay (`y`) | tidak ada | Opsional — kalau jenis disertasi didukung |
| 4 | Custom outline terstruktur (node + arahan per node + "bantuan AI") | `custom_outline` teks bebas | Bisa ditingkatkan bertahap (prioritas rendah) |
| 5 | QUICK asisten: 4 vs 10 | `/judul /skripsi /parafrase /kelayakan judul` | Tambah `/tesis /disertasi /sinta /scopus /ppt /cari artikel` (mudah, teks persis referensi) |
| 6 | Prompt sistem | kita sudah punya prompt sendiri (server-side) | Tidak ada tindakan — referensi juga tidak mengekspos |

**Tidak ada yang bisa/boleh disalin dari prompt mereka** (tidak terekspos). Struktur bab baku mereka justru sudah 90% kita tiru — selisih nyata hanya varian per metode + overlay bab IV/V tesis.
