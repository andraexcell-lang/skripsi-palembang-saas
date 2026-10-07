import { Router } from 'express';
import multer from 'multer';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { requireAuthOrKey } from '../middleware/apiKey';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { consumeCredits, getBalance, FEATURE_COSTS } from '../services/credits.service';
import { generateContent, generateContentStream } from '../services/ai.service';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;
// Font TTF bagan (backend/fonts) — container Linux Railway tidak punya font sistem,
// teks bagan tidak tergambar (PNG 144px tanpa label). Daftarkan sekali per proses.
let fontBaganOke = false;

const BAB_LIST = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'lampiran'];
// Biaya generate per bab: tesis 8 kredit/bab (paritas referensi), lainnya 10
// Biaya per bab: tesis 8 kredit (paritas referensi), lainnya 10. Lampiran GRATIS
// (referensi men-auto-generate Lampiran setelah Bab III tanpa memotong kredit).
export const biayaBab = (p: any, bab?: string) =>
  bab === 'lampiran' ? 0 : p?.jenis === 'tesis' ? 8 : FEATURE_COSTS.bab;

/* ===== Struktur bab baku per metode (paritas mantrariset) =====
   Data varian diekstrak dari chunk 5702-d00db968a5b82f86.js (kamus `d` +
   overlay `f`/`y`/`_`) — lihat hasil-analisis-mantrariset/varian-struktur-mantrariset.json */
type SubDef = { key: string; label: string };
type BabDef = { judul: string; subs: SubDef[] };
type Varian = Record<string, BabDef>;
type OverlayDef = { bab: string; key: string; label: string; before?: string[]; after?: string[]; skipKualitatif?: boolean; onlyKualitatif?: boolean };
const S = (key: string, label: string): SubDef => ({ key, label });

