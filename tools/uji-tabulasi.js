/* Uji API tabulasi Opsi A (tanpa membakar kuota AI):
 * login → upload .csv → upload .xlsx (2 sheet) → tolak ekstensi salah →
 * verifikasi content.tabulasi → DELETE → bersih. */
const path = require('path');
const XLSX = require(path.join(__dirname, '..', 'backend', 'node_modules', 'xlsx'));

for (const b of require('fs').readFileSync(path.join(__dirname, '..', 'backend', '.env'), 'utf8').split(/\r?\n/)) {
  const m = b.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}
const API = process.env.API || 'http://localhost:5000';
const ID = '200b68f5-0d1d-4249-a3f1-b84309ed9b08';
let lulus = 0, gagal = 0;
const cek = (nama, ok, info = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${nama}${info ? ' — ' + info : ''}`); ok ? lulus++ : gagal++; };

(async () => {
  const l = await fetch(process.env.SUPABASE_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: process.env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tester.palembang@gmail.com', password: '321_Palembangku' }),
  });
  const { access_token: tok } = await l.json();
  const H = { Authorization: 'Bearer ' + tok };
  const get = () => fetch(`${API}/api/projects/${ID}`, { headers: H }).then((r) => r.json());

  const awal = await get();
  const keysAwal = Object.keys(awal.item?.content || {}).sort();
  cek('proyek terbaca', !!awal.item, `keys: ${keysAwal.join(',')}`);

  // 1) upload CSV
  const csv = 'Uji Normalitas,Asymp. Sig.\nKolmogorov-Smirnov,0.043\nShapiro-Wilk,0.087\n\nUji t,Value,Sig. (2-tailed)\nVariabel X terhadap Y,4.521,0.000\n';
  const fd1 = new FormData();
  fd1.append('file', new Blob([csv], { type: 'text/csv' }), 'hasil-olah.csv');
  const r1 = await fetch(`${API}/api/projects/${ID}/tabulasi`, { method: 'POST', headers: H, body: fd1 });
  const j1 = await r1.json();
  cek('upload .csv', r1.ok && j1.ok && j1.chars > 50, `status=${r1.status} chars=${j1.chars} baris=${j1.baris}`);

  const p1 = await get();
  cek('tersimpan di content.tabulasi', String(p1.item?.content?.tabulasi || '').includes('0.043'));
  cek('kunci lain utuh (bab3/lampiran)', keysAwal.every((k) => (p1.item?.content || {})[k] !== undefined), `keys: ${Object.keys(p1.item?.content || {}).sort().join(',')}`);

  // 2) upload XLSX 2 sheet (dibuat di memori)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Uji', 'Sig.'], ['Normalitas', 0.043], ['Reliabilitas', 0.912]]), 'Uji');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Hipotesis', 'Nilai', 'Keputusan'], ['H1', 4.521, 'Diterima']]), 'Regresi');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const fd2 = new FormData();
  fd2.append('file', new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'tabulasi.xlsx');
  const r2 = await fetch(`${API}/api/projects/${ID}/tabulasi`, { method: 'POST', headers: H, body: fd2 });
  const j2 = await r2.json();
  const isi2 = String(j2.tabulasi || '');
  cek('upload .xlsx (2 sheet)', r2.ok && isi2.includes('[Sheet: Uji]') && isi2.includes('[Sheet: Regresi]') && isi2.includes('0.912'), `status=${r2.status} chars=${j2.chars}`);

  // 3) tolak ekstensi salah
  const fd3 = new FormData();
  fd3.append('file', new Blob(['bukan tabulasi'], { type: 'text/plain' }), 'catatan.txt');
  const r3 = await fetch(`${API}/api/projects/${ID}/tabulasi`, { method: 'POST', headers: H, body: fd3 });
  cek('tolak .txt (400)', r3.status === 400, `status=${r3.status}`);

  // 4) tolak tanpa file & tanpa csv
  const r4 = await fetch(`${API}/api/projects/${ID}/tabulasi`, { method: 'POST', headers: H });
  cek('tolak kosong (400)', r4.status === 400, `status=${r4.status}`);

  // 5) hapus → bersih
  const r5 = await fetch(`${API}/api/projects/${ID}/tabulasi`, { method: 'DELETE', headers: H });
  const j5 = await r5.json();
  const p6 = await get();
  const keysAkhir = Object.keys(p6.item?.content || {}).sort();
  cek('DELETE tabulasi', r5.ok && j5.ok && p6.item?.content?.tabulasi === undefined, `status=${r5.status}`);
  cek('kunci kembali persis seperti awal', JSON.stringify(keysAkhir) === JSON.stringify(keysAwal), `keys: ${keysAkhir.join(',')}`);

  console.log(`\n${lulus} PASS / ${gagal} FAIL`);
  process.exit(gagal ? 1 : 0);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
