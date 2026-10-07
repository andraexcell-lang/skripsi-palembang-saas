/* Uji generate bab tanpa browser — Skripsi Palembang (hemat: pakai ?ulang=1 = 1 kredit)
 *
 * Prasyarat: backend lokal jalan (:5000) + akun uji.
 * Jalankan (PowerShell):
 *   $env:UJI_EMAIL='...'; $env:UJI_PASS='...'; node tools/gen-uji.js <project-id> bab2
 * Opsional: $env:API='https://api...' (default http://localhost:5000),
 *           --studi=10 --populasi=50 --coba=3   (percobaan bila stream putus/503)
 *
 * Membaca backend/.env untuk Supabase — TANPA kredensial hard-coded.
 * Auto-retry: koneksi stream yang putus (BodyTimeout/terminated) atau event error
 * dari AI diulang sampai --coba (default 3) — server mengembalikan kredit otomatis
 * bila generasi gagal, jadi retry aman.
 */
const fs = require('fs');
const path = require('path');

function envFile(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

const [, , id, bab, ...flags] = process.argv;
if (!id || !bab) { console.error('Pakai: node tools/gen-uji.js <project-id> <bab1|bab2|bab3|bab4|bab5|lampiran> [--studi=10] [--populasi=50] [--coba=3]'); process.exit(2); }
const ambilFlag = (k) => (flags.find((f) => f.startsWith(`--${k}=`)) || '').split('=')[1] || undefined;
const studi = ambilFlag('studi');
const populasi = ambilFlag('populasi');
const maksCoba = Number(ambilFlag('coba') || 3);
const API = process.env.API || 'http://localhost:5000';
const EMAIL = process.env.UJI_EMAIL || '';
const PASS = process.env.UJI_PASS || '';
if (!EMAIL || !PASS) { console.error('Set UJI_EMAIL & UJI_PASS dulu'); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Satu percobaan stream. Return { selesai, full, evTerakhir, dtk }.
 *  Melempar error jaringan (BodyTimeout dst.) bila stream putus. */
async function sekali(token, t0) {
  const res = await fetch(`${API}/api/projects/${id}/generate-bab-stream?ulang=1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bab, force: true, ...(studi ? { studi } : {}), ...(populasi ? { populasi: Number(populasi) } : {}) }),
  });
  if (!res.ok) { const t = await res.text(); const e = new Error(`HTTP ${res.status}: ${t.slice(0, 300)}`); e.permanen = /kredit|Bad Request|404/.test(t); throw e; }

  let buf = '';
  let full = '';
  let evTerakhir = '';
  let errData = '';
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
      else if (ev === 'error') { errData = data; console.error(`\nERROR: ${data}`); }
      else if (ev === 'cost') { console.log(`cost: ${data}`); }
      else if (ev === 'cached') { console.log('cached (tanpa regenerasi!)'); }
    }
    if (full.length && process.stdout.isTTY) process.stdout.write(`\r${full.length.toLocaleString('id-ID')} karakter …`);
  }
  const dtk = Math.round((Date.now() - t0) / 1000);
  // selesai = stream utuh + event terakhir 'done' (tanpa error AI)
  return { selesai: evTerakhir === 'done' && !errData, full, evTerakhir, dtk, errData };
}

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

  // 3. Stream generate dengan percobaan ulang
  let hasil = null;
  for (let coba = 1; coba <= maksCoba; coba++) {
    const t0 = Date.now();
    try {
      const r = await sekali(access_token, t0);
      hasil = r;
      if (r.selesai) break;
      console.error(`\nPercobaan ${coba}/${maksCoba} gagal (event: ${r.evTerakhir})${coba < maksCoba ? ' — tunggu lalu ulangi…' : ''}`);
    } catch (e) {
      hasil = hasil || { full: '', evTerakhir: 'network', dtk: 0 };
      console.error(`\nPercobaan ${coba}/${maksCoba} putus: ${e.message}${e.permanen ? ' (permanen — berhenti)' : coba < maksCoba ? ' — tunggu lalu ulangi…' : ''}`);
      if (e.permanen) break;
    }
    if (coba < maksCoba) await sleep(45_000); // beri waktu backend menuntaskan retry & Google mereda
  }

  console.log(`\nSelesai dalam ${hasil?.dtk ?? 0} dtk · ${hasil?.full.length.toLocaleString('id-ID') || 0} karakter · event terakhir: ${hasil?.evTerakhir}`);
  console.log(`Target: bab1 ≥25.000 · bab2 ≥40.000 · bab3 ≥30.000 · bab4 ≥15.000 · bab5 ≥7.000 · lampiran ≥9.000`);
  if (!hasil?.selesai) process.exitCode = 1;
})().catch((e) => { console.error('FATAL:', e); process.exit(2); });
