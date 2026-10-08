/* Hapus seksi "Pertanyaan Penyaring (Screening Questions)" dari konten Lampiran (#19).
 * Alasan: template owner tak punya seksi itu; teks screening di BAB 3 (3.2) tetap utuh.
 *
 * Pakai:
 *   node tools/bersih-screening.js <project-id> [<project-id>...]            # dry-run
 *   node tools/bersih-screening.js <project-id> --terapkan                    # simpan
 * Backup JSON konten selalu ditulis ke tools/backup/ sebelum ada perubahan.
 */
const fs = require('fs');
const path = require('path');

function envFile(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

const arg = process.argv.slice(2);
const terapkan = arg.includes('--terapkan');
const ids = arg.filter((a) => !a.startsWith('--'));
if (!ids.length) {
  console.error('Pakai: node tools/bersih-screening.js <project-id> [...] [--terapkan]');
  process.exit(2);
}

const url = envFile('SUPABASE_URL');
const svc = envFile('SUPABASE_SERVICE_ROLE_KEY');
const H = { apikey: svc, Authorization: `Bearer ${svc}` };
const backupDir = path.join(__dirname, 'backup');

/** Buang seksi screening dari satu isi lampiran. */
function buangScreening(t) {
  const lines = String(t).split('\n');
  const mulai = lines.findIndex((l) => /^Pertanyaan Penyaring\b/i.test(l.trim()));
  if (mulai < 0) return { teks: t, terhapus: 0 };
  let akhir = mulai;
  while (akhir < lines.length && !/^-{20,}$/.test(lines[akhir].trim())) akhir++;
  if (akhir >= lines.length) return { teks: t, terhapus: 0 }; // pemisah tak ketemu → jangan tebak
  let end = akhir + 1;
  while (end < lines.length && !lines[end].trim()) end++;
  const terhapus = end - mulai;
  lines.splice(mulai, terhapus);
  return { teks: lines.join('\n'), terhapus };
}

(async () => {
  for (const id of ids) {
    const r = await fetch(`${url}/rest/v1/projects?id=eq.${id}&select=id,judul,content`, { headers: H });
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) { console.error(`${id}: tidak ditemukan (${JSON.stringify(rows).slice(0, 120)})`); continue; }
    const content = { ...(rows[0].content || {}) };
    const t = content.lampiran || '';
    const { teks, terhapus } = buangScreening(t);
    if (!terhapus) { console.log(`${id} (${rows[0].judul}): tidak ada seksi screening`); continue; }
    const sisa = (teks.match(/Pertanyaan Penyaring/g) || []).length;
    console.log(`${id} (${rows[0].judul}): ${terhapus} baris screening dibuang · lampiran ${t.length} → ${teks.length} kar · sisa "Pertanyaan Penyaring" = ${sisa}`);

    if (!terapkan) { console.log('  [DRY-RUN] tambah --terapkan untuk menyimpan'); continue; }

    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const bp = path.join(backupDir, `${id}-lampiran-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(bp, JSON.stringify({ id, judul: rows[0].judul, kunci: 'lampiran', nilaiLama: t }, null, 2));
    console.log(`  backup: ${bp}`);

    content.lampiran = teks;
    const u = await fetch(`${url}/rest/v1/projects?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ content, updated_at: new Date().toISOString() }),
    });
    if (!u.ok) { console.error('  Gagal update:', u.status, await u.text()); process.exit(1); }
    console.log('  Tersimpan ✓');
  }
})().catch((e) => { console.error(e); process.exit(1); });
