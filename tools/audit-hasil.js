/* Audit mutu hasil generate — Skripsi Palembang (tanpa panggil AI / nol kuota)
 *
 * Patokan hasil terukur mantrariset (hasil-analisis-mantrariset/ANALISIS-GENERATE-PROPOSAL-TESIS.md):
 *   Bab I 33.047 · Bab II 55.811 · Bab III 41.351 · Lampiran 11.954 karakter
 * Target internal (prompt `TARGET KEDALAMAN`): Bab I ≥25.000 · Bab II ≥40.000 ·
 *   Bab III ≥30.000 · Bab IV ≥15.000 · Bab V ≥7.000 · Lampiran ≥9.000
 *
 * Jalankan:  node tools/audit-hasil.js <project-id>
 * Baca konten dari Supabase REST memakai backend/.env — aman dijalankan kapan saja.
 */
const fs = require('fs');
const path = require('path');

const TARGETS = { bab1: 25000, bab2: 40000, bab3: 30000, bab4: 15000, bab5: 7000, lampiran: 9000 };
// Tesis kuantitatif (struktur baru TEMPLATE TESIS): kuesioner pindah ke Lampiran,
// jadi BAB III wajar lebih ramping — patokan diset ke tinggi template (26.821 kar).
const TARGETS_TESIS_KUANT = { ...TARGETS, bab3: 25000 };
const REF = { bab1: 33047, bab2: 55811, bab3: 41351, lampiran: 11954 };

