import { genAI } from "../config/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { bacaSetting } from "./settings.service";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Kuota Free Tier Google (RPM + request/hari) dihitung PER MODEL — bukan per akun.
// Saat satu model habis kita pindah ke model berikutnya, jadi kapasitas harian
// menjadi gabungan seluruh model di daftar ini (bukan cuma 20 request).
// Urutan: kualitas dulu, model lite di belakang.
// Daftar ini = DEFAULT; nilai sebenarnya bisa diubah lewat Dashboard Admin
// (app_settings 'ai_models') — lihat muatPengaturanModel() di bawah.
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

// Satu entri = satu model pada satu "router" (provider + endpoint + key).
// - provider 'gemini' : API Gemini resmi (baseUrl.opsional utk relay Gemini-compatible)
// - provider 'openai' : gateway OpenAI-compatible (OpenRouter/OneAPI/NewAPI/LiteLLM/dll)
// apiKey kosong → pakai GEMINI_API_KEY (.env) untuk gemini.
export type EntriModel = {
  id: string;
  provider: "gemini" | "openai";
  baseUrl?: string;
  apiKey?: string;
  aktif: boolean;
};

let daftarEntri: EntriModel[] = MODELS.map((id) => ({ id, provider: "gemini", aktif: true }));
let mulai = 0; // index entri terakhir yang berhasil (dipakai duluan)

export const daftarModel = () => daftarEntri;
const entriAktif = () => daftarEntri.filter((e) => e.aktif !== false);

// Kunci status (blok/RPM) per entri — dua entri beda provider/baseUrl = kuota terpisah.
function kunci(e: EntriModel): string {
  return `${e.provider}|${e.id}|${e.baseUrl || ""}`;
}

// Muat pengaturan model dari DB (dipanggil saat boot & setelah simpan di Dashboard Admin)
export async function muatPengaturanModel(): Promise<void> {
  try {
    const v = await bacaSetting("ai_models");
    if (v === null || v === undefined) {
      // Pengaturan kosong/dihapus (reset) → kembali ke daftar bawaan
      const def = MODELS.map((id) => ({ id, provider: "gemini" as const, aktif: true }));
      if (daftarEntri.some((e, i) => e.id !== def[i]?.id || def.length !== daftarEntri.length)) {
        daftarEntri = def;
        mulai = 0;
        console.log("[ai] pengaturan model kosong → daftar bawaan dipakai");
      }
      return;
    }
    if (Array.isArray(v) && v.length) {
      daftarEntri = v
        .filter((x: any) => x && typeof x.id === "string" && x.id)
        .map((x: any) => ({
          id: String(x.id),
          provider: x.provider === "openai" ? "openai" : "gemini",
          baseUrl: x.baseUrl ? String(x.baseUrl) : undefined,
          apiKey: x.apiKey ? String(x.apiKey) : undefined,
          aktif: x.aktif !== false,
        }));
      mulai = 0;
      console.log(`[ai] pengaturan model dimuat: ${daftarEntri.length} entri (${daftarEntri.filter((e) => e.aktif).length} aktif)`);
    }
  } catch (e: any) {
    console.warn("[ai] gagal muat pengaturan model:", e?.message || e);
  }
}

// Status runtime untuk Dashboard Admin (blok kuota, rpm, urutan)
export function statusModel() {
  const now = Date.now();
  return {
    urutanAktif: mulai,
    entri: daftarEntri.map((e, i) => {
      const sisa = (blok[kunci(e)] || 0) - now;
      return {
        i,
        id: e.id,
        provider: e.provider,
        baseUrl: e.baseUrl || "",
        aktif: e.aktif !== false,
        blokMenit: sisa > 0 ? Math.ceil(sisa / 60000) : 0,
        rpm: jendela(kunci(e)).length,
      };
    }),
  };
}

const MAX_RPM = 4; // batas free tier = 5 RPM, sisakan cadangan

const blok: Record<string, number> = {}; // kunci entri -> epoch sampai kapan ditahan (kuota harian)
const stamp: Record<string, number[]> = {}; // kunci entri -> waktu request 60 detik terakhir

function jendela(k: string): number[] {
  const t = stamp[k] || (stamp[k] = []);
  const now = Date.now();
  while (t.length && now - t[0] > 60000) t.shift();
  return t;
}

