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
// Paragraf pembungkus sebuah posisi di document.xml (untuk cek spasi/align/bold)
const paragrafDi = (idx) => {
  const p = Math.max(xml.lastIndexOf('<w:p ', idx), xml.lastIndexOf('<w:p>', idx));
  const end = xml.indexOf('</w:p>', idx);
  return xml.slice(p, end + 6);
};

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

  /* —— Judul tabel jadi caption (item 2) + Opsi A ——
         Caption: <w:t>Tabel 3.</w:t> lalu <w:fldSimple instr="SEQ Tabel \s 1"> → angka
         datang dari field, jadi "Tabel 3.1" tak pernah muncul literal.
         OPSI A (diputuskan owner — paritas contoh #4): paragraf "Judul Tabel: …" MEMANG
         sengaja dicetak — rata kiri, spasi 1 — persis di atas caption "Tabel n.n <judul>"
         dan objeknya; jadi keberadaannya justru wajib (bukan kegagalan). —— */
  const barisJudul = [...xml.matchAll(/<w:t[^>]*>(Judul (?:Tabel|Gambar): [^<]{2,400})<\/w:t>/g)];
  let judulRapi = barisJudul.length > 0; let jelek = 0;
  for (const mj of barisJudul) {
    const par = paragrafDi(mj.index);
    const sesudah = xml.slice(mj.index, mj.index + 1500);
    const adaCaption = /<w:t[^>]*>(Tabel|Gambar) /.test(sesudah) && /SEQ (Tabel|Gambar)/.test(sesudah);
    const ok = par.includes('w:line="240"') && /w:jc w:val="left"/.test(par) && adaCaption;
    if (!ok) { judulRapi = false; jelek++; }
  }
  cek('paragraf "Judul Tabel:" rata kiri spasi 1 + caption di bawahnya (Opsi A)', judulRapi,
    barisJudul.length ? `${barisJudul.length} paragraf · ${jelek} tidak rapi` : 'tidak ada sama sekali');
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

  /* —— Label tebal (item 1c) ——
         Label template dicetak sebagai SELURUH paragraf, jadi carinya sebagai run
         <w:t>…</w:t> yang isinya PERSIS sama dengan label — bukan kemunculan kata itu
         di tengah kalimat biasa (mis. "Petunjuk Pengisian Kuesioner Utama" yang ternyata
         paragraf uraian, bukan label). —— */
  const runTebal = (cari) => {
    const re = typeof cari === 'string'
      ? new RegExp(`^${cari.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : cari;
    for (const m of xml.matchAll(/<w:t[^>]*>([^<]{1,80})<\/w:t>/g)) {
      if (!re.test(m[1])) continue;
      const idx = m.index + m[0].indexOf(m[1]);
      const start = Math.max(xml.lastIndexOf('<w:p ', idx), xml.lastIndexOf('<w:p>', idx));
      return start < 0 ? null : xml.slice(start, idx).includes('<w:b/>');
    }
    return null;
  };
  for (const label of [/^Kuesioner (?:Variabel )?[A-Z][A-Za-z ]{0,40}(?: \([A-Z0-9]{1,4}\))?$/,
    'Pertanyaan Penyaring (Screening Questions)', 'Identitas Responden', 'Petunjuk Pengisian']) {
    const b = runTebal(label);
    const nama = typeof label === 'string' ? label : 'Kuesioner <Variabel>';
    if (b === null) console.log(`SKIP | label "${nama}" — tidak ada di dokumen`);
    else cek(`label "${nama}" TEBAL`, b === true, b ? 'bold ✓' : 'bukan bold');
  }
  // Label lampiran gaya baru (#20) wajib TEBAL + DIGARIS BAWAHI
  const reGaris = /^(?:Identitas\s+Responden(?:\s+\d+(?:-\d+)?)?|Petunjuk\s+Pengisian)$/i;
  let iGar = -1;
  for (const m of xml.matchAll(/<w:t[^>]*>([^<]{1,60})<\/w:t>/g)) {
    if (reGaris.test(m[1])) { iGar = m.index + m[0].indexOf(m[1]); break; }
  }
  if (iGar >= 0) {
    const par = paragrafDi(iGar);
    cek('label "IDENTITAS/PETUNJUK" tebal + digaris bawahi (#20)',
      par.includes('<w:b/>') && /<w:u w:val="single"/.test(par),
      `${par.includes('<w:b/>') ? 'bold' : '-bold'}/${/<w:u w:val="single"/.test(par) ? 'underline' : '-underline'}`);
  } else console.log('SKIP | label IDENTITAS/PETUNJUK tidak ada di dokumen');

  /* —— Sumber & caption spasi 1 —— */
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

  /* —— Batch tesis: hierarki daftar, nol bullet, <br>, superskrip/subskrip —— */
  const noPath = String(file).replace(/document\.xml$/i, 'numbering.xml');
  if (fs.existsSync(noPath)) {
    const nm = fs.readFileSync(noPath, 'utf8');
    const ada = (v) => nm.includes(`<w:lvlText w:val="${v}"`);
    const hierarki = ada('%1.') && ada('%2.') && ada('%3).') && ada('%4).')
      && nm.includes('w:numFmt w:val="lowerLetter"');
    cek('hierarki daftar 1. → a. → 1). → a). (4 tingkat)', hierarki,
      hierarki ? '%1. %2. %3). %4). + lowerLetter' : 'tingkat 3/4 tidak ada di numbering.xml');

    // "nol bullet": semua numId yang benar-benar dipakai dokumen menunjuk abstractNum
    // berformat angka — bukan template bullet bawaan
    const abs = {};
    for (const m of nm.matchAll(/<w:abstractNum w:abstractNumId="(\d+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g)) {
      abs[m[1]] = m[2].includes('<w:numFmt w:val="decimal"') || m[2].includes('<w:numFmt w:val="lowerLetter"');
    }
    const petaNum = {};
    for (const m of nm.matchAll(/<w:num w:numId="(\d+)">[\s\S]*?<w:abstractNumId w:val="(\d+)"\/>/g)) {
      petaNum[m[1]] = m[2];
    }
    const dipakai = new Set([...xml.matchAll(/<w:numId w:val="(\d+)"\/>/g)].map((m) => m[1]));
    const salah = [...dipakai].filter((id) => abs[petaNum[id]] !== true);
    cek('nol bullet — seluruh list memakai numbering bernomor', dipakai.size > 0 && salah.length === 0,
      `${dipakai.size} numId dipakai${salah.length ? ` · salah: ${salah.join(',')}` : ' · semuanya angka'}`);
  } else console.log('SKIP | numbering.xml tidak ada di samping document.xml');

  const brLiteral = n(/&lt;br/gi);
  const brBreak = n(/<w:br\/>/g);
  cek('kode "<br>" tak tampil literal — jadi line break', brLiteral === 0 && brBreak > 0,
    `${brLiteral} literal · ${brBreak} <w:br/>`, 'WARN');

  const adaX = n(/<w:t[^>]*>[XYZ]\d/) > 0, adaH = n(/<w:t[^>]*>H\d/) > 0;
  if (adaX || adaH) {
    const sup = n(/w:val="superscript"/g), sub = n(/w:val="subscript"/g);
    cek('penanda X1/Y1/Z1 superskrip & H1 subskrip (#13/#10)',
      (!adaX || sup > 0) && (!adaH || sub > 0),
      `${sup} superscript · ${sub} subscript`);
  } else console.log('SKIP | tidak ada penanda X1/H1 di dokumen');

  console.log('');
  console.log(gagal ? `=== ${gagal} GAGAL, ${peringatan} WARN ===` : `=== SEMUA LULUS (${peringatan} WARN) ===`);
  // Jangan process.exit() — mematikan paksa socket keep-alive fetch memicu
  // assertion libuv di Windows. Cukup set kode keluar, biarkan event loop selesai.
  process.exitCode = gagal ? 1 : 0;
})().catch((e) => { console.error('FATAL:', e); process.exitCode = 1; });
