/* Smoke test endpoint Dashboard Admin (tanpa bakar kuota Gemini).
 * Pakai: node tools/smoke-admin.js
 * - login tester (plan admin diset sementara lewat service role)
 * - GET/PUT/RESET models, GET/PUT flags, status, tes koneksi openai (HTTP 401 dari gateway = sukses jalur)
 * - guard 403 untuk non-admin (dinonaktifkan bila --tanpa-403)
 */
const fs = require('fs');
const path = require('path');

// Baca backend/.env manual (tanpa dotenv di root)
for (const baris of fs.readFileSync(path.join(__dirname, '..', 'backend', '.env'), 'utf8').split(/\r?\n/)) {
  const m = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}

const API = process.env.BACKEND_URL || 'http://localhost:5000';
const SUPA = process.env.SUPABASE_URL;
const EMAIL = process.env.UJI_EMAIL || 'tester.palembang@gmail.com';
const PASS = process.env.UJI_PASS || '321_Palembangku';

let lolos = 0, gagal = 0;
const cek = (nama, ok, info = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${nama}${info ? ' — ' + info : ''}`);
  ok ? lolos++ : gagal++;
};

async function login() {
  const r = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: process.env.SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error('login gagal: ' + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}

async function api(pathname, token, method = 'GET', body) {
  const r = await fetch(`${API}${pathname}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j = null;
  try { j = await r.json(); } catch { /* kosong */ }
  return { status: r.status, j };
}

(async () => {
  const guard = process.argv.includes('--guard');
  const tok = await login();
  cek('login tester', !!tok);

  // Mode guard: akun NON-admin harus ditolak 403 di semua endpoint admin
  if (guard) {
    const g = await api('/api/admin/models', tok);
    cek('403 GET /admin/models (non-admin)', g.status === 403, `status=${g.status}`);
    const gf = await api('/api/admin/flags', tok, 'PUT', { flags: {} });
    cek('403 PUT /admin/flags (non-admin)', gf.status === 403, `status=${gf.status}`);
    const gs = await api('/api/admin/status', tok);
    cek('403 GET /admin/status (non-admin)', gs.status === 403, `status=${gs.status}`);
    const p = await api('/api/flags', tok);
    cek('200 GET /api/flags (publik tetap jalan)', p.status === 200 && typeof p.j?.flags === 'object');
    console.log(`\n${lolos} PASS / ${gagal} FAIL`);
    process.exit(gagal ? 1 : 0);
  }

  const bal = await api('/api/credits/balance', tok);
  cek('balance plan=admin', bal.j?.plan === 'admin', `plan=${bal.j?.plan}`);

  const m0 = await api('/api/admin/models', tok);
  const list0 = m0.j?.models || [];
  cek('GET /admin/models', m0.status === 200 && list0.length >= 8, `${list0.length} entri`);
  cek('key tidak bocor ke klien', list0.every((x) => !x.apiKey || x.apiKey === '••••'), `contoh apiKey="${list0[0]?.apiKey}"`);

  // simpan dengan 1 baris gateway openai tambahan
  const disimpan = [...list0.map(({ punyaKey, ...x }) => x),
    { id: 'gpt-4o-mini', provider: 'openai', baseUrl: 'https://openrouter.ai/api/v1', aktif: true, apiKey: 'sk-or-smoke-test' }];
  const put = await api('/api/admin/models', tok, 'PUT', { models: disimpan });
  cek('PUT /admin/models', put.status === 200 && put.j?.ok, JSON.stringify(put.j));

  const m1 = await api('/api/admin/models', tok);
  const list1 = m1.j?.models || [];
  cek('tersimpan (9 entri, key masked)', list1.length === 9 && list1[8].apiKey === '••••' && list1[8].punyaKey,
    `${list1.length} entri, key="${list1[8]?.apiKey}"`);

  // key lama tetap utuh saat save ulang tanpa mengubah key (uji merge '••••')
  const ulang = await api('/api/admin/models', tok, 'PUT', { models: list1.map(({ punyaKey, ...x }) => x) });
  const m2 = await api('/api/admin/models', tok);
  cek('key lama dipertahankan saat save ulang', ulang.status === 200 && m2.j.models[8].punyaKey === true);

  const st = await api('/api/admin/status', tok);
  cek('GET /admin/status', st.status === 200 && Array.isArray(st.j?.entri), `urutanAktif=${st.j?.urutanAktif}`);

  // tes koneksi gateway (key palsu → HTTP 401 dari openrouter = jalur openai terbukti jalan; TIDAK bakar kuota Gemini)
  const tes = await api('/api/admin/models/test', tok, 'POST', { model: list1[8] });
  cek('POST /admin/models/test (jalur openai)', tes.status === 200 && tes.j?.ok === false && /401/.test(tes.j?.pesan || ''),
    (tes.j?.pesan || '').slice(0, 80));

  // validasi: baseUrl wajib utk openai
  const v = await api('/api/admin/models', tok, 'PUT', { models: [{ id: 'x', provider: 'openai', aktif: true }] });
  cek('validasi baseUrl wajib (400)', v.status === 400, v.j?.error);

  // flags
  const f0 = await api('/api/flags', tok);
  cek('GET /api/flags (publik)', f0.status === 200 && typeof f0.j?.flags === 'object');
  const fp = await api('/api/admin/flags', tok, 'PUT', { flags: { tuton: false, proyek: true } });
  cek('PUT /admin/flags', fp.status === 200 && fp.j?.ok, JSON.stringify(fp.j));
  const f1 = await api('/api/flags', tok);
  cek('flags terbaca balik', f1.j?.flags?.tuton === false, JSON.stringify(f1.j?.flags));

  // reset model → kembali default
  const rs = await api('/api/admin/models/reset', tok, 'POST', {});
  const m3 = await api('/api/admin/models', tok);
  cek('POST /admin/models/reset → default', rs.status === 200 && (m3.j?.models || []).length === list0.length,
    `${m3.j?.models?.length} entri`);

  // kembalikan flags ke bersih (semua default/nyala)
  await api('/api/admin/flags', tok, 'PUT', { flags: {} });

  console.log(`\n${lolos} PASS / ${gagal} FAIL`);
  process.exit(gagal ? 1 : 0);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