function pilihEntri(): { entri: EntriModel; tunggu: number } {
  const arr = entriAktif();
  if (!arr.length) throw new Error("Tidak ada model aktif — atur daftar model di Dashboard Admin.");
  const now = Date.now();
  // 1) entri bebas: tidak diblokir dan ruang RPM-nya masih ada
  for (let n = 0; n < arr.length; n++) {
    const e = arr[(mulai + n) % arr.length];
    if ((blok[kunci(e)] || 0) > now) continue;
    if (jendela(kunci(e)).length < MAX_RPM) return { entri: e, tunggu: 0 };
  }
  // 2) semuanya hampir penuh sebentar lagi → tunggu slot tercepat
  let tercepat: { e: EntriModel; w: number } | null = null;
  for (const e of arr) {
    if ((blok[kunci(e)] || 0) > now) continue;
    const t = jendela(kunci(e));
    if (!t.length) return { entri: e, tunggu: 0 };
    const w = 60000 - (now - t[0]) + 50;
    if (!tercepat || w < tercepat.w) tercepat = { e, w };
  }
  if (tercepat) return { entri: tercepat.e, tunggu: tercepat.w };
  // 3) semua kena kuota harian → pakai yang paling cepat bebas lagi
  const bebas = arr.map((e) => ({ e, w: (blok[kunci(e)] || 0) - now })).sort((a, b) => a.w - b.w)[0];
  return { entri: bebas.e, tunggu: Math.max(bebas.w, 0) + 100 };
}

// Tahan model sesuai sisa kuota yang disebut Google ("retryDelay":14088s)
function catatGagal(k: string, err: any) {
  const msg = String(err?.message || "");
  const m = msg.match(/retryDelay["':\s]+(\d+)s/);
  const detik = m ? parseInt(m[1], 10) : 3600;
  if (/quota|429|RESOURCE_EXHAUSTED|per day|rate limit|too many requests/i.test(msg)) {
    blok[k] = Date.now() + Math.min(Math.max(detik, 300), 6 * 3600) * 1000;
    console.warn(`[ai] tahan ${k} ${Math.round((blok[k] - Date.now()) / 60000)} menit: ${msg.slice(0, 140)}`);
  } else if (/not found|NOT_FOUND|is not supported|404/i.test(msg)) {
    blok[k] = Date.now() + 6 * 3600 * 1000;
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
    const fin = resp?.candidates?.[0]?.finishReason || "?";
    const u = resp?.usageMetadata || {};
    console.log(`[ai] ${model} finish=${fin} out=${u.candidatesTokenCount ?? "-"} total=${u.totalTokenCount ?? "-"}`);
    if (fin === "MAX_TOKENS") console.warn(`[ai] PERHATIAN: output ${model} POTONG di MAX_TOKENS — periksa target prompt/batas output`);
  } catch { /* logging saja */ }
}

// Instance SDK per entri: key khusus entri (multi-key Gemini) atau default (.env)
function sdk(e: EntriModel): GoogleGenerativeAI {
  if (!e.apiKey && !e.baseUrl) return genAI;
  return new GoogleGenerativeAI(e.apiKey || process.env.GEMINI_API_KEY || "");
}

function opsi(e: EntriModel) {
  return e.baseUrl ? { baseUrl: e.baseUrl } : undefined;
}

async function bukaStream(e: EntriModel, prompt: string) {
  try {
    return await sdk(e).getGenerativeModel({ model: e.id, generationConfig: { maxOutputTokens: MAX_OUT } }, opsi(e)).generateContentStream(prompt);
  } catch (err: any) {
    if (/maxOutputTokens|invalid[_ ]?argument/i.test(String(err?.message || ""))) {
      console.warn(`[ai] ${e.id} menolak maxOutputTokens=${MAX_OUT} — ulang tanpa konfigurasi`);
      return await sdk(e).getGenerativeModel({ model: e.id }, opsi(e)).generateContentStream(prompt);
    }
    throw err;
  }
}

// —— Gateway OpenAI-compatible (OpenRouter/OneAPI/NewAPI/LiteLLM/dll): streaming SSE ——
async function* streamOpenAI(e: EntriModel, prompt: string): AsyncGenerator<string> {
  const base = (e.baseUrl || "").replace(/\/+$/, "");
  if (!base) throw new Error("openai: baseUrl wajib diisi (endpoint gateway, mis. https://xxx/api/v1)");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${e.apiKey || process.env.OPENAI_COMPAT_KEY || ""}` },
    body: JSON.stringify({
      model: e.id,
      stream: true,
      max_tokens: MAX_OUT,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${t.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const j = JSON.parse(data);
        const t = j.choices?.[0]?.delta?.content;
        if (t) yield t;
      } catch { /* potongan tak lengkap — abaikan */ }
    }
  }
}

async function teksOpenAI(e: EntriModel, prompt: string): Promise<string> {
  const base = (e.baseUrl || "").replace(/\/+$/, "");
  if (!base) throw new Error("openai: baseUrl wajib diisi (endpoint gateway, mis. https://xxx/api/v1)");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${e.apiKey || process.env.OPENAI_COMPAT_KEY || ""}` },
    body: JSON.stringify({ model: e.id, max_tokens: MAX_OUT, messages: [{ role: "user", content: prompt }] }),
  });
  const t = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} ${t.slice(0, 300)}`);
  try {
    const j = JSON.parse(t);
    return j.choices?.[0]?.message?.content || "";
  } catch {
    throw new Error(`openai: balasan bukan JSON valid ${t.slice(0, 200)}`);
  }
}

// Tes koneksi satu entri (dipanggil tombol "Tes" di Dashboard Admin)
export async function tesModel(e: EntriModel): Promise<{ ok: boolean; pesan: string; ms: number }> {
  const t0 = Date.now();
  try {
    if (e.provider === "openai") {
      const base = (e.baseUrl || "").replace(/\/+$/, "");
      if (!base) return { ok: false, pesan: "baseUrl wajib untuk provider openai/gateway", ms: 0 };
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${e.apiKey || process.env.OPENAI_COMPAT_KEY || ""}` },
        body: JSON.stringify({ model: e.id, max_tokens: 16, messages: [{ role: "user", content: "balas: ok" }] }),
      });
      const teks = await res.text();
      if (!res.ok) return { ok: false, pesan: `HTTP ${res.status} ${teks.slice(0, 180)}`, ms: Date.now() - t0 };
      let isi = "";
      try { isi = JSON.parse(teks).choices?.[0]?.message?.content || ""; } catch { isi = teks.slice(0, 60); }
      return { ok: true, pesan: `OK (${Date.now() - t0} ms) — "${isi.slice(0, 60)}"`, ms: Date.now() - t0 };
    }
    const m = sdk(e).getGenerativeModel({ model: e.id, generationConfig: { maxOutputTokens: 16 } }, opsi(e));
    const hasil = await m.generateContent("balas: ok");
    const isi = (await hasil.response).text();
    return { ok: true, pesan: `OK (${Date.now() - t0} ms) — "${isi.slice(0, 60)}"`, ms: Date.now() - t0 };
  } catch (err: any) {
    return { ok: false, pesan: String(err?.message || err).slice(0, 300), ms: Date.now() - t0 };
  }
}

