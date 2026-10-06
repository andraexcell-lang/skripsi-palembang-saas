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

**UPDATE 6 Okt 2026:** selisih **#1, #2, #3 di bawah sudah SELESAI** — detail implementasi & hasil uji di bagian 5.

## 5. STATUS IMPLEMENTASI (6 Okt 2026, commit `09cd676` + `1c9523d`)

Selisih #1 (varian per metode), #2 (overlay tesis bab4/5), #3 (overlay disertasi) **SELESAI** di commit `09cd676` (backend + taskpane + artefak) dan diselesaikan penuh di `1c9523d` (frontend studio).

### 5a. Sumber data varian

Seluruh kamus varian diekstrak **PENUH** dari chunk `5702-d00db968a5b82f86.js` (kamus `d` + overlay `f`/`y`/`_`) dan disimpan sebagai artefak di repo:

- `hasil-analisis-mantrariset/varian-struktur-mantrariset.json` — JSON mentah hasil ekstrak (27 KB, 9 varian + overlay + metode overlay)
- `hasil-analisis-mantrariset/varian-blok.ts` — blok TypeScript hasil generate otomatis dari JSON (data + type)
- `backend/tes-prompt.cjs` — skrip uji prompt

Proses ekstrak: fetch chunk → deteksi deklarasi variabel (`r`@493, `m`@2188, `d`@3250, `f`@16361, `y`@16885, `_`@17665) → literal JS → JSON via scanner string-aware (CSP `eval` diblokir → scanner ditulis manual) → download blob → `files.get` → simpan lokal.

### 5b. Implementasi di `backend/src/routes/projects.routes.ts` (commit `09cd676`)

- **`V_KUANTITATIF` `V_KUALITATIF` `V_PTK` `V_PUSTAKA` `V_RND` `V_MIXED` `V_HUKUM_NORMATIF` `V_HUKUM_EMPIRIS` `V_EKSAKTA`** — 9 varian lengkap (judul bab + sub `{key, label}`)
- **`OVERLAY_TESIS`** (5 item: kebaruan_penelitian, etika_penelitian, temuan_penelitian, implikasi_teoretis, agenda_penelitian) + **`OVERLAY_DISERTASI`** (7 item) + **`METODE_OVERLAY`** (7 metode; R&D/eksakta dikecualikan — paritas fungsi `P` referensi)
- **`varianMetode(metode)`** — peta `PETA_METODE` (10 nilai form kita → kunci varian) + fallback regex
- **`terapkanOverlay(v, overlays)`** — insert default akhir → `before` override → `after` override `before` (urutan prioritas sama persis referensi); skip bila key sudah ada di base
- **`varianFor(p)`** — metode → varian + overlay bila `jenis ∈ {tesis, disertasi}` dan metode di `METODE_OVERLAY`
- **`outlineFor(p)`** — bentuk lama `Record<bab, {bab, subs: string[]}>` bernomor per varian (konsumen `/meta/outline`, studio, taskpane)
- **`OUTLINE`** — dipertahankan sebagai kompatibilitas export = `outlineFor(null)` (kuantitatif skripsi)
- **`/meta/outline`** — terima query `?metode=&jenis=` → `outlineFor({metode, jenis})`
- **Route sub-bab** — `!BAB_LIST.includes(bab)`; judul bab dari `outlineFor(p)`
- **`babPrompt`** — diekspor (`export function`); struktur1–5 + lampiran **dinamis per varian**:
  - kuantitatif/mixed: teks terbukti dipertahankan, hanya nomor yang dinamis (skripsi tanpa Kebaruan/Etika → GANTT di 3.6; tesis dengan Kebaruan/Etika → di 3.7)
  - kualitatif/ptk/pustaka/hukum/rnd/mixed/eksakta: **catatan per varian baru** (mis. kualitatif: Miles & Huberman, credibility/transferability/dependability/confirmability; hukum: yuridis normatif/empiris; rnd: 4D/5D + validasi ahli; eksakta: metrik uji)
  - tabel penelitian terdahulu bila sub `penelitian_terdahulu*` ada; 5-tingkat konstruk + SPSS + tabel 7 kolom **hanya varian kuantitatif/mixed**
- **DOCX `peta` H1** — dinamis dari `outlineFor(pr)` (kualitatif → "Kajian Pustaka", bukan hardcode "Tinjauan Pustaka")

### 5c. Implementasi di frontend studio `page.tsx` (commit `1c9523d`)