function env(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

const hasil = [];
const cek = (nama, ok, info, level = 'FAIL') => hasil.push({ nama, ok, info, level });
const selesai = (kode) => { process.exitCode = kode; return; };

(async () => {
  const id = process.argv[2];
  if (!id) { console.error('Pakai: node tools/audit-hasil.js <project-id>'); return selesai(2); }
  const url = env('SUPABASE_URL');
  const svc = env('SUPABASE_SERVICE_ROLE_KEY');
  const res = await fetch(`${url}/rest/v1/projects?id=eq.${id}&select=id,content,jenis,metode,tahap,judul`, {
    headers: { apikey: svc, Authorization: `Bearer ${svc}` },
  });
  if (!res.ok) { console.error('Supabase error', res.status, await res.text()); return selesai(2); }
  const rows = await res.json();
  if (!rows.length) { console.error('Proyek tidak ditemukan'); return selesai(2); }
  const p = rows[0];
  const kuant = /kuantitatif|mixed/i.test(p.metode || '');
  console.log(`Proyek : ${p.id}`);
  console.log(`Judul  : ${p.judul}`);
  console.log(`Jenis  : ${p.jenis} · ${p.metode} · ${p.tahap}`);
  console.log('');

  const content = p.content || {};
  const babs = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'lampiran'];
  // Struktur baku baru khusus tesis kuantitatif (TEMPLATE TESIS.docx) — cek menyesuaikan
  const tesisKuant = p.jenis === 'tesis' && kuant;

  for (const bab of babs) {
    const t = String(content[bab] || '');
    if (!t) {
      const info = (p.tahap === 'proposal' && (bab === 'bab4' || bab === 'bab5')) ? 'dikunci tahap proposal' : 'belum digenerate';
      cek(`${bab} ada`, false, info, (p.tahap === 'proposal' && (bab === 'bab4' || bab === 'bab5')) ? 'SKIP' : 'FAIL');
      continue;
    }
    const n = t.length;
    const target = tesisKuant ? TARGETS_TESIS_KUANT[bab] : TARGETS[bab];
    const ref = REF[bab];
    cek(`${bab} panjang ≥ ${target.toLocaleString('id-ID')}`, n >= target,
      `${n.toLocaleString('id-ID')} kar (${Math.round((n / target) * 100)}% target${ref ? `, ${Math.round((n / ref) * 100)}% referensi` : ''})`);

    // Larangan format (SITASI)
    const bold = (t.match(/\*\*/g) || []).length;
    cek(`${bab} tanpa **bold**`, bold === 0, `${bold} pasang **`);
    const caption = (t.match(/^(Tabel|Gambar)\s+\d+[.,]\d+/gm) || []).length;
    cek(`${bab} tanpa caption "Tabel x.y"`, caption === 0, `${caption} caption`);
    cek(`${bab} tanpa "Ilustratif"`, !/Ilustratif/.test(t), 'kata terlarang');

    // Struktur sub-bab
    const N = bab === 'lampiran' ? 6 : parseInt(bab.replace('bab', ''), 10);
    const subs = (t.match(new RegExp(`^${N}\\.\\d+\\s+\\S`, 'gm')) || []).length;
    const minSubs = bab === 'lampiran' ? 2 : (tesisKuant && bab === 'bab4' ? 2 : 3);
    cek(`${bab} sub-bab ≥ ${minSubs}`, subs >= minSubs, `${subs} sub-bab terdeteksi`);

    // Daftar Pustaka Bab Ini
    const adaDapus = /daftar pustaka bab ini/i.test(t);
    cek(`${bab} punya "Daftar Pustaka Bab Ini"`, adaDapus, adaDapus ? 'ada' : 'hilang');
    if (adaDapus) {
      const barisDapus = t.slice(t.search(/daftar pustaka bab ini/i));
      const entri = (barisDapus.match(/\((19|20)\d{2}[a-z]?\)\./g) || []).length;
      cek(`${bab} pustaka ≥ 8 entri`, entri >= 8, `${entri} entri`);
    }

    // Kualitas DOI
    const dois = t.match(/https:\/\/doi\.org\/[^\s)]+/g) || [];
    const rusak = dois.filter((d) => !/^https:\/\/doi\.org\/10\.\d{4,9}\/\S+$/.test(d));
    const preprint = dois.filter((d) => /osf\.io|psyarxiv|preprint/i.test(d));
    cek(`${bab} DOI valid format`, rusak.length === 0, rusak.length ? `${rusak.length} rusak: ${rusak[0]}` : `${dois.length} DOI`);
    if (preprint.length) cek(`${bab} hindari preprint (OSF)`, false, `${preprint.length} DOI preprint (kualitas rendah)`, 'WARN');
  }

  // Cek khas varian kuantitatif
  if (content.bab2 && kuant && !tesisKuant) {
    const t = String(content.bab2);
    cek('bab2 tabel Penelitian Terdahulu (5 kolom)', /\|\s*No\s*\|\s*Nama \(Tahun\)\s*\|\s*Judul\s*\|\s*Hasil\s*\|\s*Gap\s*\|/.test(t), 'header tabel');
    cek('bab2 punya Kerangka Berpikir', /Kerangka Berpikir/i.test(t), 'sub 2.5');
    cek('bab2 punya Hipotesis', /Hipotesis/i.test(t), 'sub 2.6');
    const tingkat = (t.match(/^(2\.1\.\d+\.)+/gm) || []).length + (t.match(/^2\.1\.\d+\.\d+\s/gm) || []).length;
    cek('bab2 sub-sub 5-tingkat ≥ 10', tingkat >= 10, `${tingkat} sub-sub 2.1.x.y`);
  }
  if (content.bab3 && kuant && !tesisKuant) {
    const t = String(content.bab3);
    cek('bab3 tabel Definisi Operasional 7 kolom', /\|\s*Variabel\s*\|\s*Definisi Konseptual\s*\|/.test(t), 'header tabel');
    cek('bab3 Gantt (Kegiatan + bulan)', /\|\s*No\s*\|\s*Kegiatan\s*\|/.test(t) && /(Januari|Februari|Maret)/.test(t), 'tabel jadwal');
    const kues = (t.match(/^3\.4\.\d+(\.\d+)?\s+\S/gm) || []).length;
    cek('bab3 kuesioner per variabel ≥ 3 sub', kues >= 3, `${kues} sub 3.4.x`);
  }

  // Cek khas struktur baku baru tesis kuantitatif (TEMPLATE TESIS.docx)
  if (content.bab2 && tesisKuant) {
    const t = String(content.bab2);
    cek('bab2 tabel Hasil Penelitian Relevan (6 kolom)', /\|\s*No\s*\|\s*Peneliti \(Tahun\)\s*\|\s*Judul Penelitian\s*\|\s*Persamaan\s*\|\s*Perbedaan\s*\|\s*Hasil Penelitian\s*\|/.test(t), 'header tabel');
    cek('bab2 punya Kerangka Berpikir', /Kerangka Berpikir/i.test(t), 'sub 2.3');
    cek('bab2 punya Hipotesis Penelitian', /Hipotesis Penelitian/i.test(t), 'sub 2.4');
    const subsub = (t.match(/^2\.1\.\d+\.\d+\s+\S/gm) || []).length;
    cek('bab2 sub-sub kajian per variabel ≥ 8', subsub >= 8, `${subsub} sub-sub 2.1.x.y`);
    const sintesis = (t.match(/dapat disimpulkan/gi) || []).length;
    cek('bab2 sintesis definisi ≥ 4', sintesis >= 4, `${sintesis} paragraf sintesis`);
  }
  if (content.bab3 && tesisKuant) {
    const t = String(content.bab3);
    const kisi = (t.match(/Dimensi\s*\|\s*Indikator\s*\|\s*No\.?\s*Item Pernyataan/g) || []).length;
    cek('bab3 kisi-kisi per variabel ≥ 4 tabel', kisi >= 4, `${kisi} tabel kisi-kisi`);
    cek('bab3 Gantt (Kegiatan + bulan)', /\|\s*No\s*\|\s*Kegiatan\s*\|/.test(t) && /(Januari|Februari|Maret)/.test(t), 'tabel jadwal di 3.1');
    cek('bab3 skala Likert 5 kategori', /Sangat Setuju \(SS\)/.test(t) && /Sangat Tidak Setuju \(STS\)/.test(t), 'SS s.d. STS');
    cek('bab3 penentuan sampel (Slovin/Purposive)', /Slovin|Purposive/i.test(t), 'rumus/teknik sampel');
  }
  if (content.bab4 && tesisKuant) {
    const t = String(content.bab4);
    cek('bab4 tabel uji hipotesis (Original Sample…)', /\|\s*Original Sample \(O\)\s*\|/.test(t) || /\|\s*Original Sample\s*\|/i.test(t), 'header tabel bootstrap/regresi');
    cek('bab4 pembahasan per hipotesis', /Hasil pengujian hipotesis|Pengaruh\s+.{3,80}?\s+terhadap/i.test(t), 'pembahasan H1..Hn');
    const angka41 = (t.match(/\b0,\d{3}\b/g) || []).length;
    cek('bab4 memuat angka hasil analisis', angka41 >= 10, `${angka41} angka koefisien`);
  }
  if (content.bab5 && tesisKuant) {
    const t = String(content.bab5);
    cek('bab5 punya Implikasi Kebijakan', /Implikasi Kebijakan/i.test(t), 'sub 5.2');
    cek('bab5 kesimpulan per rumusan', /kesimpulan dari penelitian ini|Berdasarkan perumusan masalah/i.test(t), 'pembuka 5.1');
  }
  if (content.lampiran && tesisKuant) {
    const t = String(content.lampiran);
    cek('lampiran punya kuesioner + screening', /penyaring|screening/i.test(t) && /Kuesioner/i.test(t), '6.1 Kuesioner');
    cek('lampiran opsi Likert checkbox', /☐/.test(t), 'kotak pilihan responden');
    cek('lampiran placeholder Turnitin jujur', /Turnitin/i.test(t) && !/persentase\s*:\s*\d+\s*%/i.test(t), 'tanpa angka similarity karangan');
  }

  // Ringkasan
  const gagal = hasil.filter((h) => !h.ok && h.level === 'FAIL');
  const warn = hasil.filter((h) => !h.ok && h.level === 'WARN');
  console.log('');
  for (const h of hasil) {
    const tanda = h.ok ? 'PASS' : h.level;
    console.log(`${tanda.padEnd(4)} | ${h.nama}${h.info ? ' — ' + h.info : ''}`);
  }
  console.log('');
  console.log(`=== SKOR: ${hasil.filter((h) => h.ok).length}/${hasil.length} lolos · ${gagal.length} gagal · ${warn.length} peringatan ===`);
  selesai(gagal.length ? 1 : 0);
})().catch((e) => { console.error('FATAL:', e); process.exitCode = 2; });
