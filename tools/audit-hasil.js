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

  for (const bab of babs) {
    const t = String(content[bab] || '');
    if (!t) {
      const info = (p.tahap === 'proposal' && (bab === 'bab4' || bab === 'bab5')) ? 'dikunci tahap proposal' : 'belum digenerate';
      cek(`${bab} ada`, false, info, (p.tahap === 'proposal' && (bab === 'bab4' || bab === 'bab5')) ? 'SKIP' : 'FAIL');
      continue;
    }
    const n = t.length;
    const target = TARGETS[bab];
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
    const minSubs = bab === 'lampiran' ? 2 : 3;
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
  if (content.bab2 && kuant) {
    const t = String(content.bab2);
    cek('bab2 tabel Penelitian Terdahulu (5 kolom)', /\|\s*No\s*\|\s*Nama \(Tahun\)\s*\|\s*Judul\s*\|\s*Hasil\s*\|\s*Gap\s*\|/.test(t), 'header tabel');
    cek('bab2 punya Kerangka Berpikir', /Kerangka Berpikir/i.test(t), 'sub 2.5');
    cek('bab2 punya Hipotesis', /Hipotesis/i.test(t), 'sub 2.6');
    const tingkat = (t.match(/^(2\.1\.\d+\.)+/gm) || []).length + (t.match(/^2\.1\.\d+\.\d+\s/gm) || []).length;
    cek('bab2 sub-sub 5-tingkat ≥ 10', tingkat >= 10, `${tingkat} sub-sub 2.1.x.y`);
  }
  if (content.bab3 && kuant) {
    const t = String(content.bab3);
    cek('bab3 tabel Definisi Operasional 7 kolom', /\|\s*Variabel\s*\|\s*Definisi Konseptual\s*\|/.test(t), 'header tabel');
    cek('bab3 Gantt (Kegiatan + bulan)', /\|\s*No\s*\|\s*Kegiatan\s*\|/.test(t) && /(Januari|Februari|Maret)/.test(t), 'tabel jadwal');
    const kues = (t.match(/^3\.4\.\d+(\.\d+)?\s+\S/gm) || []).length;
    cek('bab3 kuesioner per variabel ≥ 3 sub', kues >= 3, `${kues} sub 3.4.x`);
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
