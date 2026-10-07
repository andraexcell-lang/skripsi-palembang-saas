/* Jalankan berkas SQL di Supabase (proyek backend) lewat Management API.
 * Butuh Personal Access Token (supabase.com/dashboard/account/tokens) — JANGAN hard-code di sini.
 *
 * Pakai (PowerShell):
 *   $env:SUPABASE_PAT='sbp_....'; node tools/jalankan-sql.js backend/supabase/migration_admin.sql
 *
 * Project ref diambil dari backend/.env (SUPABASE_URL). Token sekali pakai:
 * selesai → cabut di dashboard Supabase.
 */
const fs = require('fs');
const path = require('path');

// baca backend/.env manual
for (const b of fs.readFileSync(path.join(__dirname, '..', 'backend', '.env'), 'utf8').split(/\r?\n/)) {
  const m = b.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}

const REF = String(process.env.SUPABASE_URL || '').replace('https://', '').replace('.supabase.co', '');
const PAT = process.env.SUPABASE_PAT || '';
const file = process.argv[2];

(async () => {
  if (!REF) { console.error('SUPABASE_URL tidak terbaca'); process.exit(1); }
  if (!PAT) { console.error('Set dulu: $env:SUPABASE_PAT="sbp_..."'); process.exit(1); }
  if (!file) { console.error('Pakai: node tools/jalankan-sql.js <berkas.sql>'); process.exit(1); }
  const sql = fs.readFileSync(path.resolve(file), 'utf8');

  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const teks = await res.text();
  console.log(`HTTP ${res.status}`);
  console.log(teks.slice(0, 3000));
  process.exit(res.ok ? 0 : 1);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
