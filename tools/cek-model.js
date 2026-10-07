/* Tes kesehatan model Gemini per daftar model backend — tanpa kredit proyek.
 * Jalankan: node tools/cek-model.js
 * Kirim prompt mini 1 token per model; laporkan OK/503/quota — dipakai untuk memutuskan
 * kapan aman regen bab (model utama menulis penuh, model lite sering berhenti dini).
 */
const fs = require('fs');
const path = require('path');

function envFile(name) {
  const p = path.join(__dirname, '..', 'backend', '.env');
  const l = fs.readFileSync(p, 'utf8').split(/\r?\n/).find((x) => x.startsWith(name + '='));
  return l ? l.slice(name.length + 1).trim() : '';
}

// Urutan sama dengan MODELS di backend/src/services/ai.service.ts
const MODELS = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite',
];

// --stream : pakai :streamGenerateContent?alt=sse (endpoint yang dipakai backend)
// --hanya=<model> : hanya tes satu model
const streamMode = process.argv.includes('--stream');
const hanya = (process.argv.find((a) => a.startsWith('--hanya=')) || '').split('=')[1];
const daftar = hanya ? [hanya] : MODELS;

const KEY = envFile('GEMINI_API_KEY');
if (!KEY) { console.error('GEMINI_API_KEY tak ditemukan di backend/.env'); process.exit(2); }

(async () => {
  for (const m of daftar) {
    const t0 = Date.now();
    try {
      const url = streamMode
        ? `https://generativelanguage.googleapis.com/v1beta/models/${m}:streamGenerateContent?alt=sse`
        : `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'balas: ok' }] }], generationConfig: { maxOutputTokens: 32 } }),
      });
      const dtk = Date.now() - t0;
      if (r.ok) {
        if (streamMode) {
          const teks = (await r.text()).split('\n').filter((l) => l.startsWith('data:')).join('').slice(0, 120);
          console.log(`OK    ${m} [stream] (${dtk} ms) → ${teks}`);
        } else {
          const j = await r.json();
          const txt = j?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
          console.log(`OK    ${m} (${dtk} ms) → "${txt.slice(0, 30)}"`);
        }
      } else {
        const t = (await r.text()).slice(0, 160).replace(/\s+/g, ' ');
        console.log(`GAGAL ${m} ${streamMode ? '[stream] ' : ''}(${dtk} ms) HTTP ${r.status} ${t}`);
      }
    } catch (e) {
      console.log(`ERROR ${m} ${e.message}`);
    }
  }
})();