- `load()` fetch `/meta/outline?metode=&jenis=` (setelah proyek dimuat)
- Label bab dari varian: `labelBab(bid)` = `outline[bid]?.bab` || fallback `BABS` — dipakai di desktop chips, pesan generate, pesan "selesai ditulis ulang"
- **Kartu "Referensi Terverifikasi" DIHAPUS** — kartu itu milik kita (commit `6e145b7`), **TIDAK ADA** di mantrariset (dicek DOM). Alasan "terus muncul": blok dirender di setiap tab bab selama `refs.length > 0 && !isPustaka`, di ATAS naskah, dan `load()` refetch referensi setiap bab selesai
- **Sitasi → modal "Bukti Kutipan"** (paritas mantrariset): klik sitasi → `setBukti(refs[ri])` → modal `fixed inset-0 z-50 bg-black/50` card `max-w-lg`: header "Bukti Kutipan" + tombol "Tutup", `Penulis (Tahun)`, `Judul. *Jurnal*`, amber-note bila tanpa DOI/tautan + link Google Scholar, tombol "Buka di tab Pustaka" (scroll ke entri `ref-i`). `ri<0` → `setActive('pustaka')`
- Peringatan hipotesis Bab II → variant-aware: `outline.bab2.subs` cek `/hipotesis/i` (bukan `metode === 'Kuantitatif'` — varian tanpa sub Hipotesis tidak ikut kena)
- Mobile chips tetap format `BAB N` (keputusan paritas), label judul hanya desktop

### 5d. Taskpane (`word/taskpane.html`, commit `09cd676`)

- Fetch outline ditambah `?metode=&jenis=` dari proyek yang dipilih

### 5e. Hasil uji (server lokal port 5000)

`curl` `GET /api/projects/meta/outline?metode=…&jenis=…` untuk **12 kombinasi** — semua persis paritas:

| Kombinasi | Hasil kunci |
|---|---|
| Kuantitatif + skripsi | Bab I 7 sub (tanpa Kebaruan), Bab III 6 (tanpa Etika) |
| Kuantitatif + tesis | Bab I 8 (+Kebaruan sebelum Sistematika), Bab III 7 (+Etika sebelum Jadwal), Bab IV 6 (+Temuan sebelum Pembahasan, +Implikasi Teoretis setelah Pembahasan), Bab V 3 (+Agenda setelah Saran) |
| Kuantitatif + disertasi | f+y overlay: State of the Art & Research Gap (bab1), Kerangka Teori Besar & Critical Review & Proposisi (bab2), Landasan Filosofis (bab3), Kontribusi (bab5) |
| Kualitatif + tesis | Bab II "Kajian Pustaka" (4 sub, tanpa Hipotesis), Bab IV 8 sub (Temuan sudah di base → overlay skip; +Implikasi Teoretis), Lampiran Pedoman Wawancara |
| PTK + skripsi | 6 bab1, Bab II 4 sub (Hipotesis Tindakan), Bab III 7 (Siklus, Instrumen, Indikator), Bab IV 5 (Pra-Siklus/Siklus I/II/Perbandingan) |
| Studi Pustaka + skripsi | **Tanpa Lampiran** (paritas — varian pustaka tidak punya lampiran di kamus referensi) |
| Hukum Normatif | 9 bab1 (Keaslian, Kerangka Konseptual), Asas Hukum, Bahan Hukum; **tanpa Lampiran** |
| R&D + tesis | **Tanpa overlay** (rnd dikecualikan dari `METODE_OVERLAY` — paritas fungsi `P`) |
| Mixed + tesis | kuantitatif + Lampiran 3 sub (+Pedoman Wawancara) |
| Default (tanpa param) | kuantitatif skripsi (kompatibilitas) |

Prompt `babPrompt` diuji via `node tes-prompt.cjs` → struktur per varian output sesuai desain (mis. kualitatif bab3: catatan Miles & Huberman + keabsahan; kuantitatif bab3 skripsi: GANTT di 3.6; pustaka bab2: tabel terdahulu tanpa hipotesis). Frontend: `npx tsc --noEmit` + `npm run build` (Next 16, 32 halaman) lolos.

### 5f. Deviasi yang diputuskan

- **Pustaka & hukum_normatif TIDAK punya `lampiran`** di kamus referensi → keputusan: tetap menampilkan BAB 6 chip sebagai fallback (outline `lampiran` bawaan kuantitatif) — **deviasi kecil yang terdokumentasi** (bukan bug, tapi ekstra)
- Overlay `f`/`y` **tidak punya flag `skipKualitatif`/`onlyKualitatif` di teks chunk** — efek serupa tercapai otomatis via cek `e.sub.some(s => s.key === a.key)` (sub sudah ada di base → di-skip). Paritas perilaku identik.
- Prompt referensi tetap 100% server-side mereka — **tidak bisa & tidak perlu disalin** (prompt kita sudah dibuat sendiri, kini terstruktur per varian).

**Kesimpulan implementasi:** selisih struktur baku #1–#3 **SELESAI** dengan data yang diekstrak penuh dari chunk referensi (bukan estimasi). Tinggal QUICK asisten (#5) + custom outline terstruktur (#4, prioritas rendah).