const V_KUANTITATIF: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang'), S('identifikasi_masalah', 'Identifikasi Masalah'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('batasan_masalah', 'Batasan Masalah'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Tinjauan Pustaka', subs: [S('landasan_teori', 'Landasan Teori'), S('kerangka_teori', 'Kerangka Teori'), S('hubungan_variabel', 'Hubungan Antar Variabel'), S('penelitian_terdahulu_naratif', 'Penelitian Terdahulu'), S('kerangka_berpikir', 'Kerangka Berpikir'), S('hipotesis', 'Hipotesis')] },
  bab3: { judul: 'Bab III Metodologi', subs: [S('jenis_desain_penelitian', 'Jenis & Desain Penelitian'), S('populasi_sampel', 'Populasi & Sampel'), S('definisi_operasional', 'Definisi Operasional'), S('teknik_pengumpulan', 'Teknik Pengumpulan Data'), S('analisis_spss', 'Teknik Analisis Data'), S('jadwal_penelitian', 'Jadwal Penelitian')] },
  bab4: { judul: 'Bab IV Hasil Penelitian dan Pembahasan', subs: [S('gambaran_umum', 'Gambaran Umum Objek Penelitian'), S('interpretasi_hasil', 'Hasil Penelitian'), S('pembahasan', 'Pembahasan'), S('implikasi_penelitian', 'Implikasi')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Simpulan'), S('saran', 'Saran')] },
  lampiran: { judul: 'Lampiran', subs: [S('kisi_kisi', 'Kisi-Kisi Penelitian'), S('kuisioner', 'Pernyataan Kuisioner')] },
};

const V_KUALITATIF: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang_umum_khusus', 'Latar Belakang'), S('identifikasi_masalah', 'Identifikasi Masalah'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('batasan_masalah', 'Batasan Masalah'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Kajian Pustaka', subs: [S('landasan_teori', 'Landasan Teori'), S('kerangka_teori', 'Kerangka Teori'), S('penelitian_terdahulu', 'Penelitian Terdahulu'), S('kerangka_berpikir', 'Kerangka Berpikir')] },
  bab3: { judul: 'Bab III Metodologi', subs: [S('jenis_desain_penelitian', 'Jenis & Pendekatan'), S('subjek_informan', 'Subjek & Informan'), S('teknik_pengumpulan', 'Teknik Pengumpulan Data'), S('teknik_analisis', 'Teknik Analisis Data'), S('keabsahan_data', 'Uji Keabsahan Data'), S('jadwal_penelitian', 'Jadwal Penelitian')] },
  bab4: { judul: 'Bab IV Hasil Penelitian dan Pembahasan', subs: [S('gambaran_umum', 'Gambaran Umum Lokasi Penelitian'), S('deskripsi_informan', 'Deskripsi Informan Penelitian'), S('penyajian_data', 'Penyajian Data Hasil Penelitian'), S('triangulasi_data', 'Triangulasi dan Keabsahan Temuan'), S('temuan_penelitian', 'Temuan Penelitian'), S('pembahasan', 'Pembahasan'), S('implikasi_penelitian', 'Implikasi')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Simpulan'), S('saran', 'Saran')] },
  lampiran: { judul: 'Lampiran', subs: [S('kisi_kisi', 'Kisi-Kisi Penelitian'), S('pedoman_wawancara', 'Pedoman Wawancara')] },
};

const V_PTK: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang'), S('identifikasi_masalah', 'Identifikasi Masalah'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Kajian Pustaka', subs: [S('landasan_teori', 'Landasan Teori'), S('penelitian_terdahulu', 'Penelitian Terdahulu'), S('kerangka_berpikir', 'Kerangka Berpikir'), S('hipotesis_tindakan', 'Hipotesis Tindakan')] },
  bab3: { judul: 'Bab III Metode Penelitian', subs: [S('jenis_desain_penelitian', 'Jenis & Desain Penelitian'), S('setting_subjek_penelitian', 'Setting & Subjek Penelitian'), S('prosedur_siklus', 'Prosedur Penelitian (Siklus)'), S('teknik_pengumpulan', 'Teknik Pengumpulan Data'), S('instrumen_penelitian', 'Instrumen Penelitian'), S('teknik_analisis', 'Teknik Analisis Data'), S('indikator_keberhasilan', 'Indikator Keberhasilan')] },
  bab4: { judul: 'Bab IV Hasil Penelitian dan Pembahasan', subs: [S('deskripsi_prasiklus', 'Deskripsi Kondisi Awal (Pra-Siklus)'), S('deskripsi_siklus_1', 'Deskripsi Hasil Siklus I'), S('deskripsi_siklus_2', 'Deskripsi Hasil Siklus II'), S('perbandingan_siklus', 'Perbandingan Antar-Siklus'), S('pembahasan', 'Pembahasan')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Simpulan'), S('saran', 'Saran')] },
  lampiran: { judul: 'Lampiran', subs: [S('kisi_kisi', 'Kisi-Kisi Instrumen'), S('lembar_observasi', 'Lembar Observasi Aktivitas')] },
};

const V_PUSTAKA: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('batasan_masalah', 'Batasan Masalah / Penegasan Istilah'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Kajian Pustaka', subs: [S('landasan_teori', 'Landasan Teori'), S('penelitian_terdahulu', 'Penelitian Terdahulu'), S('kerangka_berpikir', 'Kerangka Berpikir')] },
  bab3: { judul: 'Bab III Metode Penelitian', subs: [S('jenis_desain_penelitian', 'Jenis & Pendekatan Penelitian'), S('sumber_data_pustaka', 'Sumber Data (Primer & Sekunder)'), S('teknik_pengumpulan', 'Teknik Pengumpulan Data'), S('teknik_analisis', 'Teknik Analisis Data'), S('keabsahan_data', 'Uji Keabsahan Data')] },
  bab4: { judul: 'Bab IV Hasil Penelitian dan Pembahasan', subs: [S('penyajian_data', 'Penyajian Data'), S('analisis_data_pustaka', 'Analisis Data'), S('pembahasan', 'Pembahasan')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Simpulan'), S('saran', 'Saran')] },
};

const V_RND: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('spesifikasi_produk_bab1', 'Spesifikasi Produk')] },
  bab2: { judul: 'Bab II Landasan Teori', subs: [S('landasan_teori', 'Landasan Teori'), S('penelitian_terdahulu_naratif', 'Penelitian Terdahulu')] },
  bab3: { judul: 'Bab III Metodologi', subs: [S('jenis_desain_penelitian', 'Jenis Penelitian R&D'), S('model_pengembangan', 'Model Pengembangan'), S('validasi_produk', 'Validasi Produk')] },
  bab4: { judul: 'Bab IV Hasil', subs: [S('pembahasan', 'Pembahasan')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Kesimpulan'), S('saran', 'Saran')] },
  lampiran: { judul: 'Lampiran', subs: [S('kisi_kisi', 'Kisi-Kisi Instrumen'), S('lembar_validasi', 'Lembar Validasi Ahli')] },
};

const V_MIXED: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang'), S('identifikasi_masalah', 'Identifikasi Masalah'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('batasan_masalah', 'Batasan Masalah'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Tinjauan Pustaka', subs: [S('landasan_teori', 'Landasan Teori'), S('kerangka_teori', 'Kerangka Teori'), S('hubungan_variabel', 'Hubungan Antar Variabel'), S('penelitian_terdahulu_naratif', 'Penelitian Terdahulu'), S('kerangka_berpikir', 'Kerangka Berpikir'), S('hipotesis', 'Hipotesis')] },
  bab3: { judul: 'Bab III Metodologi', subs: [S('jenis_desain_penelitian', 'Jenis & Desain Penelitian'), S('populasi_sampel', 'Populasi & Sampel'), S('definisi_operasional', 'Definisi Operasional'), S('teknik_pengumpulan', 'Teknik Pengumpulan Data'), S('analisis_spss', 'Teknik Analisis Data'), S('jadwal_penelitian', 'Jadwal Penelitian')] },
  bab4: { judul: 'Bab IV Hasil Penelitian dan Pembahasan', subs: [S('gambaran_umum', 'Gambaran Umum Objek Penelitian'), S('interpretasi_hasil', 'Hasil Penelitian'), S('pembahasan', 'Pembahasan'), S('implikasi_penelitian', 'Implikasi')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Simpulan'), S('saran', 'Saran')] },
  lampiran: { judul: 'Lampiran', subs: [S('kisi_kisi', 'Kisi-Kisi Penelitian'), S('kuisioner', 'Pernyataan Kuisioner'), S('pedoman_wawancara', 'Pedoman Wawancara')] },
};

const V_HUKUM_NORMATIF: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang Masalah'), S('identifikasi_masalah', 'Identifikasi Masalah'), S('batasan_masalah', 'Batasan Masalah'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('keaslian_penelitian', 'Keaslian Penelitian'), S('kerangka_konseptual', 'Kerangka Konseptual'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Tinjauan Pustaka dan Kerangka Teori', subs: [S('tinjauan_konsep_utama', 'Tinjauan Umum Konsep Utama'), S('tinjauan_konsep_kedua', 'Tinjauan Umum Konsep Kedua'), S('tinjauan_konsep_pendukung', 'Tinjauan Umum Konsep Pendukung'), S('landasan_teori', 'Landasan Teori'), S('asas_hukum', 'Asas-Asas Hukum yang Relevan'), S('kerangka_berpikir', 'Kerangka Berpikir')] },
  bab3: { judul: 'Bab III Metode Penelitian', subs: [S('jenis_penelitian_hukum', 'Jenis dan Sifat Penelitian'), S('pendekatan_penelitian_hukum', 'Pendekatan Penelitian'), S('bahan_hukum', 'Jenis dan Sumber Bahan Hukum'), S('teknik_pengumpulan_bahan_hukum', 'Teknik Pengumpulan Bahan Hukum'), S('teknik_analisis_bahan_hukum', 'Teknik Analisis Bahan Hukum'), S('teknik_penarikan_kesimpulan', 'Teknik Penarikan Kesimpulan')] },
  bab4: { judul: 'Bab IV Hasil Penelitian dan Pembahasan', subs: [S('pengaturan_hukum', 'Pengaturan Hukum terhadap Masalah Penelitian'), S('analisis_hukum_pertama', 'Analisis Permasalahan Hukum Pertama'), S('analisis_hukum_kedua', 'Analisis Permasalahan Hukum Kedua'), S('kelemahan_pengaturan', 'Kelemahan Pengaturan Hukum'), S('konsep_pembaruan_hukum', 'Konsep Pembaruan Hukum')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Kesimpulan'), S('saran', 'Saran')] },
};

const V_HUKUM_EMPIRIS: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang Masalah'), S('identifikasi_masalah', 'Identifikasi Masalah'), S('batasan_masalah', 'Batasan Masalah'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('keaslian_penelitian', 'Keaslian Penelitian'), S('definisi_konseptual_operasional', 'Definisi Konseptual dan Operasional'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Tinjauan Pustaka dan Kerangka Teori', subs: [S('tinjauan_peraturan', 'Tinjauan Umum Peraturan yang Diteliti'), S('tinjauan_objek_penelitian', 'Tinjauan Umum Objek Penelitian'), S('landasan_teori', 'Teori Utama'), S('teori_pendukung', 'Teori Pendukung'), S('penelitian_terdahulu', 'Penelitian Terdahulu'), S('kerangka_berpikir', 'Kerangka Berpikir')] },
  bab3: { judul: 'Bab III Metode Penelitian', subs: [S('jenis_penelitian_hukum', 'Jenis dan Sifat Penelitian'), S('pendekatan_penelitian_hukum', 'Pendekatan Penelitian'), S('lokasi_waktu_penelitian', 'Lokasi dan Waktu Penelitian'), S('populasi_sampel_informan', 'Populasi, Sampel, dan Informan'), S('jenis_sumber_data', 'Jenis dan Sumber Data'), S('teknik_pengumpulan', 'Teknik Pengumpulan Data'), S('instrumen_penelitian', 'Instrumen Penelitian'), S('keabsahan_data', 'Teknik Keabsahan Data'), S('teknik_analisis', 'Teknik Pengolahan dan Analisis Data'), S('etika_penelitian', 'Etika Penelitian'), S('jadwal_penelitian', 'Jadwal Penelitian')] },
  bab4: { judul: 'Bab IV Hasil Penelitian dan Pembahasan', subs: [S('gambaran_umum', 'Gambaran Umum Lokasi Penelitian'), S('deskripsi_informan', 'Gambaran Subjek Penelitian'), S('pelaksanaan_hukum', 'Pelaksanaan Hukum di Lokasi Penelitian'), S('analisis_hukum_pertama', 'Analisis Rumusan Masalah Pertama'), S('faktor_penghambat', 'Faktor Pendukung dan Penghambat'), S('upaya_penyelesaian', 'Upaya Penyelesaian dan Strategi Perbaikan'), S('efektivitas_hukum', 'Pembahasan Efektivitas Hukum'), S('temuan_penelitian', 'Temuan Penelitian')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Kesimpulan'), S('saran', 'Saran')] },
  lampiran: { judul: 'Lampiran', subs: [S('kisi_kisi', 'Kisi-Kisi Penelitian'), S('pedoman_wawancara', 'Pedoman Wawancara')] },
};

const V_EKSAKTA: Varian = {
  bab1: { judul: 'Bab I Pendahuluan', subs: [S('latar_belakang', 'Latar Belakang'), S('identifikasi_masalah', 'Identifikasi Masalah'), S('rumusan_masalah', 'Rumusan Masalah'), S('tujuan_penelitian', 'Tujuan Penelitian'), S('manfaat_penelitian', 'Manfaat Penelitian'), S('batasan_masalah', 'Batasan Masalah'), S('sistematika_penulisan', 'Sistematika Penulisan')] },
  bab2: { judul: 'Bab II Tinjauan Pustaka', subs: [S('landasan_teori', 'Landasan Teori'), S('kerangka_teori', 'Teori & Konsep Pendukung'), S('penelitian_terdahulu_naratif', 'Penelitian Terdahulu'), S('kerangka_berpikir', 'Kerangka Berpikir')] },
  bab3: { judul: 'Bab III Metodologi Penelitian', subs: [S('jenis_desain_penelitian', 'Jenis & Tahapan Penelitian'), S('alat_bahan', 'Alat & Bahan / Spesifikasi Sistem'), S('sumber_data_eksakta', 'Sumber Data / Dataset'), S('perancangan_sistem', 'Perancangan Sistem / Prosedur Eksperimen'), S('teknik_analisis_eksakta', 'Metrik & Teknik Pengujian'), S('jadwal_penelitian', 'Jadwal Penelitian')] },
  bab4: { judul: 'Bab IV Hasil dan Pembahasan', subs: [S('gambaran_umum', 'Deskripsi Data & Objek Uji'), S('implementasi_sistem', 'Implementasi / Pelaksanaan Eksperimen'), S('interpretasi_hasil', 'Hasil Pengujian'), S('pembahasan', 'Pembahasan'), S('implikasi_penelitian', 'Implikasi & Keterbatasan')] },
  bab5: { judul: 'Bab V Penutup', subs: [S('simpulan', 'Simpulan'), S('saran', 'Saran')] },
  lampiran: { judul: 'Lampiran', subs: [S('kisi_kisi', 'Kisi-Kisi Instrumen'), S('lembar_pengamatan', 'Lembar Pengamatan & Prosedur Uji')] },
};

const VARIAN: Record<string, Varian> = {
  kuantitatif: V_KUANTITATIF, kualitatif: V_KUALITATIF, ptk: V_PTK, pustaka: V_PUSTAKA,
  rnd: V_RND, mixed: V_MIXED, hukum_normatif: V_HUKUM_NORMATIF, hukum_empiris: V_HUKUM_EMPIRIS, eksakta: V_EKSAKTA,
};

// Overlay tesis (Kebaruan, Etika, Temuan, Implikasi Teoretis, Agenda) — paritas fungsi P referensi
const OVERLAY_TESIS: OverlayDef[] = [
  { bab: 'bab1', key: 'kebaruan_penelitian', label: 'Kebaruan Penelitian', before: ['sistematika_penulisan'] },
  { bab: 'bab3', key: 'etika_penelitian', label: 'Etika Penelitian', before: ['jadwal_penelitian'] },
  { bab: 'bab4', key: 'temuan_penelitian', label: 'Temuan Penelitian', before: ['pembahasan'] },
  { bab: 'bab4', key: 'implikasi_teoretis', label: 'Implikasi Teoretis', before: ['keterbatasan_penelitian'], after: ['pembahasan'] },
  { bab: 'bab5', key: 'agenda_penelitian', label: 'Agenda Penelitian Lanjutan', after: ['saran'] },
];

// Overlay disertasi (di atas overlay tesis)
const OVERLAY_DISERTASI: OverlayDef[] = [
  { bab: 'bab1', key: 'state_of_the_art', label: 'State of the Art', before: ['kebaruan_penelitian'] },
  { bab: 'bab1', key: 'research_gap', label: 'Research Gap', before: ['kebaruan_penelitian'], after: ['state_of_the_art'] },
  { bab: 'bab2', key: 'kerangka_teori_besar', label: 'Kerangka Teori Besar', after: ['landasan_teori'] },
  { bab: 'bab2', key: 'critical_review', label: 'Critical Review', after: ['penelitian_terdahulu_naratif', 'penelitian_terdahulu'] },
  { bab: 'bab2', key: 'proposisi_penelitian', label: 'Proposisi Penelitian', after: ['kerangka_berpikir'] },
  { bab: 'bab3', key: 'landasan_filosofis', label: 'Landasan Filosofis (Ontologi, Epistemologi, Aksiologi)', after: ['jenis_desain_penelitian'] },
  { bab: 'bab5', key: 'kontribusi_keilmuan', label: 'Kontribusi terhadap Ilmu', after: ['agenda_penelitian', 'saran'] },
];

// Varian yang menerima overlay tesis/disertasi (array `_` referensi)
const METODE_OVERLAY = new Set(['kuantitatif', 'kualitatif', 'ptk', 'pustaka', 'mixed', 'hukum_normatif', 'hukum_empiris']);

const NOMOR_BAB: Record<string, number> = { bab1: 1, bab2: 2, bab3: 3, bab4: 4, bab5: 5, lampiran: 6 };

// Nilai kolom metode form kita -> kunci varian
const PETA_METODE: Record<string, string> = {
  'Kualitatif': 'kualitatif',
  'Kuantitatif': 'kuantitatif',
  'Kuantitatif — Data Sekunder': 'kuantitatif',
  'Studi Pustaka': 'pustaka',
  'PTK': 'ptk',
  'R&D': 'rnd',
  'Mixed Method': 'mixed',
  'Hukum Normatif': 'hukum_normatif',
  'Hukum Empiris': 'hukum_empiris',
  'Eksperimen / Rekayasa': 'eksakta',
};

function varianMetode(metode?: string): string {
  const m = String(metode || '').trim();
  if (PETA_METODE[m]) return PETA_METODE[m];
  const l = m.toLowerCase();
  if (l.includes('kualitatif')) return 'kualitatif';
  if (l.includes('normatif')) return 'hukum_normatif';
  if (l.includes('hukum')) return 'hukum_empiris';
  if (l.includes('tindakan kelas') || /\bptk\b/.test(l)) return 'ptk';
  if (l.includes('pustaka') || l.includes('library')) return 'pustaka';
  if (l.includes('mixed') || l.includes('campuran') || l.includes('kombinasi')) return 'mixed';
  if (l.includes('r&d') || l.includes('pengembangan') || l.includes('development')) return 'rnd';
  if (l.includes('eksperimen') || l.includes('rekayasa') || l.includes('eksakta')) return 'eksakta';
  return 'kuantitatif';
}

function terapkanOverlay(v: Varian, overlays: OverlayDef[]): Varian {
  const hasil: Varian = {};
  for (const [id, b] of Object.entries(v)) hasil[id] = { judul: b.judul, subs: [...b.subs] };
  for (const o of overlays) {
    const b = hasil[o.bab];
    if (!b || b.subs.some((s) => s.key === o.key)) continue;
    let pos = b.subs.length;
    if (o.before) { const n = b.subs.findIndex((s) => o.before!.includes(s.key)); if (n >= 0) pos = n; }
    if (o.after) { let n = -1; for (let i = 0; i < b.subs.length; i++) if (o.after!.includes(b.subs[i].key)) n = i; if (n >= 0) pos = n + 1; }
    b.subs.splice(pos, 0, { key: o.key, label: o.label });
  }
  return hasil;
}

// Varian final proyek: metode -> varian, lalu overlay tesis/disertasi (jenis)
export function varianFor(p?: { metode?: string; jenis?: string } | null): Varian {
  const key = varianMetode(p?.metode);
  const base = VARIAN[key] || V_KUANTITATIF;
  const jenis = p?.jenis;
  if ((jenis === 'tesis' || jenis === 'disertasi') && METODE_OVERLAY.has(key)) {
    return terapkanOverlay(base, jenis === 'disertasi' ? [...OVERLAY_TESIS, ...OVERLAY_DISERTASI] : OVERLAY_TESIS);
  }
  return base;
}

// Bentuk lama { bab: { bab, subs: ['1.1 Label', ...] } } — konsumen /meta/outline, studio, taskpane
export function outlineFor(p?: { metode?: string; jenis?: string } | null): Record<string, { bab: string; subs: string[] }> {
  const v = varianFor(p);
  const out: Record<string, { bab: string; subs: string[] }> = {};
  for (const [id, b] of Object.entries(v)) {
    const n = NOMOR_BAB[id] || 6;
    out[id] = { bab: b.judul, subs: b.subs.map((s, i) => `${n}.${i + 1} ${s.label}`) };
  }
  return out;
}

// Kompatibilitas: outline baku kuantitatif tanpa overlay (konsumen lama tanpa konteks proyek)
export const OUTLINE = outlineFor(null);

// OpenAlex gratis (tanpa key): abstrak + bahasa + venue. Dipakai /referensi.
export async function openalexTop(query: string, rows = 10, since?: number | null, lang?: string | null, page = 1): Promise<{ items: { doi: string; title: string; authors: string; year: string; url: string; venue: string; abstract: string }[]; total: number }> {
  try {
    const q = encodeURIComponent(String(query).slice(0, 200));
    let filter = '';
    if (since) filter += `,from_publication_date:${since}-01-01`;
    if (lang === 'id' || lang === 'en') filter += `,language:${lang}`;
    const res = await fetch(`https://api.openalex.org/works?search=${q}&per-page=${rows}${filter ? `&filter=${filter.slice(1)}` : ''}&page=${page}&select=id,doi,title,publication_year,authorships,primary_location,abstract_inverted_index,language&mailto=admin@skripsiplg.my.id`);
    if (!res.ok) return { items: [], total: 0 };
    const j: any = await res.json();
    const items = (j.results || []).map((it: any) => {
      const inv = it.abstract_inverted_index || {};
      const words: [string, number][] = [];
      for (const [w, pos] of Object.entries(inv)) for (const p of (pos as number[])) words.push([w, p]);
      words.sort((a, b) => a[1] - b[1]);
      return {
        doi: String(it.doi || '').replace('https://doi.org/', ''),
        title: it.title || '',
        authors: (it.authorships || []).map((a: any) => a.author?.display_name || '').filter(Boolean).join('; ').slice(0, 200),
        year: String(it.publication_year || ''),
        url: it.doi || it.id || '',
        venue: it.primary_location?.source?.display_name || '',
        abstract: words.map((w) => w[0]).join(' ').slice(0, 1200),
      };
    }).filter((r: any) => r.title);
    return { items, total: j.meta?.count || 0 };
  } catch { return { items: [], total: 0 }; }
}

// Pencarian referensi nyata ber-DOI via Crossref (gratis, tanpa key): referensi nyata ber-DOI untuk sitasi.
export async function crossrefTop(query: string, rows = 6, minYear?: number | null): Promise<{ doi: string; title: string; authors: string; year: string; url: string }[]> {
  try {
    const q = encodeURIComponent(String(query).slice(0, 200));
    const filt = minYear ? `&filter=from-pub-date:${minYear}-01-01` : '';
    const res = await fetch(`https://api.crossref.org/works?query.bibliographic=${q}&rows=${rows}${filt}&select=DOI,title,author,published,URL&mailto=admin@skripsiplg.my.id`);
    if (!res.ok) return [];
    const j: any = await res.json();
    return (j.message?.items || []).map((it: any) => ({
      doi: it.DOI || '',
      title: (it.title || [''])[0],
      authors: (it.author || []).map((a: any) => `${a.family || ''}${a.given ? ', ' + a.given : ''}`).join('; ').slice(0, 200),
      year: String(it.published?.['date-parts']?.[0]?.[0] || ''),
      url: it.URL || (it.DOI ? `https://doi.org/${it.DOI}` : ''),
    })).filter((r: any) => r.title && r.doi);
  } catch { return []; }
}

function refBlock(refs: { doi: string; title: string; authors: string; year: string; url: string }[]) {
  if (!refs.length) return ' (tidak ada referensi eksternal tersedia — gunakan teori standar bila perlu).';
  return '\nDAFTAR REFERENSI WAJIB (gunakan untuk bodynote + Daftar Pustaka, format APA 7th, URL bisa diklik):\n' +
    refs.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). ${r.title}. https://doi.org/${r.doi}`).join('\n');
}

const SITASI = `Aturan format: teks bersih — TANPA **bold**, tanpa ---, tanpa preamble seperti "Berikut adalah...". Markdown yang boleh hanya: (1) judul sub-bab bernomor pola "N.M Judul" (mis. "2.4 Penelitian Terdahulu") tanpa ** dan tanpa #; (2) TABEL markdown format standar — WAJIB pipe di awal dan di akhir SETIAP baris, termasuk baris pemisah, contoh:
| No | Nama (Tahun) | Judul | Hasil | Gap |
|---|---|---|---|---|
| 1 | ... | ... | ... | ... |
(3) daftar bernomor "1." "2." "3." untuk identifikasi/rumusan/saran. JANGAN tulis caption "Tabel x.y" atau "Gambar x.y" — penomoran tabel & gambar dibuat otomatis oleh sistem. Tulis isi teks dengan huruf normal — JANGAN semua huruf kapital; judul artikel referensi ditulis dengan huruf normal (bukan HURUF BESAR semua). Bagan: satu kotak per baris, panah "↓" atau "→" di baris tersendiri. Langsung mulai dari judul bab. Wajib: (1) tulis dalam bahasa yang diminta, (2) bodynote sesuai gaya sitasi yang diminta di setiap sub-bab yang memakai teori/temuan, (3) akhiri dengan sub-bagian "Daftar Pustaka Bab Ini" berisi referensi di atas dalam format gaya sitasi yang diminta lengkap dengan link DOI yang bisa diklik. Jangan mengarang DOI/judul di luar daftar. Jangan tulis kata "Ilustratif": tabel fenomena hanya boleh berisi data nyata bersumber, bila tidak ada maka hapus tabelnya.`;

// Pilihan interaktif studio (paritas referensi): bagan Bab II + input metodologi Bab III
type Ekstra = { bagan?: string; baganTeks?: string; populasi?: string; takDiketahui?: boolean; desain?: string; software?: string };

export function babPrompt(bab: string, p: any, refs: { doi: string; title: string; authors: string; year: string; url: string }[], ekstra: Ekstra = {}) {
  const style = p.citation_style || 'APA 7th';
  const lang = p.language || 'Indonesia';
  const base = `Judul: ${p.judul}\nJenis: ${p.jenis}\nMetode: ${p.metode}\nBahasa penulisan: ${lang}\nGaya sitasi: ${style}\n${p.initial_data ? `Data awal penelitian: ${String(p.initial_data).slice(0, 1000)}\n` : ''}`;
  const ref = refBlock(refs);
  const scopeNote = p.ref_scope && p.ref_scope !== 'umum' ? `Prioritaskan referensi ${p.ref_scope}.\n` : '';
  const outlineNote = p.custom_outline ? `Ikuti struktur bab kustom berikut (jangan pakai struktur standar):\n${String(p.custom_outline).slice(0, 2000)}\n` : '';
  const fenomena = p.fetch_fenomena && bab === 'bab1'
    ? `Sertakan tabel fenomena di latar belakang (angka/fakta + sumber + tahun). Bila topik sangat lokal tanpa data daring, tulis apa adanya tanpa mengarang.\n` : '';
  const wajib = Array.isArray(p.custom_sources) && p.custom_sources.length
    ? `SUMBER WAJIB (arahan pembimbing — harus disitasi bila relevan, masuk Daftar Pustaka):\n${p.custom_sources.map((s: any, i: number) => `${i + 1}. ${s.name}: ${String(s.text || '').slice(0, 800)}`).join('\n')}\n` : '';
  // --- Struktur baku per metode + overlay jenis (paritas mantrariset) ---
  const v = varianFor(p);
  const vk = varianMetode(p?.metode);
  const kuant = vk === 'kuantitatif' || vk === 'mixed'; // varian bergaya kuantitatif (mixed = kuant + pedoman)
  const tahun = new Date().getFullYear();
  const subsNum = (b: string) => (v[b] ? v[b].subs.map((s, i) => `${NOMOR_BAB[b] || 6}.${i + 1} ${s.label}`) : []);
  const nomorSub = (b: string, key: string) => {
    const i = v[b] ? v[b].subs.findIndex((s) => s.key === key) : -1;
    return i >= 0 ? `${NOMOR_BAB[b] || 6}.${i + 1}` : '';
  };

  // CATATAN per varian — arahan isi per sub (ditulis khusus per metode)
  const nota1: Record<string, string> = {
    latar_belakang: '15–25 paragraf, tiap paragraf punya bodynote bila memakai angka/temuan',
    latar_belakang_umum_khusus: '15–25 paragraf dengan alur umum lalu khusus, tiap paragraf punya bodynote bila memakai angka/temuan',
    identifikasi_masalah: 'daftar bernomor',
    rumusan_masalah: 'daftar bernomor — tiap pertanyaan satu nomor urut "1.", "2.", dst.',
    kebaruan_penelitian: 'jelaskan gap/kebaruan dibanding penelitian terdahulu — teks + boleh tabel ringkas',
    sistematika_penulisan: 'daftar per bab',
    spesifikasi_produk_bab1: 'ringkas spesifikasi/solusi produk yang dituju pengembangan',
    kerangka_konseptual: 'sajikan kerangka konseptual sebagai tabel/bagan konsep–indikator',
    definisi_konseptual_operasional: 'tabel definisi konseptual & operasional tiap istilah kunci',
  };
  const s1 = v.bab1 ? v.bab1.subs : [];
  const struktur1 = `Susun BAB I dengan TEPAT ${s1.length} sub-bagian berurutan: ${s1.map((s, i) => {
    const n = `1.${i + 1} ${s.label}`;
    return nota1[s.key] ? `${n} (${nota1[s.key]})` : n;
  }).join(', ')}.\n`;

  const catatan2: Record<string, string> = {
    kualitatif: `Uraikan teori utama tiap konsep kunci penelitian (sub-sub bertingkat bila perlu); TANPA hipotesis. WAJIB: sub Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi minimal 6 penelitian terdahulu nyata dari referensi yang relevan.\n`,
    ptk: `Landasan Teori memuat teori pembelajaran/manajemen kelas + teori tindakan; sub Hipotesis Tindakan berisi dugaan perbaikan setelah tindakan. WAJIB: sub Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi minimal 6 penelitian terdahulu nyata dari referensi yang relevan.\n`,
    pustaka: `Fokus teori & telaah literatur: jelaskan konsep utama, bandingkan hasil studi terdahulu. WAJIB: sub Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi minimal 6 literatur nyata dari referensi yang relevan.\n`,
    hukum_normatif: `Tinjauan umum konsep & asas hukum yang relevan; sertakan kutipan peraturan/peradilan seperlunya. WAJIB: sub Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi minimal 6 literatur nyata dari referensi.\n`,
    hukum_empiris: `Tinjauan umum peraturan & objek penelitian, teori utama + pendukung. WAJIB: sub Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi minimal 6 literatur nyata dari referensi.\n`,
    rnd: `Landasan teori pengembangan produk (kebutuhan, spesifikasi, teori pendukung domain). WAJIB: sub Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi minimal 6 literatur nyata dari referensi.\n`,
    eksakta: `Landasan teori sistem/rekayasa & konsep pendukung. WAJIB: sub Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi minimal 6 literatur nyata dari referensi.\n`,
  };
  const struktur2 = kuant
    ? `Struktur wajib BAB II: 2.1 Landasan Teori — untuk SETIAP konstruk/variabel penelitian buat sub-sub BERTINGKAT 5 tingkat dengan pola: "2.1.1.1 Teori yang Mendasari <variabel>", "2.1.1.2 Pengertian <variabel>", "2.1.1.3 Dimensi <variabel>", "2.1.1.4 Indikator <variabel>", "2.1.1.5 Faktor-Faktor yang Memengaruhi <variabel>" (sub-sub berikutnya lanjut 2.1.2, 2.1.3, dst.); 2.2 Kerangka Teori; 2.3 Hubungan Antar Variabel (satu sub tiap pasangan hubungan termasuk mediasi); 2.4 Penelitian Terdahulu; 2.5 Kerangka Berpikir; 2.6 Hipotesis.\nWAJIB: sub 2.4 Penelitian Terdahulu berupa TABEL markdown persis kolom "No | Nama (Tahun) | Judul | Hasil | Gap" berisi 10 penelitian terdahulu nyata dari referensi yang relevan (1 paragraf penjelasan pendahulu tabel juga boleh).\n`
    : `Struktur wajib ${((v.bab2 && v.bab2.judul.toUpperCase()) || 'BAB II')}: ${subsNum('bab2').join(', ')}.\n${catatan2[vk] || ''}`;
  const nBagan = nomorSub('bab2', 'kerangka_berpikir');
  const baganNote = nBagan
    ? (ekstra.bagan === 'kirim' && ekstra.baganTeks
      ? `${nBagan} Kerangka Berpikir: ikuti DESKRIPSI bagan dari penulis berikut, jadikan urutan kotak/panahnya (sajikan sebagai blok teks terstruktur pakai karakter → dan baris per kotak):\n${String(ekstra.baganTeks).slice(0, 800)}\n`
      : `${nBagan} Kerangka Berpikir: akhiri sub-bagian ini dengan BAGAN TEKS terstruktur (baris per kotak, hubungkan dengan →, sebutkan X1, X2, Z, Y sesuai variabel judul) setelah paragraf penjelasan, lalu kalimat "Kerangka berpikir tersebut disajikan pada gambar berikut." sebelum blok bagan.\n`)
    : '';
  const populasiNote = (() => {
    if (!kuant) return ''; // rumus Slovin/Lemeshow khas survei kuantitatif
    if (ekstra.takDiketahui) return `Populasi: TOTAL populasi tidak diketahui — gunakan rumus Lemeshow untuk menentukan besar sampel.\n`;
    if (ekstra.populasi) return `Populasi: ${ekstra.populasi} (besaran sesuai satuan objek pada judul) — hitung besar sampel dengan rumus Slovin, tingkat kesalahan (e) 5%.\n`;
    return '';
  })();
  const desainNote = ekstra.desain ? `Jenis/desain penelitian: ${ekstra.desain} — sebutkan dan kembangkan alasannya di ${(v.bab3 && nomorSub('bab3', 'jenis_desain_penelitian')) || '3.1'}.\n` : '';
  const softwareNote = ekstra.software ? `Software analisis: ${ekstra.software} — sebutkan pada ${(v.bab3 && nomorSub('bab3', 'analisis_spss')) || (v.bab3 && nomorSub('bab3', 'teknik_analisis')) || '3.5'} Teknik Analisis Data.\n` : '';

  const catatan3: Record<string, string> = {
    kualitatif: `Pada Subjek & Informan: teknik sampling (purposive/snowball) + besaran & karakteristik. Pada Teknik Pengumpulan Data: observasi, wawancara mendalam, dokumentasi. Pada Teknik Analisis Data: alur Miles & Huberman (reduksi data → penyajian data → penarikan kesimpulan). Pada Uji Keabsahan Data: credibility (triangulasi, member checking, audit trail), transferability, dependability, confirmability.\n`,
    ptk: `Uraikan model PTK (mis. Kemmis & McTaggart): siklus perencanaan → tindakan → observasi → refleksi, minimal 2 siklus; instrumen: lembar observasi & rubrik penilaian; analisis: kualitatif deskriptif + kuantitatif sederhana (rata-rata, persentase); sertakan indikator keberhasilan.\n`,
    pustaka: `Sumber data primer & sekunder; teknik pengumpulan: telaah dokumen/kepustakaan (katalog, indeks, basis data daring); analisis: klasifikasi, reduksi, penyajian, penarikan kesimpulan; keabsahan: kelengkapan, konsistensi, objektivitas.\n`,
    hukum_normatif: `Metode yuridis normatif deskriptif-analitis: bahan hukum primer (peraturan, putusan), sekunder (buku, jurnal), tersier (kamus, ensiklopedia); teknik: studi pustaka & penafsiran hukum; penarikan kesimpulan deduktif.\n`,
    hukum_empiris: `Metode yuridis empiris (sosiolegal): lokasi & waktu penelitian, populasi/sampel/informan, wawancara mendalam & observasi, keabsahan triangulasi + member checking, etika penelitian (persetujuan responden, kerahasiaan data).\n`,
    rnd: `Model pengembangan (4D/5D: define → design → develop → desploy/disseminate) dengan uraian tiap tahap; validasi ahli (face & content validity); uji coba skala kecil lalu luas; instrumen berupa lembar validasi ahli.\n`,
    eksakta: `Perancangan pengujian: alat & bahan/dataset, prosedur eksperimen, variabel & metrik evaluasi (akurasi, presisi, MSE, dll. sesuai topik), analisis data dengan tabel/grafik hasil uji.\n`,
  };
  const nDef = nomorSub('bab3', 'definisi_operasional');
  const nKumpul = nomorSub('bab3', 'teknik_pengumpulan');
  const nAna = nomorSub('bab3', 'analisis_spss') || nomorSub('bab3', 'teknik_analisis');
  const nJad = nomorSub('bab3', 'jadwal_penelitian');
  const ganttKal = nJad
    ? `sub ${nJad} Jadwal Penelitian berupa TABEL GANTT bulanan — kolom "No | Kegiatan | Januari ${tahun} | Februari ${tahun} | Maret ${tahun} | April ${tahun} | Mei ${tahun} | Juni ${tahun}" dengan tanda X pada bulan berjalan.`
    : '';
  const struktur3 = kuant
    ? `Struktur wajib BAB III: ${(v.bab3 ? v.bab3.subs : []).map((s, i) => {
        const n = `3.${i + 1} ${s.label}`;
        if (s.key === 'teknik_pengumpulan') return `${n} (sub ${nKumpul}.1 Kuesioner dengan sub per variabel)`;
        if (s.key === 'analisis_spss') return `${n} (${nAna}.1 Uji Validitas, ${nAna}.2 Uji Reliabilitas, ${nAna}.3 Uji Asumsi Klasik — ${nAna}.3.1 Normalitas, ${nAna}.3.2 Multikolinearitas, ${nAna}.3.3 Heteroskedastisitas, ${nAna}.4 Analisis Regresi Linear Berganda — ${nAna}.4.1 Uji t, ${nAna}.4.2 Uji F, ${nAna}.4.3 Koefisien Determinasi R², ${nAna}.5 Uji Mediasi (Path Analysis))`;
        return n;
      }).join(', ')}.\nWAJIB TABEL: (a) sub ${nDef} Definisi Operasional berupa TABEL markdown persis 7 kolom "Variabel | Definisi Konseptual | Definisi Operasional | Dimensi | Indikator | Skala Pengukuran | Sumber" (satu baris per variabel);${ganttKal ? ` (b) ${ganttKal}` : ''}\n`
    : `Struktur wajib ${((v.bab3 && v.bab3.judul.toUpperCase()) || 'BAB III')}: ${subsNum('bab3').join(', ')}.\n${catatan3[vk] || ''}${ganttKal ? `WAJIB TABEL: ${ganttKal}\n` : ''}`;

  const catatan4: Record<string, string> = {
    kualitatif: `Sajikan data per tema hasil wawancara/observasi (boleh kutipan informan), Triangulasi & Keabsahan Temuan memuat triangulasi teknik/sumber/waktu + member checking, Pembahasan mengaitkan temuan dengan teori Bab II.`,
    ptk: `Deskripsi kondisi awal & hasil tiap siklus (nilai rata-rata, ketuntasan, indikator), Perbandingan Antar-Siklus, lalu Pembahasan mengapa tindakan berhasil/perlu diperbaiki.`,
    pustaka: `Penyajian data kajian per topik, Analisis Data berupa sintesis sistematis, Pembahasan mengaitkan dengan landasan teori Bab II.`,
    hukum_normatif: `Analisis per pasal & putusan: pengaturan hukum, permasalahan, kelemahan, lalu konsep pembaruan hukum yang diajukan.`,
    hukum_empiris: `Gambaran lokasi & subjek, pelaksanaan hukum di lapangan, analisis tiap rumusan masalah, faktor pendukung/penghambat, upaya penyelesaian, efektivitas hukum, temuan penelitian.`,
    rnd: `Pembahasan hasil pengembangan: produk/jurus pengembangan, hasil validasi ahli, hasil uji coba — kaitkan dengan kebutuhan & teori Bab II.`,
    eksakta: `Deskripsi data uji, implementasi/eksperimen, Hasil Pengujian dalam tabel/grafik, Pembahasan dibandingkan tolok ukur & literatur.`,
  };
  const adaAgenda = v.bab5 && v.bab5.subs.some((s) => s.key === 'agenda_penelitian');
  const struktur4 = kuant
    ? `Susun BAB IV HASIL DAN PEMBAHASAN (deskripsi data, hasil analisis, pembahasan dikaitkan teori Bab II). Sub-bagian urut sesuai struktur: ${subsNum('bab4').join(', ')}.\n`
    : `Susun ${((v.bab4 && v.bab4.judul.toUpperCase()) || 'BAB IV')} dengan sub-bagian urut TEPAT: ${subsNum('bab4').join(', ')} — ${catatan4[vk] || 'sajikan hasil per sub-bagian lalu pembahasan dikaitkan teori Bab II.'}\n`;
  const struktur5 = kuant
    ? `Susun BAB V PENUTUP (kesimpulan menjawab rumusan masalah + saran praktis/metodologis). Sub-bagian urut: ${subsNum('bab5').join(', ')}${adaAgenda ? ' — Agenda Penelitian Lanjutan berisi arah penelitian berikutnya berbasis keterbatasan penelitian' : ''}.\n`
    : `Susun ${((v.bab5 && v.bab5.judul.toUpperCase()) || 'BAB V')} dengan sub-bagian urut: ${subsNum('bab5').join(', ')} — Simpulan menjawab rumusan masalah satu per satu; Saran praktis/teknis/akademis${adaAgenda ? '; Agenda Penelitian Lanjutan berisi arah penelitian berikutnya berbasis keterbatasan penelitian' : ''}.\n`;
  const s6 = subsNum('lampiran');
  const strukturL = !kuant && s6.length
    ? `Sub-bagian urut: ${s6.join(', ')} — tiap sub diisi instrumen penelitian NYATA sesuai labelnya (kisi-kisi, pedoman/lembar observasi-keahlian, pernyataan responden, lembar validasi) yang diturunkan dari kajian pustaka dan metode artikelmu, gunakan tabel Markdown bila membantu.\n`
    : '';

  const map: Record<string, string> = {
    bab1: `${struktur1}Judul: karya berikut.\n${base}${ref}\n${wajib}${fenomena}Tulis akademik formal Indonesia, siap tempel ke Word.\n${scopeNote}${outlineNote}${SITASI}`,
    bab2: `${struktur2}${baganNote}Judul: karya berikut.\n${base}${ref}\n${scopeNote}${outlineNote}${SITASI}`,
    bab3: `${struktur3}${populasiNote}${desainNote}${softwareNote}Judul: karya berikut.\n${base}${ref}\nIkuti kaidah metodologi standar Indonesia.\n${scopeNote}${outlineNote}${SITASI}`,
    bab4: `${struktur4}${base}${ref}\nGunakan tabel Markdown bila perlu.\n${scopeNote}${outlineNote}${SITASI}`,
    bab5: `${struktur5}${base}${ref}\nRingkas dan tegas.\n${scopeNote}${outlineNote}${SITASI}`,
    lampiran: `Susun LAMPIRAN skripsi (bab penunjang setelah Bab V) berisi instrumen penelitian.\n${base}${ref}\n${strukturL}${strukturL ? '' : `Isinya diturunkan dari kajian pustaka dan metode artikelmu: ${p.metode === 'Kualitatif'
      ? 'kisi-kisi wawancara/pedoman wawancara, daftar informan, contoh transkrip, lembar observasi'
      : 'kisi-kisi kuisioner, daftar pernyataan per indikator skala Likert, contoh lembar jawaban responden'} serta Lembar Pernyataan/Afirasi. Susun per bagian bernomor 6.1, 6.2, dst. gunakan tabel Markdown bila membantu.\n`}${scopeNote}${outlineNote}${SITASI}`,
  };
  return map[bab] || map.bab1;
}

router.get('/', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('projects').select('*').eq('user_id', req.userId!).order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ items: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { judul, jenis = 'skripsi', metode = 'Kualitatif', tahap = 'full', identitas = {},
      citation_style = 'APA 7th', language = 'Indonesia', min_year = null,
      ref_origin = 'semua', ref_scope = 'umum', initial_data = '',
      custom_outline = '', fetch_fenomena = true, custom_sources = [], logo = '' } = req.body || {};
    if (!judul || String(judul).trim().length < 10) return res.status(400).json({ error: 'Judul minimal 10 karakter' });
    const ident = { ...(identitas || {}) };
    if (logo) ident.logo = String(logo).slice(0, 500000);
    const { data, error } = await db().from('projects').insert({ user_id: req.userId!, judul, jenis, metode, tahap, identitas: ident,
      citation_style, language, min_year, ref_origin, ref_scope, initial_data, custom_outline, fetch_fenomena,
      custom_sources: Array.isArray(custom_sources) ? custom_sources.slice(0, 10) : [] }).select().single();
    if (error) throw new Error(error.message);
    res.json({ item: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('projects').select('*').eq('id', String(req.params.id)).eq('user_id', req.userId!).single();
    if (error) throw new Error('Proyek tidak ditemukan');
    res.json({ item: data });
  } catch (e: any) { res.status(404).json({ error: e.message }); }
});

router.post('/:id/generate-bab', requireAuthOrKey, async (req: AuthRequest, res) => {  try {
    const id = String(req.params.id);
    const { bab } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: `bab harus salah satu: ${BAB_LIST.join(', ')}` });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const cost = biayaBab(p, bab);
    try {
      await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`, cost);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const refs = await crossrefTop(p.judul, 6, p.min_year);
    let text: string;
    try {
      text = await generateContent(babPrompt(bab, p, refs));
    } catch (e: any) {
      const { addCredits } = await import('../services/credits.service');
      await addCredits(req.userId!, cost, `refund:${id}:${bab}-gagal`).catch(() => {});
      throw e;
    }
    const content = { ...(p.content || {}), [bab]: text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ bab, text, refs });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Streaming SSE per BAB penuh (untuk Studio web).
router.post('/:id/generate-bab-stream', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab, studi, force, instruksi, bagan, baganTeks, populasi, takDiketahui, desain, software } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: `bab harus salah satu: ${BAB_LIST.join(', ')}` });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const extraStudi = bab === 'bab2' && studi ? ` Bahas ${Math.min(Math.max(parseInt(studi, 10) || 10, 5), 50)} studi terdahulu, 1 paragraf per studi.` : '';
    // Arahan penulis untuk "Generate Ulang Bab Ini" (opsional, maks 1500 karakter)
    const extraArahan = instruksi ? ` Arahan penulis (ikuti sejauh tidak melanggar aturan penulisan — struktur, sitasi, panjang): ${String(instruksi).slice(0, 1500)}` : '';
    // Pilihan interaktif (paritas referensi): bagan Bab II + input metodologi Bab III
    const ekstra = {
      bagan: bagan === 'kirim' ? 'kirim' : bagan === 'ai' ? 'ai' : undefined,
      baganTeks: baganTeks ? String(baganTeks).slice(0, 800) : undefined,
      populasi: populasi ? String(populasi).slice(0, 40) : undefined,
      takDiketahui: !!takDiketahui,
      desain: desain ? String(desain).slice(0, 80) : undefined,
      software: software ? String(software).slice(0, 40) : undefined,
    };
    // Tulis-ulang (Generate Ulang Bab, ?ulang=1) = 1 kredit — paritas referensi
    // (keputusan owner #2). Kecuali bab yang memang gratis (Lampiran) tetap 0.
    const cost = req.query.ulang === '1' ? (biayaBab(p, bab) === 0 ? 0 : 1) : biayaBab(p, bab);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (ev: string, data: any) => res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
    if ((p.content || {})[bab] && !force) {
      send('cached', true);
      for (const w of String(p.content[bab]).split(/(\s+)/)) send('chunk', { t: w });
      send('done', { cost: 0, cached: true });
      return res.end();
    }
    try {
      const r = await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`, cost);
      send('cost', { cost: r.cost });
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') { send('error', { error: e.message }); return res.end(); }
      throw e;
    }
    const refs = await crossrefTop(p.judul, 6, p.min_year);
    let full = '';
    try {
      for await (const t of generateContentStream(babPrompt(bab, p, refs, ekstra) + extraStudi + extraArahan)) {
        full += t;
        send('chunk', { t });
      }
    } catch (e: any) {
      const { addCredits } = await import('../services/credits.service');
      await addCredits(req.userId!, cost, `refund:${id}:${bab}-stream-gagal`).catch(() => {});
      send('error', { error: e.message || 'Gagal generate' });
      return res.end();
    }
    const content = { ...(p.content || {}), [bab]: full };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    send('done', { cost });
    res.end();
  } catch (e: any) {
    try { res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`); res.end(); } catch { /* abaikan */ }
  }
});

router.post('/:id/generate-artikel', requireAuthOrKey, async (req: AuthRequest, res) => {  try {
    const id = String(req.params.id);
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const scopus = p.jenis === 'artikel_scopus';
    try {
      await consumeCredits(req.userId!, 'artikel', `proyek:${id}:artikel`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const lang = scopus ? 'English (akademik, siap submit Scopus Q1-Q4)' : 'Indonesia (akademik, siap submit Sinta)';
    const refs = await crossrefTop(p.judul, 10);
    const text = await generateContent(
      `Susun artikel jurnal lengkap berbahasa ${lang} dengan struktur: Judul, Abstrak + kata kunci, Pendahuluan, Metode, Hasil & Pembahasan, Kesimpulan, Daftar Pustaka (APA, gunakan referensi nyata di bawah + bodynote di tiap bagian). Judul: ${p.judul}. Metode: ${p.metode}.${refBlock(refs)}\nJangan mengarang DOI/judul di luar daftar. Tulis siap submit.`
    );
    await db().from('projects').update({ content: { ...(p.content || {}), artikel: text }, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text, refs });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/meta/outline', async (req, res) => {
  const { metode, jenis } = req.query as { metode?: string; jenis?: string };
  res.json({ outline: outlineFor({ metode, jenis }) });
});

// Referensi proyek (untuk Unduh RIS + tab Pustaka): unggahan user dahulu, lalu Crossref by judul — tanpa AI, tanpa kredit
router.get('/:id/references', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { data: p, error } = await db().from('projects').select('judul,min_year,identitas').eq('id', String(req.params.id)).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const custom = Array.isArray(p.identitas?.refs) ? p.identitas.refs : [];
    res.json({ items: [...custom, ...(await crossrefTop(p.judul, 20, p.min_year))] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ---------------------------------------------------------------------------
// Unggah Artikel Sendiri (GRATIS): PDF/DOCX jurnal atau arahan pembimbing →
// diekstrak metadatanya (DOI dulu, lalu Crossref by judul) → masuk Daftar Pustaka.
// Disimpan di identitas.refs (tanpa migrasi kolom).
// ---------------------------------------------------------------------------
const upArtikel = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }).single('file');

async function crossrefByDoi(doi: string) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=admin@skripsiplg.my.id`);
    if (!res.ok) return null;
    const it: any = (await res.json()).message || {};
    return {
      doi: it.DOI || doi,
      title: (it.title || [''])[0] || '',
      authors: (it.author || []).map((a: any) => `${a.family || ''}${a.given ? ', ' + a.given : ''}`).join('; ').slice(0, 300),
      year: String(it.published?.['date-parts']?.[0]?.[0] || ''),
      url: it.URL || `https://doi.org/${doi}`,
      jurnal: (it['container-title'] || [''])[0] || '',
    };
  } catch { return null; }
}

