/* Uji generate bab tanpa browser — Skripsi Palembang (hemat: pakai ?ulang=1 = 1 kredit)
 *
 * Prasyarat: backend lokal jalan (:5000) + akun uji.
 * Jalankan (PowerShell):
 *   $env:UJI_EMAIL='...'; $env:UJI_PASS='...'; node tools/gen-uji.js <project-id> bab2
 * Opsional: $env:API='https://api...' (default http://localhost:5000), --studi=10
 *
 * Membaca backend/.env untuk Supabase — TANPA kredensial hard-coded.
 * Output: progress stream, lalu statistik (panjang, waktu, model dari log backend).
 */
const fs = require('fs');
const path = require('path');

function envFile(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

const [, , id, bab, ...flags] = process.argv;
if (!id || !bab) { console.error('Pakai: node tools/gen-uji.js <project-id> <bab1|bab2|bab3|bab4|bab5|lampiran> [--studi=10]'); process.exit(2); }
const studi = (flags.find((f) => f.startsWith('--studi=')) || '').split('=')[1] || undefined;
const API = process.env.API || 'http://localhost:5000';
const EMAIL = process.env.UJI_EMAIL || '';
const PASS = process.env.UJI_PASS || '';
if (!EMAIL || !PASS) { console.error('Set UJI_EMAIL & UJI_PASS dulu'); process.exit(2); }

(async () => {
  // 1. Login Supabase (password grant) → access token
  const SUPA = envFile('SUPABASE_URL');
  const ANON = envFile('SUPABASE_ANON_KEY');
  const lg = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  if (!lg.ok) { console.error('Login gagal:', lg.status, (await lg.text()).slice(0, 200)); process.exit(1); }
  const { access_token } = await lg.json();

  // 2. Cek saldo kredit
  const bal = await fetch(`${API}/api/credits/balance`, { headers: { Authorization: `Bearer ${access_token}` } });
  const bj = await bal.json().catch(() => ({}));
  console.log(`Saldo kredit: ${bj.balance ?? bj.remaining ?? '?'}`);

  // 3. Stream generate (?ulang=1 → 1 kredit; force → regenerasi)
  const t0 = Date.now();
  const res = await fetch(`${API}/api/projects/${id}/generate-bab-stream?ulang=1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bab, force: true, ...(studi ? { studi } : {}) }),
  });
  if (!res.ok) { console.error('HTTP', res.status, (await res.text()).slice(0, 300)); process.exit(1); }

  let buf = '';
  let full = '';
  let evTerakhir = '';
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const blok = buf.slice(0, i); buf = buf.slice(i + 2);
      const ev = (blok.match(/^event: (.+)$/m) || [])[1] || '';
      const data = (blok.match(/^data: (.*)$/m) || [])[1] || '';
      evTerakhir = ev || evTerakhir;
      if (ev === 'chunk') { try { full += JSON.parse(data).t; } catch { /* abaikan */ } }
      else if (ev === 'done') { console.log(`\nDONE: ${data}`); }
      else if (ev === 'error') { console.error(`\nERROR: ${data}`); process.exitCode = 1; }
      else if (ev === 'cost') { console.log(`cost: ${data}`); }
      else if (ev === 'cached') { console.log('cached (tanpa regenerasi!)'); }
    }
    if (full.length && process.stdout.isTTY) process.stdout.write(`\r${full.length.toLocaleString('id-ID')} karakter …`);
  }
  const dtk = Math.round((Date.now() - t0) / 1000);
  console.log(`\nSelesai dalam ${dtk} dtk · ${full.length.toLocaleString('id-ID')} karakter · event terakhir: ${evTerakhir}`);
  console.log(`Target: bab1 ≥25.000 · bab2 ≥40.000 · bab3 ≥30.000 · bab4 ≥15.000 · bab5 ≥7.000 · lampiran ≥9.000`);
})().catch((e) => { console.error('FATAL:', e); process.exit(2); });
