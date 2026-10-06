/* Data varian struktur — diekstrak dari chunk mantrariset 5702-d00db968a5b82f86.js
   (kamus `d` + overlay `f`/`y`/`_`). Jangan diedit manual. */
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

// Overlay tesis: hanya untuk varian dalam METODE_OVERLAY (paritas fungsi P referensi)
const OVERLAY_TESIS: OverlayDef[] = [
  { bab: 'bab1', key: 'kebaruan_penelitian', label: 'Kebaruan Penelitian', before: ['sistematika_penulisan'] },
  { bab: 'bab3', key: 'etika_penelitian', label: 'Etika Penelitian', before: ['jadwal_penelitian'] },
  { bab: 'bab4', key: 'temuan_penelitian', label: 'Temuan Penelitian', before: ['pembahasan'] },
  { bab: 'bab4', key: 'implikasi_teoretis', label: 'Implikasi Teoretis', before: ['keterbatasan_penelitian'], after: ['pembahasan'] },
  { bab: 'bab5', key: 'agenda_penelitian', label: 'Agenda Penelitian Lanjutan', after: ['saran'] },
];

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