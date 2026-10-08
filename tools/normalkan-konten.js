/* Normalisasi konten tersimpan (item 1 penomoran + item 5 tanpa LaTeX) — tanpa AI, tanpa kredit.
 * Logika IDENTIK dengan backend (bersihTeks + rapikanPenomoran di projects.routes.ts):
 *   - buang **bold** sisa, sisa format LaTeX ($…$, \frac, \sqrt, \command)
 *   - rapikan nomor judul sub-bab: berurutan per induk, perbaiki lompat/duplikat/yatim
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan : node tools/normalkan-konten.js <project-id>            (dry-run, laporan saja)
 * Terapkan : node tools/normalkan-konten.js <project-id> --terapkan  (update DB)
 */
const fs = require('fs');
const path = require('path');

function env(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

// —— salinan persis backend ——
const LATEX_HURUF = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ', lambda: 'λ',
  mu: 'μ', rho: 'ρ', sigma: 'σ', tau: 'τ', chi: 'χ', omega: 'ω', times: '×', cdot: '·',
  pm: '±', leq: '≤', geq: '≥', neq: '≠', approx: '≈', sum: '∑', int: '∫', partial: '∂',
};
const bersihTeks = (t) =>
  String(t)
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1').replace(/\*\*/g, '')
    .replace(/\$\$?([^$\n]+?)\$\$?/g, (_m, a) => a)
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_m, a, b) => /[+\-×·*]/.test(b) ? `${a}/(${b})` : `${a}/${b}`)
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, '√$1')
    .replace(/\\(?:left|right)\b\s*/g, '')
    .replace(/\\[()[\]]/g, '')
    .replace(/\\([a-zA-Z]+)/g, (_m, w) => LATEX_HURUF[w] || ` ${w} `);

const rapikanPenomoran = (t) => {
  const lines = String(t).split('\n');
  const sudah = new Set();
  const anak = new Map();
  const terakhir = {};
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const dt = raw.trim().replace(/\*\*/g, '');
    if (!/^\d/.test(dt) || dt.includes('|')) continue;
    const m = dt.match(/^(\d+(?:\.\d+)+)\.?\s+(\S.*)$/);
    if (!m || dt.length >= 130) continue;
    const seg = m[1].split('.');
    if (seg.length < 2 || seg.length > 4) continue;
    if (seg.some((s) => +s > 60)) continue;
    const lvl = seg.length;
    let induk = seg.slice(0, -1).join('.');
    if (lvl > 2 && !sudah.has(induk)) {
      let ayah = terakhir[lvl - 1];
      if (!ayah) { for (let l = lvl - 1; l >= 2 && !ayah; l--) ayah = terakhir[l]; }
      if (!ayah) continue;
      induk = ayah;
    }
    const n = (anak.get(induk) || 0) + 1;
    anak.set(induk, n);
    const baru = `${induk}.${n}`;
    sudah.add(baru);
    terakhir[lvl] = baru;
    for (let l = lvl + 1; l <= 4; l++) delete terakhir[l];
    if (baru !== m[1]) lines[i] = raw.replace(m[1], baru);
  }
  return lines.join('\n');
};

// Normalisasi penuh konten bab (salinan persis backend — projects.routes.ts):
// "<br>" di baris NON-tabel dipecah jadi baris baru; baris tabel (ada "|")
// dipertahankan agar markdown sel tetap satu baris.
const normalisasiBab = (t) => rapikanPenomoran(bersihTeks(
  String(t || '').split('\n').map((b) => (b.includes('|') ? b : b.replace(/<br\s*\/?>/gi, '\n'))).join('\n'),
));

const KUNCI = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'lampiran', 'abstrak'];

async function main() {
  const id = process.argv[2];
  const terapkan = process.argv.includes('--terapkan');
  if (!id) { console.error('Pakai: node tools/normalkan-konten.js <project-id> [--terapkan]'); process.exit(2); }
  const url = env('SUPABASE_URL');
  const svc = env('SUPABASE_SERVICE_ROLE_KEY');
  const H = { apikey: svc, Authorization: `Bearer ${svc}` };
  const r = await fetch(`${url}/rest/v1/projects?id=eq.${id}&select=id,content`, { headers: H });
  if (!r.ok) { console.error('Supabase error', r.status, await r.text()); process.exit(2); }
  const rows = await r.json();
  if (!rows.length) { console.error('Proyek tidak ditemukan'); process.exit(2); }
  const content = { ...(rows[0].content || {}) };
  let adaPerubahan = false;
  const lihat = process.argv.includes('--lihat');

  for (const k of KUNCI) {
    const t = content[k];
    if (!t || typeof t !== 'string') continue;
    const baru = normalisasiBab(t);
    if (baru === t) { console.log(`${k}: sudah normal`); continue; }
    adaPerubahan = true;
    const bl = String(t).split('\n'), bb = baru.split('\n');
    let barisUbah = 0;
    for (let i = 0; i < Math.max(bl.length, bb.length); i++) if (bl[i] !== bb[i]) barisUbah++;
    const latex = (t.match(/\$[^$\n]+\$|\\frac\{|\\sqrt\{|\\begin\{/g) || []).length;
    console.log(`${k}: ${t.length} → ${baru.length} kar · ${barisUbah} baris dirapikan · ${latex} pola LaTeX dibuang`);
    if (lihat) {
      let contoh = 0;
      for (let i = 0; i < Math.max(bl.length, bb.length) && contoh < 40; i++) {
        if (bl[i] !== bb[i]) { contoh++; console.log(`  - ${String(bl[i]).trim().slice(0, 120)}\n  + ${String(bb[i]).trim().slice(0, 120)}`); }
      }
    }
    content[k] = baru;
  }

  if (!adaPerubahan) { console.log('Tidak ada perubahan.'); return; }
  if (!terapkan) { console.log('\n[DRY-RUN] Tambah --terapkan untuk menyimpan.'); return; }
  const u = await fetch(`${url}/rest/v1/projects?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ content, updated_at: new Date().toISOString() }),
  });
  if (!u.ok) { console.error('Gagal update:', u.status, await u.text()); process.exit(1); }
  console.log('Tersimpan ✓');
}

if (require.main === module) main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
module.exports = { bersihTeks, rapikanPenomoran, normalisasiBab };