router.post('/:id/references/upload', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    await new Promise<void>((resolve, reject) => upArtikel(req as any, res as any, (e: any) => (e ? reject(e) : resolve())));
    const id = String(req.params.id);
    const f = (req as any).file as { originalname: string; buffer: Buffer } | undefined;
    if (!f) return res.status(400).json({ error: 'Pilih berkas PDF/DOCX (maks 8 MB)' });
    if (!/\.(pdf|docx)$/i.test(f.originalname)) return res.status(400).json({ error: 'Format harus PDF atau DOCX' });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });

    let text = '';
    if (/\.docx$/i.test(f.originalname)) {
      const mammoth = await import('mammoth');
      const r = await (mammoth as any).extractRawText({ buffer: f.buffer });
      text = String(r.value || '');
    } else {
      const { pdfText } = await import('../utils/pdf');
      text = await pdfText(f.buffer, 60000);
    }
    const head = text.slice(0, 12000);

    // 1) DOI di dalam berkas
    const mDoi = head.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    let ref: any = mDoi ? await crossrefByDoi(String(mDoi[0]).replace(/[.,;)]+$/, '')) : null;

    // 2) Kalimat judul: baris panjang tanpa angka berlebih sebelum kata Abstrak/Keywords
    const baris = head.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const hentikan = (l: string) => /^(abstrak|abstract|kata kunci|keywords|pendahuluan|introduction|1\.|http|doi)/i.test(l);
    let judulTeuken = '';
    for (const l of baris.slice(0, 40)) {
      if (hentikan(l)) break;
      if (l.length >= 25 && l.length <= 220 && (l.match(/[a-zA-Z]/g) || []).length / l.length > 0.6 && !/^\d+$/.test(l)) {
        judulTeuken = l.replace(/^[\d.\s]+/, '');
        if (judulTeuken.split(' ').length >= 5) break;
      }
    }
    if (!ref && judulTeuken) {
      const kandidat = await crossrefTop(judulTeuken, 3);
      const skor = (t: string) => {
        const a = new Set(t.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
        const b = new Set(judulTeuken.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
        if (!a.size) return 0;
        let sama = 0; a.forEach((w) => { if (b.has(w)) sama++; });
        return sama / a.size;
      };
      const cocok = kandidat.map((k) => ({ k, s: skor(k.title) })).sort((x, y) => y.s - x.s)[0];
      if (cocok && cocok.s >= 0.5) ref = { ...cocok.k, jurnal: '' };
    }

    if (!ref) {
      const th = head.match(/\b(19|20)\d{2}\b/);
      const aLines = baris.slice(0, 12);
      const penulis = aLines.find((l) => /^[\p{L}][\p{L}. ,'&-]{4,80}$/u.test(l) && !hentikan(l)) || '';
      ref = {
        doi: mDoi ? String(mDoi[0]) : '',
        title: judulTeuken || f.originalname.replace(/\.(pdf|docx)$/i, ''),
        authors: penulis,
        year: th ? th[0] : '',
        url: '',
        jurnal: '',
      };
      if (!judulTeuken && !mDoi) return res.status(422).json({ error: 'Judul/DOI artikel tidak terbaca. Coba berkas yang halaman awalnya memuat judul artikel.' });
    }

    const custom = Array.isArray(p.identitas?.refs) ? [...p.identitas.refs] : [];
    const kembar = custom.some((c: any) => String(c.doi || '') === String(ref.doi || '') && String(c.title || '').toLowerCase() === String(ref.title || '').toLowerCase());
    if (kembar) return res.status(409).json({ error: 'Artikel ini sudah ada di Daftar Pustaka proyek.' });
    if (custom.length >= 10) return res.status(400).json({ error: 'Maksimal 10 artikel unggahan per proyek.' });

    const entri = {
      doi: String(ref.doi || ''),
      title: String(ref.title || ''),
      authors: String(ref.authors || ''),
      year: String(ref.year || ''),
      url: String(ref.url || ''),
      jurnal: String(ref.jurnal || ''),
      file: f.originalname,
      sumber: 'unggahan',
    };
    const ident = { ...(p.identitas || {}), refs: [entri, ...custom] };
    const { error: e2 } = await db().from('projects').update({ identitas: ident, updated_at: new Date().toISOString() }).eq('id', id);
    if (e2) throw new Error(e2.message);
    res.json({ ref: entri, refs: ident.refs, total: ident.refs.length });
  } catch (e: any) {
    if (e?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Berkas terlalu besar (maks 8 MB).' });
    res.status(500).json({ error: e.message });
  }
});

// Simpan/ubah isi konten (dipakai Lab Revisi tab Proyek Web)
router.patch('/:id/content', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { key, text } = req.body || {};
    if (!key || typeof text !== 'string') return res.status(400).json({ error: 'key dan text wajib' });
    const { data: p, error } = await db().from('projects').select('content').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const content = { ...(p.content || {}), [key]: text.slice(0, 60000) };
    const { error: e2 } = await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    if (e2) throw new Error(e2.message);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Halaman depan: kata pengantar AI + data identitas (gratis, tanpa potong kredit)
router.post('/:id/front-matter', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const ident = p.identitas || {};
    const kata = await generateContent(
      `Susun KATA PENGANTAR skripsi 250-350 kata, formal Indonesia. Judul: ${p.judul}. Penulis: ${ident.nama || '-'}, NIM ${ident.nim || '-'}, ${ident.jurusan || ''} ${ident.kampus || ''}. Ucapkan syukur, terima kasih pembimbing, sadari kekurangan, harap manfaat. Tanpa markdown tebal berlebihan.`
    );
    res.json({
      judul: p.judul, nama: ident.nama || '', nim: ident.nim || '',
      kampus: ident.kampus || '', jurusan: ident.jurusan || '', fakultas: ident.fakultas || '',
      kata,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Generate per SUB-BAB. Bayar sekali per bab: sub-bab berikutnya di bab yang sama gratis.
router.post('/:id/generate-subbab', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab, sub, force } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: 'bab tidak dikenal' });
    if (!sub || String(sub).trim().length < 2) return res.status(400).json({ error: 'sub wajib diisi' });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const d = db();
    const key = `${bab}:${sub}`;
    if ((p.content || {})[key] && !force) return res.json({ text: p.content[key], cached: true, cost: 0 });
    const { data: paid } = await d.from('credit_ledger').select('id').eq('user_id', req.userId!).eq('ref', `proyek:${id}:${bab}`).limit(1);
    let cost = 0;
    if (force || ((!paid || !paid.length) && !(p.content || {})[bab])) {
      try {
        const r = await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`, biayaBab(p, bab));
        cost = r.cost;
      } catch (e: any) {
        if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
        throw e;
      }
    }
    const refs = await crossrefTop(`${p.judul} ${sub}`, 5, p.min_year);
    const text = await generateContent(
      `Susun sub-bab "${sub}" dari ${(outlineFor(p)[bab] || {}).bab || bab} untuk karya berikut. Judul: ${p.judul}. Metode: ${p.metode}. Bahasa: ${p.language || 'Indonesia'}. Gaya sitasi: ${p.citation_style || 'APA 7th'}.\n${refBlock(refs)}\nTulis 300-600 kata akademik dengan bodynote bila memakai teori. Jangan mengarang DOI.`
    );
    const content = { ...(p.content || {}), [key]: text };
    await d.from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text, cost });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Streaming SSE per sub-bab (kata-per-kata). Kredit sama seperti generate-subbab.
router.post('/:id/generate-subbab-stream', requireAuthOrKey, async (req: AuthRequest, res) => {  try {
    const id = String(req.params.id);
    const { bab, sub } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: 'bab tidak dikenal' });
    if (!sub || String(sub).trim().length < 2) return res.status(400).json({ error: 'sub wajib diisi' });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const key = `${bab}:${sub}`;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (ev: string, data: any) => res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
    if ((p.content || {})[key]) {
      send('Cached', true);
      for (const w of String(p.content[key]).split(/(\s+)/)) send('chunk', { t: w });
      send('done', { cost: 0, cached: true });
      return res.end();
    }
    const d = db();
    const { data: paid } = await d.from('credit_ledger').select('id').eq('user_id', req.userId!).eq('ref', `proyek:${id}:${bab}`).limit(1);
    let cost = 0;
    if ((!paid || !paid.length) && !(p.content || {})[bab]) {
      try {
        const r = await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`, biayaBab(p, bab));
        cost = r.cost;
      } catch (e: any) {
        if (e.code === 'INSUFFICIENT_CREDITS') { send('error', { error: e.message }); return res.end(); }
        throw e;
      }
    }
    send('cost', { cost });
    const refs = await crossrefTop(`${p.judul} ${sub}`, 5, p.min_year);
    const prompt = `Susun sub-bab "${sub}" dari ${(outlineFor(p)[bab] || {}).bab || bab} untuk karya berikut. Judul: ${p.judul}. Metode: ${p.metode}. Bahasa: ${p.language || 'Indonesia'}. Gaya sitasi: ${p.citation_style || 'APA 7th'}.\n${refBlock(refs)}\nTulis 300-600 kata akademik dengan bodynote bila memakai teori. Jangan mengarang DOI.`;
    let full = '';
    try {
      for await (const t of generateContentStream(prompt)) {
        full += t;
        send('chunk', { t });
      }
    } catch (e: any) {
      const { addCredits } = await import('../services/credits.service');
      if (cost) await addCredits(req.userId!, cost, `refund:${id}:${bab}-stream-gagal`).catch(() => {});
      send('error', { error: e.message || 'Gagal generate' });
      return res.end();
    }
    const content = { ...(p.content || {}), [key]: full };
    await d.from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    send('done', { cost });
    res.end();
  } catch (e: any) {
    try { res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`); res.end(); } catch { /* abaikan */ }
  }
});

// Lanjutkan skripsi dari file: deteksi bab selesai (BAB I-VII) lalu jadi proyek Studio
router.post('/from-file', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const multer = (await import('multer')).default;
    const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }).single('file');
    await new Promise<void>((resolve, reject) => up(req as any, res as any, (e: any) => (e ? reject(e) : resolve())));
    const judul = String(req.body?.judul || '').trim();
    const jenis = String(req.body?.jenis || 'skripsi');
    if (judul.length < 10) return res.status(400).json({ error: 'Judul minimal 10 karakter' });
    if (!(req as any).file) return res.status(400).json({ error: 'Upload file .docx/.pdf (maks 15 MB)' });
    const f = (req as any).file as { originalname: string; buffer: Buffer };
    let text = '';
    if (/\.docx$/i.test(f.originalname)) {
      const mammoth = await import('mammoth');
      const r = await (mammoth as any).extractRawText({ buffer: f.buffer });
      text = String(r.value || '');
    } else if (/\.pdf$/i.test(f.originalname)) {
      const { pdfText } = await import('../utils/pdf');
      text = await pdfText(f.buffer, 60000);
    } else {
      text = f.buffer.toString('utf-8');
    }
    text = text.slice(0, 60000);
    const ROMAWI: Record<string, string> = { I: 'bab1', II: 'bab2', III: 'bab3', IV: 'bab4', V: 'bab5', VI: 'bab6', VII: 'bab7' };
    const parts = text.split(/(?=\bBAB\s+[IVX]+\b)/i);
    const content: Record<string, string> = {};
    const found: string[] = [];
    for (const part of parts) {
      const m = part.match(/^\s*BAB\s+([IVX]+)/i);
      if (!m) continue;
      const key = ROMAWI[m[1].toUpperCase()];
      if (!key) continue;
      const body = part.slice(m[0].length).trim();
      if (body.length > 500) {
        content[key] = body.slice(0, 30000);
        found.push(key);
      }
    }
    const db2 = (supabaseAdmin || supabaseAnon);
    const { data, error } = await db2.from('projects').insert({
      user_id: (req as AuthRequest).userId!, judul, jenis, tahap: found.length >= 3 ? 'full' : 'proposal',
      content, initial_data: `Diimpor dari file ${f.originalname}. Bab terdeteksi: ${found.join(', ') || 'tidak ada (mulai dari nol)'}.`,
    }).select().single();
    if (error) throw new Error(error.message);
    res.json({ item: data, detected: found });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { error } = await db().from('projects').delete().eq('id', String(req.params.id)).eq('user_id', req.userId!);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Abstrak ID + EN (1 kredit)
router.post('/:id/generate-abstrak', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    try {
      await consumeCredits(req.userId!, 'revisi', `proyek:${id}:abstrak`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const text = await generateContent(
      `Susun ABSTRAK (Indonesia, 1 paragraf 150-200 kata + 3-5 kata kunci urut abjad) dan ABSTRACT (Inggris, terjemahan setara) untuk karya: ${pr.judul}. Metode: ${pr.metode}. Isi: ${(pr.content?.bab1 || '').slice(0, 2000)}`
    );
    const content = { ...(pr.content || {}), abstrak: text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Tambah sitasi ke bab (GRATIS): 1 paragraf ber-bodynote dari referensi nyata
router.post('/:id/tambah-sitasi', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab } = req.body || {};
    if (!bab) return res.status(400).json({ error: 'bab wajib' });
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const refs = await crossrefTop(pr.judul, 4, pr.min_year);
    if (!refs.length) return res.status(404).json({ error: 'Tidak ada referensi cocok' });
    const text = await generateContent(
      `Tulis 1 paragraf akademik (80-120 kata) relevan dengan "${bab}" untuk judul ${pr.judul}, dengan 2-3 bodynote ${pr.citation_style || 'APA 7th'} dari referensi berikut (jangan karang di luar daftar):\n${refs.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). ${r.title}. https://doi.org/${r.doi}`).join('\n')}`
    );
    const content = { ...(pr.content || {}), [bab]: String(pr.content?.[bab] || '') + '\n\n' + text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Karil UT (MKWI4560): artikel sistematika UT (15 kredit, pakai tarif artikel)
router.post('/:id/generate-karil', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    try {
      await consumeCredits(req.userId!, 'artikel', `proyek:${id}:karil`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const refs = await crossrefTop(pr.judul, 10, pr.min_year);
    const text = await generateContent(
      `Susun KARYA ILMIAH UT (MKWI4560) berbahasa Indonesia, sistematika: Judul, Identitas (Nama/NIM/UPBJJ), Abstrak 150-200 kata + 3-5 kata kunci abjad, Pendahuluan, Metode, Hasil dan Pembahasan, Simpulan dan Saran, Daftar Pustaka APA (min 10 sumber, 5 jurnal 5 tahun terakhir). Penulis: mahasiswa pertama. Judul: ${pr.judul}.\n${refs.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). ${r.title}. https://doi.org/${r.doi}`).join('\n')}\nJangan mengarang DOI.`
    );
    const content = { ...(pr.content || {}), karil: text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Export .docx asli: sampul + semua bab + hyperlink DOI + footer romawi/arab + TOC
// ---------------------------------------------------------------------------
// Ekspor DOCX — paritas spesifikasi mantrariset (lihat hasil-analisis-mantrariset):
// sampul TESIS → front matter 9 H1 (roman) → isi BAB (decimal) + Daftar Pustaka +
// Lampiran · heading biru 2E74B5/1F4D78 · body rata kiri-kanan line 360 firstLine 720 ·
// pustaka hanging 720 · TOC \o 1-2 + \a Gambar/Tabel · footer PAGE + disclaimer AI.
// ---------------------------------------------------------------------------
router.get('/:id/export-docx', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const docx: any = await import('docx');
    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageNumber,
      Footer, TableOfContents, ExternalHyperlink, ImageRun, SimpleField, Table, TableRow, TableCell,
      WidthType, BorderStyle, LevelFormat, NumberFormat, SectionType,
    } = docx;

    const ident = pr.identitas || {};
    const judul = String(pr.judul || '');
    const jenisSelected = pr.jenis === 'tesis' ? 'Tesis' : pr.jenis === 'disertasi' ? 'Disertasi' : 'Skripsi';
    const tahun = new Date().getFullYear();
    const nama = String(ident.nama || '');
    const nim = String(ident.nim || '');
    const jurusan = String(ident.jurusan || '');
    const fakultas = String(ident.fakultas || '');
    const kampus = String(ident.kampus || '');
    const DISCLAIMER = 'Draft dihasilkan dengan bantuan AI — wajib diverifikasi, dikritisi, dan direvisi oleh penulis. Tanggung jawab akademik & orisinalitas ada pada penulis (Permendiknas No. 17/2010).';
    const CATATAN_FIELD = 'Daftar ini belum dimutakhirkan Word. Klik kanan di baris ini → Update Field → Update entire table. (Word lama: klik daftar ini lalu tekan F9.)';

    const C: any[] = []; // penampung sementara per bagian
    const TNR = 'Times New Roman';
    const center = (text: string, opts: any = {}) => {
      const { before = 0, ...runOpts } = opts;
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before, after: 0, line: 360 },
        children: [new TextRun({ text, font: TNR, size: 24, ...runOpts })],
      });
    };

    const HEADING_LV: any = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };
    // Judul Title Case (kata hubung tetap kecil) — judul bab ala referensi
    const titleCase = (s: string) => {
      const kecil = new Set(['dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'yang', 'pada', 'dalam', 'atau', 'adalah', 'antara']);
      return s.toLowerCase().split(/\s+/)
        .map((w, k) => (k > 0 && kecil.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    };
    // Judul artikel ALL-CAPS (data Crossref) → normal — paritas referensi (0 judul caps)
    const rapikanJudul = (s: string): string => {
      const teks = String(s || '').replace(/\s+/g, ' ').trim();
      const huruf = teks.match(/[A-Za-z]/g) || [];
      if (huruf.length < 20) return teks;
      const besar = huruf.filter((c) => c >= 'A' && c <= 'Z').length;
      if (besar / huruf.length < 0.62) return teks;
      const kecil = new Set(['dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'yang', 'pada', 'dalam', 'atau',
        'adalah', 'antara', 'terhadap', 'melalui', 'secara', 'serta', 'bagi', 'oleh', 'kepada', 'tentang',
        'hingga', 'sebagai', 'akan', 'tidak', 'dapat', 'ini', 'itu']);
      const akronim = new Set(['spss', 'pt', 'rri', 'sdm', 'asn', 'umkm', 'bps', 'dst', 'dpr', 'dprd', 'bumn',
        'bumd', 'kkn', 'kti', 'ui', 'ugm', 'itb', 'ipb', 'univ', 'vol', 'doi']);
      return teks.split(' ').map((w) => {
        const tanda = (w.match(/[.,;:]+$/) || [''])[0];
        const wl = w.toLowerCase().slice(0, w.length - tanda.length);
        if (kecil.has(wl)) return wl + tanda;
        if (akronim.has(wl)) return wl.toUpperCase() + tanda;
        return wl.charAt(0).toUpperCase() + wl.slice(1) + tanda;
      }).join(' ');
    };

    const H = (level: number, text: string, baris2?: string) => {
      const lvl = Math.min(Math.max(level, 1), 4);
      // sub-bab "1.1 Latar Belakang" → "1.1  Latar Belakang" (dua spasi, persis referensi)
      const teks = String(text).replace(/^(\d+(?:\.\d+)+)\.?\s+/, '$1  ');
      const gaya = { font: TNR, bold: true, size: lvl === 1 ? 28 : 24, color: '000000' };
      const runs = baris2
        ? [...runsTeks(teks, gaya), new TextRun({ break: 1, text: baris2, ...gaya })]
        : runsTeks(teks, gaya);
      C.push(new Paragraph({
        heading: HEADING_LV[lvl],
        pageBreakBefore: lvl === 1,
        alignment: lvl === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: runs,
      }));
    };

    // Teks markdown → runs: "**teks**" jadi teks biasa, "*teks*"/"_teks_" jadi italic sungguhan
    const runsTeks = (teks: string, opts: any = {}): any[] => {
      const out: any[] = [];
      const segs = String(teks).replace(/\*\*/g, '').split(/(\*[^*\n]{1,160}\*|_[^_\n]{1,160}_)/g);
      for (const s of segs) {
        if (!s) continue;
        const dalam = (s.length > 2 && s[0] === '*' && s[s.length - 1] === '*') ? s.slice(1, -1)
          : (s.length > 2 && s[0] === '_' && s[s.length - 1] === '_') ? s.slice(1, -1) : '';
        if (dalam) out.push(new TextRun({ text: dalam, font: TNR, size: 24, italics: true, ...opts }));
        else out.push(new TextRun({ text: s, font: TNR, size: 24, ...opts }));
      }
      return out;
    };

    // Paragraf biasa (rata kanan-kiri, spasi 1.5, indent 1 cm) + hyperlink URL/DOI
    const P = (text: string, opts: any = {}) => {
      const parts = String(text).split(/(https?:\/\/[^\s)<]+|(?:https?:\/\/)?doi\.org\/[^\s)<]+)/g);
      const runs: any[] = [];
      for (const seg of parts) {
        if (!seg) continue;
        if (/^(https?:\/\/|doi\.org\/)/.test(seg)) {
          const link = /^https?:\/\//.test(seg) ? seg : `https://${seg}`;
          runs.push(new ExternalHyperlink({ children: [new TextRun({ text: seg, style: 'Hyperlink', font: TNR, size: 24 })], link }));
        } else {
          runs.push(...runsTeks(seg));
        }
      }
      C.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360 },
        indent: opts.hang ? { left: 720, hanging: 720 } : { firstLine: 720 },
        children: runs,
      }));
    };

    const cell = (text: string, header = false) =>
      new TableCell({
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({ spacing: { line: 240 }, children: runsTeks(String(text || ''), { size: 22, bold: header }) })],
      });
    const tblBorders = {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    };

    // Blok daftar bernomor → reference unik per blok, supaya nomor RESTART antar-bagian
    // (paritas referensi: identifikasi 1-5, manfaat 1-2, batasan 1-4 — tidak nyambung)
    let blokNum = 0;
    const refDaftarNum = new Set<string>();

    // Bagan (kerangka berpikir dll.) → PNG kotak + panah via canvas —
    // paritas referensi yang menyisipkan 54 PNG; teks diambil dari blok markdown berpanah
    const gambarDiagram = async (items: string[]): Promise<{ buf: Uint8Array; w: number; h: number } | null> => {
      try {
        const { createCanvas, GlobalFonts } = await import('@napi-rs/canvas');
        if (!fontBaganOke) {
          fontBaganOke = true;
          try {
            const fsp = await import('node:fs');
            const pathp = await import('node:path');
            const nama = 'diagram-serif.ttf';
            const kandidat = [
              pathp.join(process.cwd(), 'fonts', nama),
              pathp.join(__dirname, '..', '..', 'fonts', nama),
            ];
            const fp = kandidat.find((p: string) => fsp.existsSync(p));
            if (fp) {
              for (const alias of ['Times New Roman', 'Liberation Serif', 'Nimbus Roman', 'serif']) {
                GlobalFonts.registerFromPath(fp, alias);
              }
            } else {
              console.warn('font bagan tidak ditemukan:', kandidat.join(' | '));
            }
          } catch (e) {
            console.warn('gagal mendaftarkan font bagan:', e);
          }
        }
        const isPanah = (t: string) => /^(↓|↑|→|←|⇒|➜|⟶|-->|->)$/.test(t.trim());
        const pecah = (teks: string): { k: 'n' | 'p'; t: string }[] => {
          const t = teks.trim();
          if (isPanah(t)) return [{ k: 'p', t }];
          const m = t.match(/^(.+?)\s*(↓|↑|→|←|⇒|➜|⟶|-->|->)\s*(.+)$/);
          if (!m) return [{ k: 'n', t }];
          return [...pecah(m[1]), { k: 'p', t: m[2] }, ...pecah(m[3])];
        };
        const seq: { k: 'n' | 'p'; t: string }[] = [];
        for (const raw of items) seq.push(...pecah(String(raw)));
        if (seq.filter((s) => s.k === 'n').length < 2 || !seq.some((s) => s.k === 'p')) return null;
        // rapikan: buang panah/node identik berurutan
        const rapi: { k: 'n' | 'p'; t: string }[] = [];
        for (const s of seq) {
          const akhir = rapi[rapi.length - 1];
          if (akhir && akhir.k === s.k && akhir.t === s.t) continue;
          if (s.k === 'p' && akhir && akhir.k === 'p') continue;
          rapi.push(s);
        }
        const skala = 2;
        const pxTeks = 15;
        const font = `${pxTeks}px "Times New Roman", "Liberation Serif", "Nimbus Roman", serif`;
        const probe = createCanvas(8, 8).getContext('2d');
        probe.font = font;
        const maksTeks = 400;
        const bungkus = (t: string): string[] => {
          if (probe.measureText(t).width <= maksTeks) return [t];
          const kata = t.split(' ');
          const baris: string[] = [];
          let kini = '';
          for (const k of kata) {
            const uji = kini ? `${kini} ${k}` : k;
            if (probe.measureText(uji).width <= maksTeks) kini = uji;
            else { if (kini) baris.push(kini); kini = k; }
          }
          if (kini) baris.push(kini);
          return baris.slice(0, 4);
        };
        const nodes = rapi.filter((s) => s.k === 'n').map((s) => ({ baris: bungkus(s.t) }));
        const lebarTeks = Math.max(...nodes.map((n) => Math.max(...n.baris.map((b) => probe.measureText(b).width))));
        const nodeW = Math.ceil(lebarTeks) + 36;
        const nBaris = Math.max(...nodes.map((n) => n.baris.length));
        const boxH = nBaris * 20 + 24;
        const panahLen = 34;
        const pad = 18;
        let vertikal = rapi.some((s) => s.k === 'p' && s.t !== '→' && s.t !== '←');
        let W: number, H: number;
        if (vertikal) {
          H = pad * 2;
          for (const s of rapi) H += s.k === 'n' ? boxH : panahLen + 12;
          W = nodeW + pad * 2;
        } else {
          H = boxH + pad * 2;
          W = pad * 2;
          for (const s of rapi) W += s.k === 'n' ? nodeW + 14 : 52;
          if (W > 540) { // terlalu lebar → tumpuk vertikal
            vertikal = true;
            H = pad * 2;
            for (const s of rapi) H += s.k === 'n' ? boxH : panahLen + 12;
            W = nodeW + pad * 2;
          }
        }
        const cv = createCanvas(Math.ceil(W * skala), Math.ceil(H * skala));
        const ctx = cv.getContext('2d');
        ctx.scale(skala, skala);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const gambarBox = (x: number, y: number, brs: string[]) => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, nodeW, boxH);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 0.75, y + 0.75, nodeW - 1.5, boxH - 1.5);
          ctx.fillStyle = '#000000';
          const cy = y + boxH / 2 - ((brs.length - 1) * 20) / 2;
          brs.forEach((b, k) => ctx.fillText(b, x + nodeW / 2, cy + k * 20));
        };
        const gambarPanah = (x1: number, y1: number, x2: number, y2: number) => {
          ctx.strokeStyle = '#000000';
          ctx.fillStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          const ang = Math.atan2(y2 - y1, x2 - x1);
          const p = 8;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - p * Math.cos(ang - 0.42), y2 - p * Math.sin(ang - 0.42));
          ctx.lineTo(x2 - p * Math.cos(ang + 0.42), y2 - p * Math.sin(ang + 0.42));
          ctx.closePath();
          ctx.fill();
        };
        let ni = 0;
        if (vertikal) {
          let y = pad;
          const cx = W / 2;
          for (const s of rapi) {
            if (s.k === 'n') { gambarBox(pad, y, nodes[ni].baris); ni++; y += boxH; }
            else {
              const keBawah = s.t !== '↑';
              gambarPanah(cx, keBawah ? y + 6 : y + panahLen + 6, cx, keBawah ? y + panahLen + 6 : y + 6);
              y += panahLen + 12;
            }
          }
        } else {
          let x = pad;
          const cy = H / 2;
          for (const s of rapi) {
            if (s.k === 'n') { gambarBox(x, pad, nodes[ni].baris); ni++; x += nodeW + 14; }
            else {
              const keKanan = s.t !== '←';
              gambarPanah(keKanan ? x + 4 : x + 44, cy, keKanan ? x + 44 : x + 4, cy);
              x += 52;
            }
          }
        }
        return { buf: cv.toBuffer('image/png'), w: Math.round(W), h: Math.round(H) };
      } catch {
        return null;
      }
    };

    // Parser markdown: heading (BAB / 1.1 / 1.1.1 / #), tabel, daftar, paragraf
    const mdBody = async (md: string, kunci = '') => {
      const lampiran = kunci === 'lampiran';
      const pakaiCustom = !!String(pr.custom_outline || '').trim();
      // Sub-judul H1 ("BAB II" ⏎ "Tinjauan Pustaka") mengikuti varian struktur proyek
      // — kualitatif "Kajian Pustaka", hukum "Tinjauan Pustaka dan Kerangka Teori", dst.
      const petaH1: Record<string, string> = {};
      for (const [id, b] of Object.entries(outlineFor(pr))) {
        const n = NOMOR_BAB[id] || 6;
        if (n >= 1 && n <= 5) petaH1[['', 'I', 'II', 'III', 'IV', 'V'][n]] = b.bab.replace(/^Bab\s+[IVX]+\s+/i, '');
      }
      // sub-bab lampiran: "6.1 …" → "Lampiran 1 …"; "6.1.1 …" → "L1.1 …" (ala referensi)
      const subJudul = (t: string, no: string) => {
        if (!lampiran) return `${no}  ${t}`;
        const b = no.split('.');
        return b.length >= 3 ? `L${b.slice(1).join('.')}  ${t}` : `Lampiran ${b[1] || ''}  ${t}`;
      };
      // Caption tabel/gambar per bab: "Tabel 2.1 Penelitian Terdahulu" — center, bold,
      // di ATAS objek + field SEQ (paritas referensi; menghidupkan Daftar Tabel/Gambar)
      let noBab = 0, nTabel = 0, nGambar = 0, judulAktif = '';
      const romawiKeAngka = (r: string) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].indexOf(r) + 1;
      const caption = (label: 'Tabel' | 'Gambar', n: number) => {
        // tanpa nomor bab (pustaka) ATAU isi lampiran → tanpa caption (paritas referensi)
        if (!noBab || lampiran) return;
        C.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60, line: 360 },
          children: [
            new TextRun({ text: `${label} ${noBab}.`, font: TNR, size: 24, bold: true }),
            new SimpleField(`SEQ ${label} \\s 1`, String(n)),
            new TextRun({ text: judulAktif ? ` ${judulAktif}` : '', font: TNR, size: 24, bold: true }),
          ],
        }));
      };
      // Sel tabel: pipe eksternal OPSIONAL ("a | b" atau "| a | b |") — sel kosong dipertahankan
      const selTabel = (s: string) => {
        const t = String(s || '').trim().replace(/^\|/, '').replace(/\|$/, '');
        return t.split('|').map((c) => c.trim());
      };
      const barisPemisah = (s: string) => {
        const p = selTabel(s);
        // AI kadang menulis ":--" (2 strip) — ikuti kelonggaran parser lama: minimal 1 strip
        return p.length >= 2 && p.every((c) => /^:?-+:?$/.test(c));
      };
      // Baris pendek kandidat blok bagan (untuk deteksi ↓/→)
      const pendek = (idx: number) => {
        const l = (lines[idx] || '').trim();
        return !!l && l.length <= 72
          && !/^(#{1,6}\s|BAB\s+[IVX]|\d+\.\d+\s|DAFTAR |LAMPIRAN\b|\|)/i.test(l.replace(/\*\*/g, ''));
      };
      let prevList = false; // baris sebelumnya bagian daftar → blok sama (nomor tidak restart)
      const pushNum = (teks: string, lvl: number) => {
        if (!prevList) { blokNum++; refDaftarNum.add(`daftar-num-${blokNum}`); }
        C.push(new Paragraph({
          numbering: { reference: `daftar-num-${blokNum}`, level: lvl },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360 },
          children: runsTeks(teks),
        }));
        prevList = true;
      };
      const lines = String(md || '').split('\n');
      let i = 0;
      while (i < lines.length) {
        const raw = lines[i];
        const line = raw.trim();
        if (!line || /^-{3,}$/.test(line)) { i++; continue; }
        // deteksi pola tanpa ** — judul sub-bab yang AI tulis bold tetap jadi heading
        const dt = line.replace(/\*\*/g, '');

        // Bagan (kerangka berpikir): run baris pendek berisi panah → PNG + caption
        if (pendek(i) && pendek(i + 1)) {
          let j = i;
          const run: string[] = [];
          while (j < lines.length && pendek(j) && run.length < 14) { run.push(lines[j].trim()); j++; }
          const kandidat = [...run];
          while (kandidat.length > 1 && /[.!?]$/.test(kandidat[0])) kandidat.shift();
          while (kandidat.length > 1 && /[.!?]$/.test(kandidat[kandidat.length - 1])) kandidat.pop();
          const adaPanah = kandidat.some((t) => /(↓|↑|→|←|⇒|➜|⟶|-->|->)/.test(t));
          const kotak = kandidat.filter((t) => !/^(↓|↑|→|←|⇒|➜|⟶|-->|->)$/.test(t));
          if (adaPanah && kotak.length >= 2) {
            const gbr = await gambarDiagram(kandidat);
            if (gbr) {
              nGambar++;
              caption('Gambar', nGambar);
              C.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 120 },
                children: [new ImageRun({ type: 'png', data: gbr.buf, transformation: { width: gbr.w, height: gbr.h } })],
              }));
              i = j; prevList = false; continue;
            }
          }
        }

        // Tabel markdown — pipe eksternal opsional: "No | Nama | …" + "---|---|…"
        if (dt.includes('|') && i + 1 < lines.length && barisPemisah(lines[i + 1])) {
          const cols = selTabel(dt);
          const rows: string[][] = [];
          i += 2;
          while (i < lines.length && lines[i].trim() && lines[i].includes('|')
            && !/^(#{1,6}\s|BAB\s+[IVX]|DAFTAR |LAMPIRAN\b)/i.test(lines[i].trim())) {
            rows.push(selTabel(lines[i].replace(/\*\*/g, '')));
            i++;
          }
          const jJudul = cols.findIndex((c) => /judul/i.test(c));
          nTabel++;
          caption('Tabel', nTabel);
          C.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tblBorders,
            rows: [
              new TableRow({ tableHeader: true, children: cols.map((c) => cell(c, true)) }),
              ...rows.map((r) => new TableRow({
                children: cols.map((_, k) => cell(jJudul >= 0 && r[k] ? rapikanJudul(r[k]) : (r[k] || ''))),
              })),
            ],
          }));
          C.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
          prevList = false;
          continue;
        }

        // Heading markdown "#" — level mengikuti nomor sub-bab bila ada (hierarki paritas referensi)
        const mh = dt.match(/^(#{1,6})\s+(.*)$/);
        if (mh) {
          const judul = mh[2].trim();
          const mno = judul.match(/^(\d+(?:\.\d+)+)\.?\s+(\S.*)$/);
          if (mno) {
            if (mno[1].split('.').length <= 2) judulAktif = mno[2].trim();
            H(Math.min(mno[1].split('.').length, 4), subJudul(mno[2], mno[1]));
          } else H(mh[1].length, judul);
          i++; prevList = false; continue;
        }

        // Judul bab: "BAB II TINJAUAN PUSTAKA" / "BAB I" + sub-judul baris berikut ("PENDAHULUAN")
        // → H1 dua baris "BAB II" ⏎ "Tinjauan Pustaka" (caps via style Heading1, seperti referensi)
        // Baris berikut juga dikonsumsi bila IDENTIK dengan sub judul (mencegah duplikat
        // "Tinjauan Pustaka" paragraf kembar setelah H1) atau bila huruf besar semua.
        // Saat H1 bab BELUM terbit (noBab 0), judul bab yang dibold AI ("**BAB II …**") juga
        // dikenali; entri sistematika "**BAB I PENDAHULUAN**" selalu datang SETELAH H1 → tetap paragraf.
        const kandidatBab = noBab === 0 ? dt : line;
        const mbab = kandidatBab.match(/^(BAB\s+[IVX]+)(?:\s+(.*))?$/i);
        if (mbab && kandidatBab.length < 140) {
          const romawi = mbab[1].replace(/^BAB\s+/i, '').toUpperCase();
          const nomor = `BAB ${romawi}`;
          let sisa = (mbab[2] || '').replace(/\*\*/g, '').trim();
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          const berikut = (lines[j] || '').replace(/[#*`]/g, '').trim();
          const subAwal = pakaiCustom && sisa ? titleCase(sisa) : (petaH1[romawi] || (sisa ? titleCase(sisa) : ''));
          const kecuali = /^(BAB\s+[IVX]+\b|DAFTAR\s+PUSTAKA\b|LAMPIRAN\b|\d+(?:\.\d+)+\.?\s|\||#)/;
          const layak = !!berikut && berikut.length < 60 && !kecuali.test(berikut);
          const judulSama = layak && !!subAwal && berikut.toLowerCase() === subAwal.toLowerCase();
          const hurufBesar = layak && berikut === berikut.toUpperCase() && /[A-Z]/.test(berikut);
          if (judulSama || hurufBesar) {
            if (!sisa) sisa = berikut;
            i = j;
          }
          const sub = pakaiCustom && sisa ? titleCase(sisa) : (petaH1[romawi] || (sisa ? titleCase(sisa) : ''));
          H(1, nomor, sub || undefined);
          noBab = romawiKeAngka(romawi); nTabel = 0; nGambar = 0; judulAktif = '';
          i++; prevList = false; continue;
        }

        // Daftar pustaka global / lampiran
        if (/^(DAFTAR PUSTAKA|LAMPIRAN)\b/i.test(dt) && dt.length < 120) {
          H(1, lampiran && /^LAMPIRAN/i.test(dt) ? 'LAMPIRAN' : dt);
          noBab = 0; nTabel = 0; nGambar = 0; judulAktif = '';
          i++; prevList = false; continue;
        }

        // Sub-bab bernomor: 1.1 → H2 (ikut TOC 1-2), 1.1.1 → H3, 1.1.1.1 → H4 — persis hierarki referensi
        // dt: nomor sub-bab yang dibold AI ("**6.1. Judul**") tetap terdeteksi — perbaikan penomoran
        const mn = dt.match(/^(\d+(?:\.\d+)+)\.?\s+(\S.*)$/);
        if (mn && dt.length < 130) {
          const level = Math.min(mn[1].split('.').length, 4);
          if (level <= 2) judulAktif = mn[2].trim();
          H(level, subJudul(mn[2], mn[1]));
          i++; prevList = false; continue;
        }

        // Daftar bullet / bernomor → ListParagraph — indentasi markdown jadi level nesting;
        // tiap blok bernomor memakai reference unik supaya nomor restart antar-bagian
        if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
          const num = /^\d+\.\s+/.test(line);
          const ind = (raw.match(/^[ \t]*/) || [''])[0].length;
          const lvl = ind >= 2 ? 1 : 0;
          const isi = line.replace(/^([-*•]|\d+\.)\s+/, '');
          if (num) pushNum(isi, lvl);
          else {
            C.push(new Paragraph({
              numbering: { reference: 'daftar-bullet', level: lvl },
              alignment: AlignmentType.JUSTIFIED,
              spacing: { line: 360 },
              children: runsTeks(isi),
            }));
            prevList = true;
          }
          i++; continue;
        }

        // Rumus pendek → ditengahkan spasi tunggal (referensi menampilkan rumus sebagai gambar)
        if (line.length < 70 && /^[A-Za-z][A-Za-z0-9²³]{0,3}\s*=\s*\S/.test(line)) {
          C.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240 },
            children: [new TextRun({ text: line.replace(/\*\*/g, ''), font: TNR, size: 24 })],
          }));
          i++; prevList = false; continue;
        }

        // Caption buatan AI ("Tabel 2.1 …") dibuang — sistem membuat penomoran sendiri
        if (/^(Tabel|Gambar)\s+\d+(\.\d+)*\.?\s+[A-Z][^.?!]{2,90}$/.test(dt)) {
          i++; prevList = false; continue;
        }

        // Rumusan masalah: paragraf pertanyaan → daftar bernomor (paritas referensi)
        if (/\brumusan masalah\b/i.test(judulAktif)
          && /^(Bagaimana|Apakah|Siapa|Kapan|Dimana|Di mana|Mengapa|Berapa|Seberapa)\b/.test(line)
          && /\?\s*$/.test(line) && line.length < 600) {
          pushNum(dt, 0);
          i++; continue;
        }

        P(line);
        prevList = false;
        i++;
      }
    };

    const paras = (text: string) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => P(l));

    /* ---------------- 1. Sampul ---------------- */
    const cover: any[] = [
      center(jenisSelected.toUpperCase(), { bold: true, size: 28, before: 600 }),
      center(''),
      center(judul.toUpperCase(), { bold: true, size: 28, before: 240 }),
      center(''),
      center('Diajukan untuk memenuhi salah satu syarat memperoleh gelar akademik', { before: 240 }),
      center(''),
      center('Disusun oleh:', { before: 480 }),
      center(nama, { bold: true }),
      center(nim ? `NIM. ${nim}` : ''),
      center(''),
      center(jurusan.toUpperCase(), { bold: true, before: 480 }),
      center(fakultas.toUpperCase(), { bold: true }),
      center(kampus.toUpperCase(), { bold: true }),
      center(String(tahun), { bold: true }),
    ];

    /* ---------------- 2. Front matter (9 H1, penomoran romawi) ---------------- */
    const front: any[] = [];
    const pushFront = () => { front.push(...C.splice(0, C.length)); };

    H(1, 'KATA PENGANTAR');
    paras(
      `Puji dan syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa atas berkat dan rahmat-Nya sehingga penulis dapat menyelesaikan ${jenisSelected.toLowerCase()} yang berjudul "${judul}".\n\n` +
      `${jenisSelected} ini disusun untuk memenuhi salah satu syarat memperoleh gelar pada ${jurusan || '-'} ${kampus}.\n\n` +
      'Penulis menyadari bahwa penyusunan karya ini tidak lepas dari bantuan berbagai pihak. Oleh karena itu, penulis mengucapkan terima kasih kepada semua pihak yang telah memberikan bimbingan, dukungan, dan doa.\n\n' +
      'Penulis menyadari masih terdapat kekurangan dalam karya ini. Kritik dan saran yang membangun sangat penulis harapkan demi perbaikan di masa mendatang. Semoga karya ini bermanfaat.\n\n' +
      `(Kota), ${tahun}\nPenulis,\n${nama}`
    );
    pushFront();

    H(1, 'LEMBAR PERSETUJUAN');
    paras(
      `${jenisSelected} dengan judul:\n"${judul}"\n` +
      `yang disusun oleh ${nama}, NIM ${nim}, Program Studi ${jurusan}, telah diperiksa dan disetujui oleh dosen pembimbing untuk diujikan dalam sidang ${jenisSelected.toLowerCase()}.\n\n` +
      'Menyetujui,\nDosen Pembimbing\n(........................................)'
    );
    pushFront();

    H(1, 'LEMBAR PENGESAHAN');
    paras(
      `${jenisSelected} dengan judul:\n"${judul}"\n` +
      `yang disusun oleh ${nama}, NIM ${nim}, Program Studi ${jurusan}, telah dipertahankan di depan dewan penguji dan disahkan sebagai salah satu syarat memperoleh gelar pada ${jurusan} ${kampus}.\n\n` +
      'Mengesahkan,\nDosen Pembimbing\n(........................................)\n\n' +
      'Mengetahui,\n' +
      `Ketua ${jurusan}\n(........................................)`
    );
    pushFront();

    H(1, 'LEMBAR PERNYATAAN KEASLIAN');
    paras(
      'Yang bertanda tangan di bawah ini:\n' +
      `Nama : ${nama}\nNIM : ${nim}\nProgram Studi : ${jurusan}\n` +
      `Dengan ini menyatakan bahwa ${jenisSelected.toLowerCase()} yang berjudul "${judul}" adalah benar-benar hasil karya sendiri dan bukan merupakan plagiat dari karya orang lain. Apabila di kemudian hari terbukti sebaliknya, penulis bersedia menerima sanksi sesuai ketentuan yang berlaku.\n\n` +
      `(Kota), ${tahun}\nYang menyatakan,\n${nama}\n${nim}`
    );
    pushFront();

    H(1, 'ABSTRAK');
    if (pr.content?.abstrak) paras(pr.content.abstrak);
    else paras('Abstrak dibuat setelah penelitian selesai. Lanjutkan ke Bab IV–V lebih dulu; abstrak lalu tergenerate otomatis. Bisa juga ditulis sendiri — klik teks ini untuk mengetik.');
    pushFront();

    H(1, 'ABSTRACT');
    paras('The abstract is written after the research is completed. Continue to Chapters IV-V first; the abstract will then be generated automatically. You can also write it yourself — click this text to type.');
    pushFront();

    const tocHint = () => C.push(new Paragraph({ children: [new TextRun({ text: CATATAN_FIELD, font: TNR, italics: true, color: '808080', size: 24 })] }));

    H(1, 'DAFTAR ISI');
    C.push(new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: '1-2', beginDirty: true }));
    tocHint();
    pushFront();

    H(1, 'DAFTAR GAMBAR');
    C.push(new TableOfContents('Daftar Gambar', { hyperlink: true, captionLabel: 'Gambar', beginDirty: true }));
    tocHint();
    pushFront();

    H(1, 'DAFTAR TABEL');
    C.push(new TableOfContents('Daftar Tabel', { hyperlink: true, captionLabel: 'Tabel', beginDirty: true }));
    tocHint();
    pushFront();

    /* ---------------- 3. Isi: BAB → Daftar Pustaka → Lampiran ---------------- */
    C.length = 0;
    const isiBab = async (kunci: string) => {
      // Blok "Daftar Pustaka Bab Ini" + entri per-bab selalu di akhir konten bab dan
      // tidak ada pada dokumen referensi → dibuang total (DAFTAR PUSTAKA global sudah ada)
      const buangPustaka = (s: string) => {
        const baris = String(s || '').split('\n');
        const idx = baris.findIndex((l) => /^daftar pustaka bab ini$/i.test(l.replace(/[#*_`]/g, '').trim()));
        return (idx >= 0 ? baris.slice(0, idx) : baris).join('\n');
      };
      const utama = buangPustaka(pr.content?.[kunci] || '');
      const subs = Object.entries(pr.content || {})
        .filter(([k]) => k.startsWith(`${kunci}:`))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => buangPustaka(String(v)))
        .filter((v) => v && !utama.includes(v.slice(0, 120)));
      const gabung = [utama, ...subs].filter(Boolean).join('\n\n');
      if (gabung.trim()) await mdBody(gabung, kunci);
    };
    for (const b of ['bab1', 'bab2', 'bab3', 'bab4', 'bab5']) await isiBab(b);

    // Daftar Pustaka: unggahan user dulu, lalu Crossref by judul
    const custom: any[] = Array.isArray(ident.refs) ? ident.refs : [];
    let refs: any[] = [];
    try { refs = [...custom, ...(await crossrefTop(judul, 40, pr.min_year))]; } catch { refs = custom; }
    if (refs.length) {
      H(1, 'DAFTAR PUSTAKA');
      for (const r of refs) {
        const kepala = `${r.authors || ''} (${r.year || 't.t.'}). ${rapikanJudul(r.title || '')}.`.replace(/\s+/g, ' ').trim();
        const sisa = [r.jurnal, r.doi ? '' : r.url].filter(Boolean).join('. ');
        P(`${kepala}${sisa ? ` ${sisa}.` : ''}`.trim(), { hang: true });
        if (r.doi) P(`https://doi.org/${r.doi}`, { hang: true });
      }
    }

    if (pr.content?.lampiran) await isiBab('lampiran');
    const isi: any[] = [...C.splice(0, C.length)];

    /* ---------------- Footer: PAGE + disclaimer AI (italik abu 6pt) ---------------- */
    const footerNomor = new Footer({
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: DISCLAIMER, font: TNR, italics: true, color: '999999', size: 12 })] }),
      ],
    });
    const footerKosong = new Footer({ children: [new Paragraph({ children: [new TextRun({ text: '', font: TNR, size: 24 })] })] });
    const pageSize = { width: 11905, height: 16837 };
    const margin = { top: 1700, right: 1700, bottom: 1700, left: 2267, header: 708, footer: 708 };

    const doc = new Document({
      creator: 'Skripsi Palembang',
      title: judul,
      description: `${jenisSelected} — ${judul}`,
      styles: {
        default: {
          document: {
            run: { font: TNR, size: 24 },
            // docDefaults referensi: spasi 1.5, before/after 0 — membuat TOC & paragraf tanpa
            // spacing eksplisit ikut 1.5 (TOC jadi renggang seperti referensi)
            paragraph: { spacing: { before: 0, after: 0, line: 360 } },
          },
        },
        paragraphStyles: [
          // Persis gaya efektif referensi (set kedua): hitam bold, H1 14pt center + caps,
          // H2/3/4 12pt left, semua line 360
          { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: TNR, bold: true, size: 28, color: '000000', allCaps: true },
            paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240, line: 360 } } },
          { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: TNR, bold: true, size: 24, color: '000000' },
            paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 120, after: 60, line: 360 } } },
          { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: TNR, bold: true, size: 24, color: '000000' },
            paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 60, after: 60, line: 360 } } },
          { id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { font: TNR, bold: true, size: 24, color: '000000' },
            paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 60, after: 60, line: 360 } } },
        ],
      },
      numbering: {
        config: [
          { reference: 'daftar-bullet', levels: [
            { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          ] },
          // Satu reference per blok daftar bernomor → tiap blok mulai dari 1 (restart)
          ...[...refDaftarNum].map((reference) => ({
            reference,
            levels: [
              { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
              { level: 1, format: LevelFormat.DECIMAL, text: '%2.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
            ],
          })),
        ] as any,
      },
      sections: [
        // Sampul — tanpa nomor halaman
        { properties: { page: { size: pageSize, margin } }, footers: { default: footerKosong }, children: cover },
        // Front matter — romawi, mulai 1
        { properties: { type: SectionType.NEXT_PAGE, page: { size: pageSize, margin, pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } } }, footers: { default: footerNomor }, children: front },
        // Isi — desimal, mulai 1
        { properties: { type: SectionType.NEXT_PAGE, page: { size: pageSize, margin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } }, footers: { default: footerNomor }, children: isi },
      ],
    });
    const buf = await Packer.toBuffer(doc);
    const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'naskah';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="proposal-${pr.jenis || 'skripsi'}-${slug}.docx"`);
    res.send(Buffer.from(buf));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ---------------------------------------------------------------------------
// Helpers: ambil / ganti satu sub-bab di dalam teks sebuah bab
// ---------------------------------------------------------------------------
const RE_SUB = /^\d+\.\d+(?:\.\d+)?\.?\s+\S/;

// Rapikan baris judul sebelum dites: buang bold/heading markdown ("**1.1. Judul**" -> "1.1. Judul")
const bersihBaris = (s: string) => s.replace(/[#*_`]/g, ' ').replace(/\s+/g, ' ').trim();

