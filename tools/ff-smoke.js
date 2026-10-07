/* Uji cross-browser FIREFOX (Playwright) — Skripsi Palembang
 *
 * Prasyarat:
 *  1. Server lokal hidup: frontend :3000 + backend :5000 (npm run start di masing-masing).
 *  2. Firefox Playwright terpasang: `npx playwright install firefox`
 *     Bila downloader CDN timeout (sering di jaringan lokal): unduh zip via curl dari URL
 *     hasil `npx playwright install --dry-run firefox`, ekstrak ke
 *     %LOCALAPPDATA%\ms-playwright\firefox-<build>\ (berisi folder firefox\firefox.exe),
 *     lalu buat file kosong INSTALLATION_COMPLETE di folder itu.
 *  3. `npm i playwright` di folder skrip ini.
 *  4. Env UJI_EMAIL + UJI_PASS = akun admin. TANPA env → hanya halaman publik yang diuji
 *     (test login/dashboard dilewati, bukan gagal). Jangan hard-code password di skrip.
 *
 * Jalankan:  node ff-smoke.js
 * Output:    ringkasan PASS/FAIL (exit 1 bila ada FAIL) + screenshot ff-*.png di folder ini.
 *
 * Cakupan: halaman publik, login, dashboard/billing/proyek/tutorial, §3.18 (6 kartu
 *          placeholder), kartu University (3× "Hubungi Tim Kami", tanpa "Rp"),
 *          responsif tutorial 375/800, tema gelap (.dark), nol error console.
 *
 * Jebakan diketahui: innerText Firefox menerapkan text-transform — header grup Billing
 * terbaca "PAKET UNIVERSITY" (bukan bug situs).
 */
const { firefox } = require('playwright');

const BASE = 'http://localhost:3000';
const EMAIL = process.env.UJI_EMAIL || '';
const PASS = process.env.UJI_PASS || '';
const results = [];

function log(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
}

(async () => {
  const browser = await firefox.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  let errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  async function visit(path, expectText) {
    errors = [];
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
    if (expectText) {
      try {
        await page.waitForFunction((t) => document.body.innerText.includes(t), expectText, { timeout: 15000 });
      } catch (e) {
        log(`GET ${path}`, false, `teks "${expectText}" tak muncul; errors=${errors.slice(0, 2).join(' | ')}`);
        return;
      }
    }
    const hasMain = (await page.locator('main').count()) > 0;
    log(`GET ${path}`, hasMain && errors.length === 0, `main=${hasMain} errors=${errors.length}${errors.length ? ' :: ' + errors.slice(0, 3).join(' | ') : ''}`);
  }

  // 1. Halaman publik (tanpa login)
  await visit('/', 'Skripsi');
  await visit('/login', 'Masuk');
  await visit('/register', 'Daftar');

  if (EMAIL && PASS) {
    // 2. Login admin
    errors = [];
    await page.goto(BASE + '/login', { waitUntil: 'load' });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASS);
    await page.click('button:has-text("Masuk")');
    try {
      await page.waitForURL('**/dashboard', { timeout: 20000 });
      log('LOGIN admin', true, page.url());
    } catch (e) {
      log('LOGIN admin', false, 'tidak redirect ke /dashboard; ' + errors.slice(0, 2).join(' | '));
    }

    // 3. Halaman dashboard
    await visit('/dashboard', 'Proyek');
    // Firefox: innerText menerapkan text-transform → header grup tampil "PAKET UNIVERSITY"
    await visit('/dashboard/billing', 'PAKET UNIVERSITY');

    // 4. Spesifikasi kartu University (saat masih di halaman billing)
    const uni = await page.locator('a:has-text("Hubungi Tim Kami")').count();
    const rpUni = await page.evaluate(() => {
      const a = [...document.querySelectorAll('a')].find((x) => x.textContent.trim() === 'Hubungi Tim Kami');
      return a ? a.closest('article, div.rounded-xl')?.textContent.includes('Rp') ?? null : null;
    });
    log('Billing: 3 kartu University', uni === 3, `hubungi=${uni}`);
    log('Billing: University tanpa harga Rp', rpUni === false, `hasRp=${rpUni}`);

    await visit('/dashboard/proyek', 'Proyek');
    await visit('/dashboard/tutorial', 'Video Tutorial');

    // 5. Spesifikasi §3.18
    const cards = await page.locator('article').count();
    const segera = await page.locator('span:text-is("Video segera hadir")').count();
    const yt = await page.locator('a[href*="youtu"]').count();
    log('§3.18: 6 kartu video', cards === 6, `cards=${cards}`);
    log('§3.18: placeholder jujur (6 "segera hadir", 0 link YouTube)', segera === 6 && yt === 0, `segera=${segera} yt=${yt}`);

    // 6. Responsif: tutorial grid 375 (1 kolom) & 800 (2 kolom)
    async function gridCols() {
      return page.evaluate(() => {
        const g = [...document.querySelectorAll('div')].find((d) => d.className.includes('grid-cols-2') && d.querySelector('article'));
        return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : null;
      });
    }
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto(BASE + '/dashboard/tutorial', { waitUntil: 'load' });
    const c375 = await gridCols();
    log('tutorial @375: 1 kolom', c375 === 1, `cols=${c375}`);
    await page.setViewportSize({ width: 800, height: 800 });
    const c800 = await gridCols();
    log('tutorial @800: 2 kolom', c800 === 2, `cols=${c800}`);
    await page.setViewportSize({ width: 1280, height: 800 });

    // 7. Screenshot (headless — untuk inspeksi visual)
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.screenshot({ path: 'ff-landing.png', fullPage: false });
    await page.goto(BASE + '/dashboard/tutorial', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'ff-tutorial.png', fullPage: true });
    await page.goto(BASE + '/dashboard/billing', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'ff-billing.png', fullPage: false });

    // 8. Tema gelap: klik radiogroup tema (bila ada) → cek class .dark
    try {
      const labels = page.locator('[role="radiogroup"] >> text=Gelap');
      if ((await labels.count()) > 0) {
        await labels.first().click({ timeout: 5000 });
        const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        log('tema gelap (class .dark di <html>)', isDark, `dark=${isDark}`);
        await page.goto(BASE + '/dashboard/tutorial', { waitUntil: 'load' });
        await page.waitForTimeout(400);
        await page.screenshot({ path: 'ff-tutorial-dark.png', fullPage: true });
      } else {
        log('tema gelap (radiogroup tak ditemukan)', true, 'SKIP - bukan kegagalan');
      }
    } catch (e) {
      log('tema gelap', false, String(e).slice(0, 200));
    }
  } else {
    console.log('SKIP | login + halaman terproteksi — set UJI_EMAIL & UJI_PASS untuk cakupan penuh');
  }

  await browser.close();

  const fails = results.filter((r) => !r.ok);
  console.log('\n=== RINGKASAN ===');
  console.log(`total=${results.length} pass=${results.length - fails.length} fail=${fails.length}`);
  fails.forEach((f) => console.log(`  FAIL: ${f.name} — ${f.detail}`));
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  console.error('FATAL:', e);
  process.exit(2);
});
