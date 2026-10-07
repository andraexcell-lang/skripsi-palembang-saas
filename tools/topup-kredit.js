/* Top-up kredit akun uji lewat service role (tanpa API billing) — untuk pengujian lokal.
 * Jalankan: node tools/topup-kredit.js <user-id> [jumlah=5]
 * Baris credit_ledger ikut dicatat agar riwayat tetap konsisten.
 */
const fs = require('fs');
const path = require('path');

function env(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const line = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

(async () => {
  const userId = process.argv[2];
  const jumlah = Number(process.argv[3] || 5);
  if (!userId || !jumlah) { console.error('Pakai: node tools/topup-kredit.js <user-id> [jumlah]'); process.exit(2); }
  const url = env('SUPABASE_URL');
  const svc = env('SUPABASE_SERVICE_ROLE_KEY');
  const H = { apikey: svc, Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' };

  const r = await fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=credits,plan`, { headers: H });
  const rows = await r.json();
  if (!rows.length) { console.error('Profil tidak ditemukan'); process.exit(2); }
  const sebelum = rows[0].credits;
  const sesudah = sebelum + jumlah;

  await fetch(`${url}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ credits: sesudah }),
  });
  await fetch(`${url}/rest/v1/credit_ledger`, {
    method: 'POST', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: userId, amount: jumlah, ref: `uji:topup-${Date.now()}`, meta: { tool: 'topup-kredit', note: 'top-up uji lokal' } }),
  });
  console.log(`Kredit: ${sebelum} → ${sesudah} (+${jumlah}) ✓`);
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
