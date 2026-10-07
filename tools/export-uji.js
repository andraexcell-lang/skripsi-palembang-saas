/* Unduh ekspor DOCX proyek — untuk verifikasi format (spasi, caption, TOC) tanpa browser.
 * Jalankan: $env:UJI_EMAIL='...'; $env:UJI_PASS='...'; node tools/export-uji.js <project-id> [keluaran.docx]
 * Login memakai akun uji (password grant) seperti tools/gen-uji.js; backend lokal :5000 (atau $env:API).
 */
const fs = require('fs');
const path = require('path');

function envFile(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

const [, , id, keluaran] = process.argv;
if (!id) { console.error('Pakai: node tools/export-uji.js <project-id> [out.docx]'); process.exit(2); }
const API = process.env.API || 'http://localhost:5000';
const EMAIL = process.env.UJI_EMAIL || '';
const PASS = process.env.UJI_PASS || '';

(async () => {
  const SUPA = envFile('SUPABASE_URL');
  const ANON = envFile('SUPABASE_ANON_KEY');
  const lg = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  if (!lg.ok) { console.error('Login gagal:', lg.status); process.exit(1); }
  const { access_token } = await lg.json();

  const r = await fetch(`${API}/api/projects/${id}/export-docx`, { headers: { Authorization: `Bearer ${access_token}` } });
  if (!r.ok) { console.error('Export HTTP', r.status, (await r.text()).slice(0, 300)); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  const out = path.resolve(keluaran || `${id}.docx`);
  fs.writeFileSync(out, buf);
  console.log(`Tersimpan: ${out} (${buf.length.toLocaleString('id-ID')} byte)`);
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
