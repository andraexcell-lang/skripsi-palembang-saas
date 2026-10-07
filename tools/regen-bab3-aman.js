/* Regen Bab III AMAN + TERJADWAL (pelindung reset kuota Gemini).
 *
 * Alur:
 *   1) Backup isi content proyek (service role) ke %TEMP% SEBELUM apa pun.
 *   2) Tunggu reset kuota 00:00 UTC (+60 detik) bila belum lewat
 *      (lewati antre bila --langsung ATAU jam UTC < 06:00 = jendela baru).
 *   3) Jalankan gen-uji.js <proyek> bab3 --coba=3 (1 kredit; stream gagal = refund otomatis).
 *   4) Cek panjang bab3 hasilnya:
 *        >= 25.000 kar → SUKSA, biarkan.
 *        <  25.000 kar → RESTORE backup otomatis (jangan biarkan konten rusak/pendek).
 *
 * Pakai (PowerShell):
 *   $env:UJI_EMAIL='...'; $env:UJI_PASS='...'; node tools/regen-bab3-aman.js [--langsung]
 *
 * Butuh: backend jalan di :5000. Token & kredensial TIDAK ditulis ke file mana pun
 * selain backup content (isi naskah) di %TEMP%.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// baca backend/.env manual
for (const b of fs.readFileSync(path.join(__dirname, '..', 'backend', '.env'), 'utf8').split(/\r?\n/)) {
  const m = b.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}
const { createClient } = require(path.join(__dirname, '..', 'backend', 'node_modules', '@supabase', 'supabase-js'));

const ID = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2]
  : '200b68f5-0d1d-4249-a3f1-b84309ed9b08';
const LANGSUNG = process.argv.includes('--langsung');
const BATAS = 25000; // standar minimal bab3 (checkpoint: wajib >= 25.000 kar)

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const jam = () => new Date().toISOString().slice(11, 19);

function tidur(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function bacaContent() {
  const { data, error } = await db.from('projects').select('content').eq('id', ID).single();
  if (error) throw new Error('baca content gagal: ' + error.message);
  return data.content || {};
}
const panjang = (c) => (typeof c?.bab3 === 'string' ? c.bab3.length : JSON.stringify(c?.bab3 ?? '').length);

function jalankanGenUji() {
  return new Promise((resolve) => {
    const anak = spawn(process.execPath, [path.join(__dirname, 'gen-uji.js'), ID, 'bab3', '--coba=3'], {
      env: process.env,
      stdio: 'inherit',
    });
    anak.on('close', (kode) => resolve(kode));
  });
}

(async () => {
  console.log(`[${jam()}] regen-bab3-aman dimulai (proyek ${ID})`);

  // 1) BACKUP dulu — jangan sentuh apa pun sebelum ini
  const sebelum = await bacaContent();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const fileBackup = path.join(os.tmpdir(), `backup-content-${ID.slice(0, 8)}-sebab3-${ts}.json`);
  fs.writeFileSync(fileBackup, JSON.stringify(sebelum));
  console.log(`[${jam()}] backup: ${fileBackup}`);
  console.log(`[${jam()}] panjang SEBELUM: bab1=${(sebelum.bab1 || '').length} bab2=${(sebelum.bab2 || '').length} bab3=${panjang(sebelum)} lampiran=${(sebelum.lampiran || '').length}`);

  // 2) Tunggu reset kuota 00:00 UTC bila perlu
  if (!LANGSUNG) {
    const now = new Date();
    const utcHour = now.getUTCHours();
    if (utcHour < 6) {
      console.log(`[${jam()}] jendela kuota baru (UTC ${utcHour}:xx) → jalankan sekarang`);
    } else {
      const target = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 1, 0);
      const ms = target - Date.now();
      console.log(`[${jam()}] menunggu reset kuota 00:00 UTC ≈ ${(ms / 3600000).toFixed(2)} jam lagi…`);
      await tidur(ms);
    }
  }

  // 3) Regen
  console.log(`[${jam()}] menjalankan gen-uji bab3 --coba=3 …`);
  const kode = await jalankanGenUji();
  console.log(`[${jam()}] gen-uji exit=${kode}`);

  // 4) Verifikasi + auto-restore
  const sesudah = await bacaContent();
  const p = panjang(sesudah);
  console.log(`[${jam()}] panjang SESUDAH: bab3=${p} kar`);
  if (p >= BATAS) {
    console.log(`[${jam()}] SUKSA: bab3 ${p} kar (>= ${BATAS}) — tidak diubah.`);
    process.exit(0);
  }
  console.log(`[${jam()}] GAGAL/pendek (${p} < ${BATAS}) → RESTORE backup otomatis…`);
  const { error } = await db.from('projects').update({ content: sebelum }).eq('id', ID);
  if (error) { console.error('RESTORE GAGAL:', error.message); process.exit(3); }
  const ulang = await bacaContent();
  console.log(`[${jam()}] restore selesai — bab3 kembali ${panjang(ulang)} kar. Coba lagi nanti (kredit sudah di-refund otomatis bila stream gagal).`);
  process.exit(2);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
