/* Verifikasi format DOCX hasil ekspor (kaidah item 1–3 & paritas template).
 * Pakai:
 *   node tools/cek-docx.js <folder-ekstraksi>/word/document.xml [project-id]
 * Ekstraksi dulu:  powershell: Copy-Item x.docx x.zip; Expand-Archive x.zip x-dir
 * Pemeriksaan:
 *   - spasi 2 (line 480) untuk semua tulisan; spasi 1 (240) hanya caption/tabel/Sumber;
 *     TIDAK boleh ada sisa line 360 (spasi 1.5 lama)
 *   - TOC 3 tingkat (\o "1-3")
 *   - baris "Judul Tabel:" AI tidak tampil polos — sudah jadi caption "Tabel 3.1 <nama>"
 *     (daftar nama diambil dari konten proyek di DB bila project-id diberikan)
 *   - caption lampiran "Tabel L1"
 *   - label tanpa nomor dicetak TEBAL
 *   - paragraf "Sumber :" & caption memakai spasi 1
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
const pid = process.argv[3];
if (!file) { console.error('Pakai: node tools/cek-docx.js <path>/word/document.xml [project-id]'); process.exit(2); }
const xml = fs.readFileSync(file, 'utf8');

let gagal = 0, peringatan = 0;
const cek = (nama, ok, info, level = 'FAIL') => {
  if (ok) console.log(`PASS | ${nama} — ${info}`);
  else if (level === 'WARN') { peringatan++; console.log(`WARN | ${nama} — ${info}`); }
  else { gagal++; console.log(`FAIL | ${nama} — ${info}`); }
};
const n = (re) => (xml.match(re) || []).length;

function env(n) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const l = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((x) => x.startsWith(n + '='));
  return l ? l.slice(n.length + 1).trim() : '';
}

async function daftarJudulTabel() {
  if (!pid) return [];
  const H = { apikey: env('SUPABASE_SERVICE_ROLE_KEY'), Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}` };
  const j = await fetch(`${env('SUPABASE_URL')}/rest/v1/projects?id=eq.${pid}&select=content`, { headers: H }).then((r) => r.json());
  const c = (j[0] && j[0].content) || {};
  const out = [];
  for (const v of Object.values(c)) {
    for (const m of String(v).matchAll(/^Judul Tabel:\s*(.+)$/gm)) out.push(m[1].trim());
  }
  return out;
}

(async () => {
  /* —— Spasi (item 3) —— */
  const l480 = n(/w:line="480"/g), l240 = n(/w:line="240"/g), l360 = n(/w:line="360"/g);
  cek('spasi 2 (line 480) dipakai', l480 > 100, `${l480} lokasi`);
  cek('spasi 1 (line 240) untuk elemen tabel/caption/Sumber', l240 > 100, `${l240} lokasi`);
  cek('tanpa sisa spasi 1.5 (line 360)', l360 === 0, `${l360} lokasi`);

  /* —— TOC (item 1d): instr disimpan sebagai &quot;1-3&quot; —— */
  const tocOk = /\\o\s+(&quot;|")1-3(&quot;|")/.test(xml);
  cek('TOC 3 tingkat (\\o "1-3")', tocOk, tocOk ? 'field TOC 1-3' : 'belum 1-3');

  /* —— Judul tabel jadi caption (item 2).
         Caption: <w:t>Tabel 3.</w:t> lalu <w:fldSimple instr="SEQ Tabel \s 1"> → angka
         datang dari field, jadi "Tabel 3.1" tak pernah muncul literal. —— */
  cek('baris "Judul Tabel:" AI tak tampil polos', !xml.includes('Judul Tabel:'), `${n(/Judul Tabel:/g)} sisa`);
  const capBab = n(/Tabel 3\./g);
  cek('caption "Tabel 3." + field SEQ ada', capBab > 0 && n(/SEQ Tabel/g) >= capBab, `${capBab} caption bab-3 · ${n(/SEQ Tabel/g)} field SEQ`);
  let daftar = [];
  try { daftar = await daftarJudulTabel(); } catch (e) { console.log(`SKIP | ambil daftar Judul Tabel gagal (${e.message})`); }
  if (daftar.length) {
    const hilang = daftar.filter((x) => !xml.includes(x));
    cek('nama dari "Judul Tabel:" muncul sebagai caption', hilang.length === 0,
      hilang.length ? `${daftar.length - hilang.length}/${daftar.length} — hilang: ${hilang.map((x) => x.slice(0, 40)).join(' | ')}` : `${daftar.length}/${daftar.length} judul ditemukan`);
  } else console.log('SKIP | cek caption per nama (berikan argumen project-id ke-2)');
  const iL = xml.indexOf('Tabel L');
  const capL = iL >= 0 && xml.slice(iL, iL + 500).includes('SEQ Tabel');
  cek('caption lampiran "Tabel L" + field SEQ', capL, capL ? 'ada' : iL < 0 ? 'tidak ada' : 'ada "Tabel L" tanpa SEQ', capL ? 'FAIL' : 'WARN');

  /* —— Label tebal (item 1c) —— */
  const tebal = (teks) => {
    const i = xml.indexOf(teks);
    if (i < 0) return null;
    const start = Math.max(xml.lastIndexOf('<w:p ', i), xml.lastIndexOf('<w:p>', i));
    if (start < 0) return null;
    return xml.slice(start, i).includes('<w:b/>');
  };
  for (const label of ['KUESIONER UTAMA', 'Pertanyaan Penyaring (Screening Questions)', 'Identitas Responden']) {
    const b = tebal(label);
    if (b === null) console.log(`SKIP | label "${label}" — tidak ada di dokumen`);
    else cek(`label "${label}" TEBAL`, b === true, b ? 'bold ✓' : 'bukan bold');
  }

  /* —— Sumber & caption spasi 1 —— */
  const paragrafDi = (idx) => {
    const p = Math.max(xml.lastIndexOf('<w:p ', idx), xml.lastIndexOf('<w:p>', idx));
    const end = xml.indexOf('</w:p>', idx);
    return xml.slice(p, end + 6);
  };
  const iSumber = xml.indexOf('Sumber :');
  if (iSumber >= 0) {
    const par = paragrafDi(iSumber);
    cek('paragraf "Sumber :" spasi 1', par.includes('w:line="240"'), par.includes('w:line="240"') ? 'line 240' : 'bukan 240');
  } else console.log('SKIP | tidak ada paragraf "Sumber :"');
  const iCap = xml.search(/Tabel 3\./);
  if (iCap >= 0) {
    const par = paragrafDi(iCap);
    cek('caption tabel spasi 1 + bold', par.includes('w:line="240"') && par.includes('<w:b/>'),
      `${par.includes('w:line="240"') ? 'line240' : 'bukan240'}${par.includes('<w:b/>') ? '+bold' : '-bold'}`);
  }

  console.log('');
  console.log(gagal ? `=== ${gagal} GAGAL, ${peringatan} WARN ===` : `=== SEMUA LULUS (${peringatan} WARN) ===`);
  // Jangan process.exit() — mematikan paksa socket keep-alive fetch memicu
  // assertion libuv di Windows. Cukup set kode keluar, biarkan event loop selesai.
  process.exitCode = gagal ? 1 : 0;
})().catch((e) => { console.error('FATAL:', e); process.exitCode = 1; });