export const generateContentStream = async function* (prompt: string): AsyncGenerator<string> {
  let last: any;
  const total = () => Math.max(entriAktif().length, 1) * 2;
  for (let i = 0; i < total(); i++) {
    const { entri: e, tunggu } = pilihEntri();
    const k = kunci(e);
    if (tunggu > 0) await sleep(Math.min(tunggu, 65000));
    let sudah = false;
    try {
      jendela(k).push(Date.now());
      mulai = entriAktif().findIndex((x) => kunci(x) === k);
      if (e.provider === "openai") {
        console.log(`[ai] stream via openai:${e.id} @ ${e.baseUrl}`);
        for await (const t of streamOpenAI(e, prompt)) {
          if (t) { sudah = true; yield t; }
        }
        console.log(`[ai] openai:${e.id} finish=STREAM ok`);
        return;
      }
      const stream = await bukaStream(e, prompt);
      // Promise `response` SDK menolak saat stream gagal parse — bila tak dipegang,
      // Node melempar unhandledRejection dan MEMBUNUH proses server. Tangkap di sini
      // (await asli tetap menolak → error tetap terbaca pada jalur utama).
      (stream.response as Promise<unknown>).catch(() => {});
      console.log(`[ai] stream via ${e.id}`);
      for await (const chunk of stream.stream) {
        const t = chunk.text();
        if (t) { sudah = true; yield t; }
      }
      catatHasil(e.id, await stream.response);
      return;
    } catch (error: any) {
      last = error;
      catatGagal(k, error);
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
  const total = () => Math.max(entriAktif().length, 1) * 2;
  for (let i = 0; i < total() && i < retries + total(); i++) {
    const { entri: e, tunggu } = pilihEntri();
    const k = kunci(e);
    if (tunggu > 0) await sleep(Math.min(tunggu, 65000));
    try {
      jendela(k).push(Date.now());
      mulai = entriAktif().findIndex((x) => kunci(x) === k);
      if (e.provider === "openai") {
        console.log(`[ai] via openai:${e.id} @ ${e.baseUrl}`);
        const t = await teksOpenAI(e, prompt);
        console.log(`[ai] openai:${e.id} ok (${t.length} kar)`);
        return t;
      }
      const m = sdk(e).getGenerativeModel({ model: e.id, generationConfig: { maxOutputTokens: MAX_OUT } }, opsi(e));
      const result = await m.generateContent(prompt);
      const response = await result.response;
      console.log(`[ai] via ${e.id}`);
      catatHasil(e.id, response);
      return response.text();
    } catch (error: any) {
      // Nilai maxOutputTokens ditolak model ini → coba ulang tanpa konfigurasi
      if (e.provider === "gemini" && /maxOutputTokens|invalid[_ ]?argument/i.test(String(error?.message || "")) && retries > 0) {
        try {
          const m = sdk(e).getGenerativeModel({ model: e.id }, opsi(e));
          const result = await m.generateContent(prompt);
          const response = await result.response;
          console.log(`[ai] via ${e.id} (tanpa batas output)`);
          catatHasil(e.id, response);
          return response.text();
        } catch (e2: any) { last = e2; catatGagal(k, e2); await sleep(300); continue; }
      }
      last = error;
      catatGagal(k, error);
      if (!bisaCobaLagi(error)) break;
      await sleep(300);
    }
  }
  console.error("Error calling Gemini API:", last);
  throw new Error(last?.message || "Failed to generate content");
};