function batasBagian(lines: string[], start: number): number {
  for (let j = start + 1; j < lines.length; j++) {
    const t = bersihBaris(lines[j]);
    if (!t) continue;
    if (RE_SUB.test(t) || /^BAB\s+[IVX]+/i.test(t) || /^DAFTAR PUSTAKA/i.test(t)) return j;
  }
  return lines.length;
}

// Cari judul sub-babnya: baris pendek lebih dulu (mis. "2.6 Hipotesis"),
// biar paragraf biasa yang kebetulan menyebut kata kunci tidak dianggap judul.
function cariJudul(lines: string[], re: RegExp): number {
  const pendek = lines.findIndex((l) => { const t = bersihBaris(l); return t.length <= 110 && re.test(t); });
  if (pendek >= 0) return pendek;
  return lines.findIndex((l) => re.test(bersihBaris(l)));
}

function ambilBagian(text: string, re: RegExp): string {
  const lines = String(text || '').split('\n');
  const start = cariJudul(lines, re);
  if (start < 0) return '';
  return lines.slice(start + 1, batasBagian(lines, start)).join('\n').trim();
}

function gantiBagian(text: string, re: RegExp, body: string): string | null {
  const lines = String(text || '').split('\n');
  const start = cariJudul(lines, re);
  if (start < 0) return null;
  const end = batasBagian(lines, start);
  const isi = String(body || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!isi.length) return null;
  return [...lines.slice(0, start), lines[start], '', ...isi, '', ...lines.slice(end)]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

// Hapus satu sub-bab (judul + isinya) dari teks bab
function hapusBagian(text: string, re: RegExp): string | null {
  const lines = String(text || '').split('\n');
  const start = cariJudul(lines, re);
  if (start < 0) return null;
  const end = batasBagian(lines, start);
  return [...lines.slice(0, start), ...lines.slice(end)].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// Regex persis untuk judul sub-bab yang dikirim frontend ("1.1 Latar Belakang")
function reJudulSub(judul: string): RegExp {
  const esc = String(judul || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*${esc}\\s*$`);
}

function parseJson<T>(s: string, fallback: T): T {
  const t = String(s || '').replace(/```json/gi, '').replace(/```/g, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) return fallback;
  try { return JSON.parse(t.slice(a, b + 1)) as T; } catch { return fallback; }
}

function ambilTeks(content: any, keys: string[], perBab = 6000) {
  return keys.map((k) => (content?.[k] ? `\n=== ${k.toUpperCase()} ===\n${String(content[k]).slice(0, perBab)}` : '')).join('').slice(0, perBab * keys.length);
}

// Kembalikan kredit bila generate gagal / hasil tidak terbaca (sama seperti pola bab)
async function addCreditsRefund(userId: string, feature: string, ref: string) {
  try {
    const { addCredits, FEATURE_COSTS } = await import('../services/credits.service');
    await addCredits(userId, FEATURE_COSTS[feature] ?? 1, ref);
  } catch { /* abaikan */ }
}

// Tinjau Hasil (5 kredit): kelebihan, kekurangan & pertanyaan penguji dari draf sekarang
router.post('/:id/tinjau', requireAuthOrKey, async (req: AuthRequest, res) => {
  const id = String(req.params.id);
  try {
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    if (!pr.content || !Object.keys(pr.content).length) return res.status(400).json({ error: 'Belum ada bab yang bisa ditinjau. Generate minimal Bab I dulu.' });
    try {
      await consumeCredits(req.userId!, 'tinjau', `proyek:${id}:tinjau`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const teks = ambilTeks(pr.content, ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'abstrak', 'lampiran'], 5000);
    let out = '';
    try {
      out = await generateContent(
        `Kamu dosen pembimbing dan penguji skripsi yang kritis. Analisis draf skripsi berikut (judul: ${pr.judul}; metode: ${pr.metode}).\n` +
        `${teks.slice(0, 30000)}\n\n` +
        `Balas HANYA JSON valid tanpa teks lain, tanpa markdown, dengan struktur (ketiga kunci wajib ada dan berisi butir):\n` +
        `{"kelebihan":["3-5 butir spesifik yang sudah baik"],"kekurangan":["4-6 butir paling rawan diperiksa penguji, konkret + lokasi sub-babnya"],"pertanyaan":["4-6 pertanyaan penguji yang paling mungkin diajukan beserta inti jawabannya"]}`
      );
    } catch (e: any) {
      await addCreditsRefund(req.userId!, 'tinjau', `refund:${id}:tinjau-gagal`);
      throw e;
    }
    const j: any = parseJson(out, {});
    const rapih = (arr: any[]) => (Array.isArray(arr) ? arr : [])
      .map((x) => (typeof x === 'string'
        ? x
        : x && typeof x === 'object'
          ? String(x.pertanyaan ?? x.q ?? x.isi ?? x.tes ?? x.jawaban ?? x.teks ?? '')
          : ''))
      .map((x) => x.replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean).slice(0, 10);
    // Kunci JSON bisa berganti nama antar panggilan (model), jadi cari juga lewat token.
    const pick = (keys: string[], tokens: string[]) => {
      const low: Record<string, any> = {};
      for (const k of Object.keys(j || {})) low[String(k).toLowerCase().trim()] = j[k];
      for (const k of keys) {
        const v = j?.[k] ?? low[k.toLowerCase()];
        if (Array.isArray(v)) return v;
      }
      for (const [k, v] of Object.entries(low)) {
        if (Array.isArray(v) && tokens.some((t) => k.includes(t))) return v;
      }
      return [];
    };
    const hasil = {
      kelebihan: rapih(pick(['kelebihan', 'strengths'], ['kelebihan', 'strength'])),
      kekurangan: rapih(pick(['kekurangan', 'kelemahan', 'weaknesses'], ['kekurangan', 'kelemahan', 'weakness'])),
      pertanyaan: rapih(pick(['pertanyaan', 'pertanyaan_penguji', 'pertanyaan penelitian', 'questions'], ['pertanyaan', 'penguji', 'question'])),
    };
    // Bila bagian pertanyaan tidak ikut terkirim, minta ulang secara khusus (tanpa potong kredit).
    if (!hasil.pertanyaan.length) {
      try {
        const out2 = await generateContent(
          `Dari draf skripsi berikut (judul: ${pr.judul}; metode: ${pr.metode}), buatkan 4-6 pertanyaan penguji sidang yang paling mungkin diajukan beserta inti jawabannya.\n` +
          `${teks.slice(0, 8000)}\n\nBalas HANYA JSON valid: {"pertanyaan":["..."]}`
        );
        const j2: any = parseJson<any>(out2, {});
        const v = Array.isArray(j2.pertanyaan) ? j2.pertanyaan
          : Object.values(j2).find((x) => Array.isArray(x) && x.every((y: any) => typeof y === 'string' || typeof y === 'object')) || [];
        hasil.pertanyaan = rapih(v as any[]);
      } catch { /* biarkan kosong */ }
    }
    if (!hasil.kelebihan.length && !hasil.kekurangan.length) {
      await addCreditsRefund(req.userId!, 'tinjau', `refund:${id}:tinjau-gagal`);
      return res.status(502).json({ error: 'Hasil tinjauan tidak terbaca. Coba lagi.' });
    }
    res.json({ hasil });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Sesuaikan Skripsi (5 kredit): rapikan tujuan, hipotesis, kerangka konsep & Bab III
// agar selaras dengan rumusan masalah terbaru, lalu timpa bagiannya di naskah.
router.post('/:id/sesuaikan', requireAuthOrKey, async (req: AuthRequest, res) => {
  const id = String(req.params.id);
  try {
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const c = pr.content || {};
    const rumusan = ambilBagian(c.bab1 || '', /rumusan masalah/i);
    if (!rumusan) return res.status(400).json({ error: 'Rumusan Masalah belum ada di Bab I. Generate Bab I dulu, baru Sesuaikan Skripsi.' });
    if (!c.bab1 && !c.bab2 && !c.bab3) return res.status(400).json({ error: 'Belum ada Bab I–III untuk disesuaikan.' });
    try {
      await consumeCredits(req.userId!, 'sesuaikan', `proyek:${id}:sesuaikan`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }

    const hipotesis = ambilBagian(c.bab2 || '', /hipotesis/i);
    const kerangka = ambilBagian(c.bab2 || '', /kerangka (berpikir|teori|konsep)/i);
    let out = '';
    try {
      out = await generateContent(
        `Tugas: menyesuaikan bagian-bagian skripsi berikut agar selaras RUMUSAN MASALAH.\nJudul: ${pr.judul}\nMetode: ${pr.metode}\n\n` +
        `--- RUMUSAN MASALAH (Bab I) ---\n${rumusan.slice(0, 4000)}\n\n` +
        `--- TUJUAN PENELITIAN saat ini ---\n${ambilBagian(c.bab1 || '', /tujuan penelitian/i).slice(0, 2000) || '(belum ada)'}\n\n` +
        `--- HIPOTESIS saat ini ---\n${hipotesis.slice(0, 2000) || '(belum ada)'}\n\n` +
        `--- KERANGKA BERPIKIR saat ini ---\n${kerangka.slice(0, 2000) || '(belum ada)'}\n\n` +
        `--- BAB III (metode) ---\n${String(c.bab3 || '').slice(0, 6000) || '(belum ada)'}\n\n` +
        `Balas HANYA JSON valid tanpa markdown, tanpa penjelasan:\n` +
        `{"tujuan":"isi paragraf tujuan penelitian baru (tanpa judul sub-bab), tiap butik rumusan masalah sejajar","hipotesis":"isi hipotesis baru tanpa judul sub-bab (kosong bila kualitatif/hipotesis tidak ada)","kerangka":"isi kerangka berpikir baru tanpa judul sub-bab","catatan_bab3":["3-5 butir penyesuaian Bab III yang perlu kamu lakukan manual"]}`
      );
    } catch (e: any) {
      await addCreditsRefund(req.userId!, 'sesuaikan', `refund:${id}:sesuaikan-gagal`);
      throw e;
    }
    const j: any = parseJson(out, {});

    const baru: Record<string, string> = {};
    const diterapkan: { key: string; judul: string }[] = [];
    const pasang = (key: string, re: RegExp, judul: string, body: any) => {
      const teks = Array.isArray(body) ? body.join('\n\n') : String(body || '').trim();
      if (!teks) return;
      const g = gantiBagian(String(baru[key] ?? c[key] ?? ''), re, teks);
      if (g) { baru[key] = g; diterapkan.push({ key, judul }); }
    };
    pasang('bab1', /tujuan penelitian/i, '1.x Tujuan Penelitian (Bab I)', j.tujuan);
    if (c.bab2) {
      pasang('bab2', /hipotesis/i, 'Hipotesis (Bab II)', j.hipotesis);
      pasang('bab2', /kerangka (berpikir|teori|konsep)/i, 'Kerangka Berpikir (Bab II)', j.kerangka);
    }

    if (!diterapkan.length) {
      await addCreditsRefund(req.userId!, 'sesuaikan', `refund:${id}:sesuaikan-tidak-diterapkan`);
      return res.status(422).json({
        error: 'Sub-bab Tujuan Penelitian/Hipotesis/Kerangka tidak ditemukan di naskah, jadi belum ada yang ditimpa. Kredit dikembalikan.',
        catatan: (j.catatan_bab3 || []).filter((x: any) => typeof x === 'string'),
      });
    }

    const content = { ...c, ...baru };
    const { error: e2 } = await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    if (e2) throw new Error(e2.message);
    res.json({
      ok: true,
      diterapkan,
      catatan: (j.catatan_bab3 || []).filter((x: any) => typeof x === 'string').slice(0, 8),
      isi: { tujuan: String(j.tujuan || ''), hipotesis: String(j.hipotesis || ''), kerangka: String(j.kerangka || '') },
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Cek Sitasi (GRATIS): deteksi sitasi "yatim" (tidak ada di daftar referensi proyek)
router.post('/:id/cek-sitasi', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const c = pr.content || {};
    const teks = ambilTeks(c, ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'abstrak', 'lampiran', 'artikel', 'karil'], 40000);

    // 1) Kumpulkan sitasi: (Penulis, Tahun) termasuk gabungan (A, 2020; B, 2018) dan gaya naratif Penulis (2020)
    const unik = new Map<string, { penulis: string; tahun: string }>();
    const simpan = (raw: string, penulis: string, tahun: string) => {
      const k = raw.trim().replace(/\s+/g, ' ');
      if (k.length < 6 || !/^(19|20)\d{2}$/.test(tahun)) return;
      if (!unik.has(k)) unik.set(k, { penulis: penulis.trim(), tahun });
    };
    for (const g of teks.match(/\([^()]{1,200}\)/g) || []) {
      if (!/\b(19|20)\d{2}\b/.test(g)) continue;
      for (const potong of g.slice(1, -1).split(';')) {
        const t = potong.trim().replace(/\s+/g, ' ');
        const m = t.match(/^(.{2,70}?)\s*,?\s+((?:19|20)\d{2})[a-z]?$/i);
        if (m && m[1].length > 1) simpan(t, m[1], m[2]);
      }
    }
    const nar = [...teks.matchAll(/\b([\p{L}][\p{L}'’.-]{2,30}(?:\s+(?:dkk\.?|et al\.?|dll\.?))?)\s+\(((?:19|20)\d{2})[a-z]?\)/gu)];
    for (const m of nar) simpan(`${m[1]}, ${m[2]}`, m[1], m[2]);

    const daftar = [...unik.entries()].slice(0, 300).map(([raw, v]) => ({ raw, ...v }));
    if (!daftar.length) return res.json({ total: 0, nyata: 0, perluDitinjau: 0, semuaCocok: true, temuan: [], catatan: 'Belum ada sitasi (Penulis, Tahun) di naskah.' });

    // 2) Cocokkan dengan Daftar Pustaka proyek (unggahan + Crossref by judul)
    const custom = Array.isArray(pr.identitas?.refs) ? pr.identitas.refs : [];
    const refs = [...custom, ...(await crossrefTop(pr.judul, 20, pr.min_year))];
    const nurut = (s: string) => String(s || '').toLowerCase().replace(/[^\p{L}\s]/gu, '');
    const kata = (s: string) => nurut(s).split(/\s+/).filter(Boolean);
    const cocokRef = (penulis: string, tahun: string) => {
      const p = kata(penulis).filter((w) => !['et', 'al', 'dkk', 'dll', 'dan', 'dkk', 'dengan', 'lain', 'the', 'of'].includes(w));
      const nama = p[0] || '';
      if (!nama) return null;
      return refs.find((r: any) => String(r.year || '') === tahun && p.every((w) => nurut(r.authors).includes(w))) || null;
    };

    const temuan = daftar.map((d) => {
      const r = cocokRef(d.penulis, d.tahun);
      return {
        raw: d.raw, penulis: d.penulis, tahun: d.tahun,
        status: r ? 'nyata' : 'yatim',
        dukungan: r ? (r.doi || r.url ? 'kuat' : 'lemah') : null,
        rujukan: r ? { title: r.title, authors: r.authors, year: r.year, doi: r.doi || '', url: r.url || '', sumber: r.sumber || 'crossref' } : null,
        saran: null as any,
      };
    });

    // 3) Sitasi yatim diverifikasi ke Crossref (maks 8) — boleh nyata di luar, tapi belum ada di Daftar Pustakamu
    const yatim = temuan.filter((t) => t.status === 'yatim').slice(0, 8);
    await Promise.all(yatim.map(async (t) => {
      const cari = await crossrefTop(`${t.penulis} ${t.tahun}`, 5, Number(t.tahun) || null);
      const nama = kata(t.penulis).filter((w) => !['et', 'al', 'dkk', 'dll', 'dan'].includes(w))[0] || '';
      const ada = cari.find((r) => String(r.year) === t.tahun && nurut(r.authors).includes(nama) && (r.title || '').length > 10);
      if (ada) { t.dukungan = 'lemah'; t.saran = { title: ada.title, authors: ada.authors, year: ada.year, doi: ada.doi, url: ada.url }; }
    }));

    const nyata = temuan.filter((t) => t.status === 'nyata').length;
    const perluDitinjau = temuan.length - nyata;
    res.json({
      total: temuan.length, nyata, perluDitinjau, semuaCocok: perluDitinjau === 0,
      temuan: [...temuan.filter((t) => t.status === 'yatim'), ...temuan.filter((t) => t.status === 'nyata')],
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ---------------------------------------------------------------------------
// Kontrol per-sub-bab (paritas MantraRiset): Perkaya & Hapus sub-bab
// ---------------------------------------------------------------------------
const NAMA_BAB: Record<string, string> = {
  bab1: 'Bab I', bab2: 'Bab II', bab3: 'Bab III', bab4: 'Bab IV', bab5: 'Bab V', lampiran: 'Lampiran',
};

// Cek biaya Perkaya: GRATIS sekali per bab, sesudahnya 1 kredit (sama seperti referensi)
router.post('/:id/perkaya/cek', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: 'bab tidak dikenal' });
    const { data: pr, error } = await db().from('projects').select('identitas').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const ident: any = pr.identitas || {};
    const sudahDipakai = !!ident.perkaya?.[bab];
    const { credits, plan } = await getBalance(req.userId!);
    const biaya = FEATURE_COSTS.perkaya ?? 1;
    res.json({
      ok: true,
      gratis: !sudahDipakai || plan === 'admin',
      biaya: plan === 'admin' ? 0 : biaya,
      namaBab: NAMA_BAB[bab],
      sisaKredit: credits,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Perdalam satu sub-bab: isi lama TIDAK diubah/dihapus — hanya paragraf tambahan baru
router.post('/:id/perkaya', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab, judul } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: 'bab tidak dikenal' });
    if (!judul || String(judul).length > 160) return res.status(400).json({ error: 'judul sub-bab tidak valid' });
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const teks = String((pr.content || {})[bab] || '');
    if (!teks) return res.status(400).json({ error: 'Bab ini belum digenerate.' });
    const re = reJudulSub(judul);
    const isiLama = ambilBagian(teks, re);
    if (!isiLama) return res.status(400).json({ error: `Sub-bab "${judul}" tidak ditemukan di naskah.` });

    // Jatah GRATIS sekali per bab (disimpan di identitas.perkaya), sesudahnya 1 kredit
    const ident: any = { ...(pr.identitas || {}) };
    const gratis = !ident.perkaya?.[bab];
    const { plan } = await getBalance(req.userId!);
    if (gratis) {
      ident.perkaya = { ...(ident.perkaya || {}), [bab]: true };
      await db().from('projects').update({ identitas: ident, updated_at: new Date().toISOString() }).eq('id', id);
    } else if (plan !== 'admin') {
      try {
        await consumeCredits(req.userId!, 'perkaya', `proyek:${id}:perkaya:${bab}`);
      } catch (e: any) {
        if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
        throw e;
      }
    }

    const refs = await crossrefTop(`${pr.judul} ${judul}`, 4, pr.min_year);
    let tambahan = '';
    try {
      tambahan = await generateContent(
        `Kamu memperdalam sub-bab "${judul}" (${NAMA_BAB[bab]}) dari skripsi berikut.\n` +
        `Judul: ${pr.judul}\nMetode: ${pr.metode}\nBahasa: ${pr.language || 'Indonesia'}\n\n` +
        `ISI SUB-BAB SEKARANG (yang sudah ada — jangan diulang kalimatnya):\n${isiLama}\n\n` +
        `Tulis HANYA paragraf TAMBAHAN baru (2-4 paragraf, 180-320 kata) yang memperdalam isi di atas: ` +
        `dimensi/indikator tambahan, pandangan ahli lain, contoh penerapan, serta data atau angka bila relevan. ` +
        `Jangan menyalin atau menyatakan ulang kalimat yang sudah ada, jangan membuat judul/penomoran baru. ` +
        `Gaya akademis Indonesia, paragraf rapi tanpa markdown.` +
        (refs.length ? `\nBoleh menarik referensi dari daftar ini dan sitasi dengan format (Penulis, Tahun):\n${refBlock(refs)}` : '')
      );
    } catch (e: any) {
      if (!gratis && plan !== 'admin') await addCreditsRefund(req.userId!, 'perkaya', `refund:${id}:perkaya-gagal`);
      return res.status(502).json({ error: e.message || 'Gagal memerdalam sub-bab. Kreditmu dikembalikan.' });
    }

    const isiBersih = String(tambahan || '').trim();
    if (!isiBersih) {
      if (!gratis && plan !== 'admin') await addCreditsRefund(req.userId!, 'perkaya', `refund:${id}:perkaya-kosong`);
      return res.status(502).json({ error: 'Hasil kosong. Kreditmu dikembalikan.' });
    }
    const baru = gantiBagian(teks, re, `${isiLama}\n\n${isiBersih}`);
    if (!baru) {
      if (!gratis && plan !== 'admin') await addCreditsRefund(req.userId!, 'perkaya', `refund:${id}:perkaya-gagal`);
      return res.status(502).json({ error: 'Gagal menyisipkan tambahan. Kreditmu dikembalikan.' });
    }
    await db().from('projects').update({ content: { ...pr.content, [bab]: baru }, updated_at: new Date().toISOString() }).eq('id', id);
    const { credits } = await getBalance(req.userId!);
    res.json({ ok: true, gratis, tambahan: isiBersih, content: baru, sisaKredit: credits });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Hapus satu sub-bab dari naskah (gratis — persis seperti referensi)
router.post('/:id/sub-bab/hapus', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab, judul } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: 'bab tidak dikenal' });
    if (!judul || String(judul).length > 160) return res.status(400).json({ error: 'judul sub-bab tidak valid' });
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const teks = String((pr.content || {})[bab] || '');
    if (!teks) return res.status(400).json({ error: 'Bab ini belum digenerate.' });
    const baru = hapusBagian(teks, reJudulSub(judul));
    if (baru === null) return res.status(404).json({ error: `Sub-bab "${judul}" tidak ditemukan di naskah.` });
    if (!baru.trim()) return res.status(400).json({ error: 'Tidak bisa menghapus sub-bab terakhir di bab ini. Hapus seluruh babnya lewat Generate Ulang.' });
    await db().from('projects').update({ content: { ...pr.content, [bab]: baru }, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ ok: true, content: baru });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
