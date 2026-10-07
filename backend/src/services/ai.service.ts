import { genAI } from "../config/gemini";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Kuota Free Tier Google (RPM + request/hari) dihitung PER MODEL — bukan per akun.
// Saat satu model habis kita pindah ke model berikutnya, jadi kapasitas harian
// menjadi gabungan seluruh model di daftar ini (bukan cuma 20 request).
// Urutan: kualitas dulu, model lite di belakang.
export const MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
];

const MAX_RPM = 4; // batas free tier = 5 RPM, sisakan cadangan

const blok: Record<string, number> = {}; // model -> epoch sampai kapan ditahan (kuota harian)
const stamp: Record<string, number[]> = {}; // model -> waktu request 60 detik terakhir
let mulai = 0; // index model terakhir yang berhasil (dipakai duluan)

function jendela(model: string): number[] {
  const t = stamp[model] || (stamp[model] = []);
  const now = Date.now();
  while (t.length && now - t[0] > 60000) t.shift();
  return t;
}

function pilihModel(): { model: string; tunggu: number } {
  const now = Date.now();
  // 1) model bebas: tidak diblokir dan ruang RPM-nya masih ada
  for (let n = 0; n < MODELS.length; n++) {
    const m = MODELS[(mulai + n) % MODELS.length];
    if ((blok[m] || 0) > now) continue;
    if (jendela(m).length < MAX_RPM) return { model: m, tunggu: 0 };
  }
  // 2) semuanya hampir penuh sebentar lagi → tunggu slot tercepat
  let tercepat: { m: string; w: number } | null = null;
  for (const m of MODELS) {
    if ((blok[m] || 0) > now) continue;
    const t = jendela(m);
    if (!t.length) return { model: m, tunggu: 0 };
    const w = 60000 - (now - t[0]) + 50;
    if (!tercepat || w < tercepat.w) tercepat = { m, w };
  }
  if (tercepat) return { model: tercepat.m, tunggu: tercepat.w };
  // 3) semua kena kuota harian → pakai yang paling cepat bebas lagi
  const bebas = MODELS.map((m) => ({ m, w: (blok[m] || 0) - now })).sort((a, b) => a.w - b.w)[0];
  return { model: bebas.m, tunggu: Math.max(bebas.w, 0) + 100 };
}

// Tahan model sesuai sisa kuota yang disebut Google ("retryDelay":14088s)
function catatGagal(model: string, err: any) {
  const msg = String(err?.message || "");
  const m = msg.match(/retryDelay["':\s]+(\d+)s/);
  const detik = m ? parseInt(m[1], 10) : 3600;
  if (/quota|429|RESOURCE_EXHAUSTED|per day|rate limit|too many requests/i.test(msg)) {
    blok[model] = Date.now() + Math.min(Math.max(detik, 300), 6 * 3600) * 1000;
    console.warn(`[ai] tahan ${model} ${Math.round((blok[model] - Date.now()) / 60000)} menit: ${msg.slice(0, 140)}`);
  } else if (/not found|NOT_FOUND|is not supported|404/i.test(msg)) {
    blok[model] = Date.now() + 6 * 3600 * 1000;
  }
}

function bisaCobaLagi(err: any): boolean {
  const msg = String(err?.message || "");
  return /429|quota|RESOURCE_EXHAUSTED|503|overload|high demand|too many requests|not found|NOT_FOUND|is not supported/i.test(msg);
}

// Batas output per request: bab panjang (Bab II target 40rb+ karakter ≈ 12rb token)
// butuh ruang jauh di atas default 8rb — kalau model tidak mendukung nilai ini,
// kita ulangi TANPA konfigurasi (fallback) supaya tetap jalan.
const MAX_OUT = 32768;

function catatHasil(model: string, resp: any) {
  try {
    const fin = resp?.candidates?.[0]?.finishReason || '?';
    const u = resp?.usageMetadata || {};
    console.log(`[ai] ${model} finish=${fin} out=${u.candidatesTokenCount ?? '-'} total=${u.totalTokenCount ?? '-'}`);
    if (fin === 'MAX_TOKENS') console.warn(`[ai] PERHATIAN: output ${model} POTONG di MAX_TOKENS — periksa target prompt/batas output`);
  } catch { /* logging saja */ }
}

async function bukaStream(model: string, prompt: string) {
  try {
    return await genAI.getGenerativeModel({ model, generationConfig: { maxOutputTokens: MAX_OUT } }).generateContentStream(prompt);
  } catch (e: any) {
    if (/maxOutputTokens|invalid[_ ]?argument/i.test(String(e?.message || ''))) {
      console.warn(`[ai] ${model} menolak maxOutputTokens=${MAX_OUT} — ulang tanpa konfigurasi`);
      return await genAI.getGenerativeModel({ model }).generateContentStream(prompt);
    }
    throw e;
  }
}

export const generateContentStream = async function* (prompt: string): AsyncGenerator<string> {
  let last: any;
  for (let i = 0; i < MODELS.length * 2; i++) {
    const { model, tunggu } = pilihModel();
    if (tunggu > 0) await sleep(Math.min(tunggu, 65000));
    let sudah = false;
    try {
      jendela(model).push(Date.now());
      mulai = MODELS.indexOf(model);
      const stream = await bukaStream(model, prompt);
      // Promise `response` SDK menolak saat stream gagal parse — bila tak dipegang,
      // Node melempar unhandledRejection dan MEMBUNUH proses server. Tangkap di sini
      // (await asli tetap menolak → error tetap terbaca pada jalur utama).
      (stream.response as Promise<unknown>).catch(() => {});
      console.log(`[ai] stream via ${model}`);
      for await (const chunk of stream.stream) {
        const t = chunk.text();
        if (t) { sudah = true; yield t; }
      }
      catatHasil(model, await stream.response);
      return;
    } catch (error: any) {
      last = error;
      catatGagal(model, error);
      if (sudah) throw error; // sebagian teks sudah terkirim → jangan mulai ulang
      if (!bisaCobaLagi(error)) break;
      await sleep(300);
    }
  }
  console.error("Error calling Gemini API:", last);
  throw new Error(last?.message || "Failed to generate content");
};

export const generateContent = async (prompt: string, retries = 2): Promise<string> => {
  let last: any;
  for (let i = 0; i < MODELS.length * 2 && i < retries + MODELS.length; i++) {
    const { model, tunggu } = pilihModel();
    if (tunggu > 0) await sleep(Math.min(tunggu, 65000));
    try {
      jendela(model).push(Date.now());
      mulai = MODELS.indexOf(model);
      const m = genAI.getGenerativeModel({ model, generationConfig: { maxOutputTokens: MAX_OUT } });
      const result = await m.generateContent(prompt);
      const response = await result.response;
      console.log(`[ai] via ${model}`);
      catatHasil(model, response);
      return response.text();
    } catch (error: any) {
      // Nilai maxOutputTokens ditolak model ini → coba ulang tanpa konfigurasi
      if (/maxOutputTokens|invalid[_ ]?argument/i.test(String(error?.message || '')) && retries > 0) {
        try {
          const m = genAI.getGenerativeModel({ model });
          const result = await m.generateContent(prompt);
          const response = await result.response;
          console.log(`[ai] via ${model} (tanpa batas output)`);
          catatHasil(model, response);
          return response.text();
        } catch (e2: any) { last = e2; catatGagal(model, e2); await sleep(300); continue; }
      }
      last = error;
      catatGagal(model, error);
      if (!bisaCobaLagi(error)) break;
      await sleep(300);
    }
  }
  console.error("Error calling Gemini API:", last);
  throw new Error(last?.message || "Failed to generate content");
};
