"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { isInsufficientCredits } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Det = { idx: number; tingkat: number; asal: string; teks: string; nomorLama: string; ragu: boolean };

const MAKS_MB = 8;
const FONTS = ["Times New Roman", "Arial", "Calibri", "Cambria", "Garamond", "Book Antiqua"];

/* Ikon (lucide-equivalent, inline) */
const svg = "size-4 shrink-0";
const IcUpload = () => (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
);
const IcWand = () => (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" /></svg>
);
const IcSpin = () => (
  <svg className={`${svg} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
const IcFile = () => (
  <svg className={`${svg} text-text-muted`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
);
const IcWarn = () => (
  <svg className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
);
const IcSearch = () => (
  <svg className="mr-1 inline size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const IcDownload = () => (
  <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
);
const IcCheck = () => (
  <svg className="size-4 shrink-0 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
);

const CHECKBOXES: [string, string][] = [
  ["autoHeading", "Pasang gaya Judul Word (syarat daftar isi otomatis)"],
  ["rataKiriKanan", "Rata kiri-kanan (justify)"],
  ["babHalamanBaru", "Tiap BAB mulai di halaman baru"],
  ["gantungDaftarPustaka", "Daftar Pustaka menggantung (APA)"],
  ["buangDaftarIsiLama", "Buang daftar isi lama"],
  ["sertakanTabel", "Seragamkan huruf di dalam tabel juga"],
];

export default function RapihkanSkripsiPage() {
  const inp = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [setelan, setSetelan] = useState<any>(null);
  const [judul, setJudul] = useState<Det[]>([]);
  const [stat, setStat] = useState<any>(null);
  const [gagal, setGagal] = useState(false);
  const [q, setQ] = useState("");
  const [paraList, setParaList] = useState<any[]>([]);
  const [needsTopup, setNeedsTopup] = useState(false);
  const [ring, setRing] = useState<any>(null);
  const [doneUrl, setDoneUrl] = useState("");
  const [doneName, setDoneName] = useState("");
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const say = (ok: boolean, text: string) => {
    setToast({ ok, text });
    if (typeof window !== "undefined") window.setTimeout(() => setToast(null), 4500);
  };

  function api(path: string) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${path}`;
  }

  const set = (k: string, v: any) => setSetelan((s: any) => ({ ...s, [k]: v }));

  async function token() {
    const { data } = await supabase.auth.getSession();
    let t = data.session?.access_token || "";
    if (!t) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        if (k.endsWith("-auth-token")) {
          try { t = JSON.parse(localStorage.getItem(k) || "").access_token || ""; if (t) break; } catch { /* lanjut */ }
        }
      }
    }
    return t;
  }

  async function analisis(f: File) {
    if (!/\.docx$/i.test(f.name)) { say(false, "Berkas harus .docx (Word). PDF belum bisa."); return; }
    if (f.size > MAKS_MB * 1024 * 1024) { say(false, `Berkas terlalu besar (maks ${MAKS_MB} MB).`); return; }
    setFile(f); setReading(true); setDoneUrl(""); setRing(null); setJudul([]); setParaList([]); setStat(null); setGagal(false);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const tt = await token();
      const hh: Record<string, string> = tt ? { Authorization: `Bearer ${tt}` } : {};
      const res = await fetch(api("/api/files/rapihkan/analisis"), { method: "POST", headers: hh, body: fd });
      const j = await res.json();
      if (!res.ok) { say(false, j.error || "Berkas gagal dibaca."); setFile(null); setReading(false); return; }
      setSetelan((s: any) => ({ ...(s || {}), ...j.setelan }));
      setJudul(j.judul || []);
      setParaList(j.paragraf || []);
      setStat(j.statistik || null);
      setGagal(!!j.gagalWaras);
      say(true, `Terbaca: ${j.statistik?.paragraf ?? 0} paragraf, ${(j.judul || []).length} judul.`);
    } catch {
      say(false, "Gangguan jaringan saat membaca berkas.");
      setFile(null);
    }
    setReading(false);
  }

  function ubahTingkat(idx: number, v: string) {
    if (v === "bukan") { setJudul(judul.filter((j) => j.idx !== idx)); return; }
    const n = Number(v);
    const ada = judul.find((j) => j.idx === idx);
    if (ada) setJudul(judul.map((j) => (j.idx === idx ? { ...j, tingkat: n, ragu: false } : j)).sort((a, b) => a.idx - b.idx));
    else {
      const p = paraList.find((x: any) => x.idx === idx);
      setJudul([...judul, { idx, tingkat: n, asal: "pola", teks: p?.teks || "", nomorLama: "", ragu: false }].sort((a, b) => a.idx - b.idx));
    }
  }

  async function terapkan() {
    if (!file) return;
    setApplying(true); setNeedsTopup(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("setelan", JSON.stringify(setelan));
      // Sama seperti referensi: judul terpilih pakai tingkatnya, sisanya dikirim null
      const sisa = paraList.filter((x: any) => !judul.some((j) => j.idx === x.idx)).map((x: any) => ({ idx: x.idx, tingkat: null }));
      fd.append("koreksi", JSON.stringify([...judul.map((j) => ({ idx: j.idx, tingkat: j.tingkat })), ...sisa]));
      const t = await token();
      const hh: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
      const res = await fetch(api("/api/files/rapihkan/terapkan"), { method: "POST", headers: hh, body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 402) setNeedsTopup(true);
        throw new Error(j.error || "Gangguan jaringan saat merapikan.");
      }
      const r = JSON.parse(decodeURIComponent(res.headers.get("X-Rapih-Ringkasan") || "{}"));
      const blob = await res.blob();
      const nama = `${file.name.replace(/\.docx$/i, "")} (rapih).docx`;
      setDoneUrl(URL.createObjectURL(blob));
      setDoneName(nama);
      setRing(r);
      say(true, r.gratis ? "Selesai — gratis (berkas yang sama)." : `Selesai — ${r.tarif ?? 0} kredit.`);
    } catch (e: any) {
      if (isInsufficientCredits(e)) { setNeedsTopup(true); say(false, String(e.message || "Kredit habis.")); }
      else say(false, /jaringan|fetch|network/i.test(String(e?.message)) ? "Gangguan jaringan saat merapikan." : String(e.message || "Gagal merapikan."));
    }
    setApplying(false);
  }

  const ragu = judul.filter((j) => j.ragu);
  const cari = q.trim().length >= 2
    ? paraList.filter((x: any) => x.teks.toLowerCase().includes(q.toLowerCase()) && !judul.some((j) => j.idx === x.idx)).slice(0, 25)
    : [];
  const sel = "mt-1 h-9 w-full min-w-0 rounded-md border border-border-strong bg-bg-base px-2 text-xs text-text-primary";

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <h1 className="text-xl font-bold text-text-primary">Rapihkan Skripsi</h1>
      </header>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-3 overflow-y-auto pb-24">
        <p className="text-text-secondary text-sm">
          Unggah .docx dari mana pun · margin, spasi, huruf, penomoran bab, daftar isi, nomor halaman · isi naskah tidak diubah
        </p>

        {/* Berkas + statistik */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={inp} type="file" accept=".docx" className="hidden" onChange={(e) => e.target.files?.[0] && analisis(e.target.files[0])} />
            <button
              onClick={() => inp.current?.click()}
              disabled={reading}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand-primary px-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {reading ? <IcSpin /> : <IcUpload />}
              Pilih berkas .docx
            </button>
            {file ? (
              <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-text-primary">
                <IcFile />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-text-muted">· {(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </span>
            ) : (
              <span className="text-[13px] text-text-muted">Word (.docx) dari mana pun — maks {MAKS_MB} MB. Berkasnya tidak kami simpan.</span>
            )}
          </div>

          {stat && (
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] tabular-nums text-text-muted">
              <span>{stat.paragraf} paragraf</span>
              <span>{judul.length} judul terdeteksi</span>
              <span>{stat.tabel} tabel</span>
              <span>{stat.gambar} gambar</span>
              {(stat.catatanKaki || 0) > 0 && <span>{stat.catatanKaki} catatan kaki</span>}
              {stat.punyaTocLama && <span>ada daftar isi lama</span>}
            </p>
          )}

          {gagal && (
            <p className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 p-2 text-[11px] leading-relaxed text-text-primary dark:border-amber-400/40 dark:bg-amber-400/10">
              <IcWarn />
              Struktur judul tidak bisa dikenali dengan yakin (terlalu banyak paragraf mirip judul), jadi kami tidak menebak. Format tetap bisa
              dirapikan; penomoran &amp; daftar isi sebaiknya dimatikan, atau tandai sendiri judulnya di daftar paragraf di bawah.
            </p>
          )}
        </div>

        {/* Setelan format + struktur */}
        {file && !reading && setelan && (
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <div className="min-w-0 space-y-3 rounded-xl border border-border-subtle bg-bg-surface p-3">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
                <span className="text-brand-primary"><IcWand /></span> Setelan format
              </h2>

              <div>
                <label className="text-[11px] font-bold text-text-secondary">Margin halaman (cm)</label>
                <div className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {[["marginAtasCm", "Atas"], ["marginBawahCm", "Bawah"], ["marginKiriCm", "Kiri"], ["marginKananCm", "Kanan"]].map(([k, l]) => (
                    <label key={k} className="flex items-center gap-1.5">
                      <span className="w-10 shrink-0 text-[10px] text-text-muted">{l}</span>
                      <input
                        type="number" step="0.1" min="0.5" max="8" aria-label={l}
                        value={setelan[k]} onChange={(e) => set(k, Number(e.target.value))}
                        className="h-9 min-w-0 w-full flex-1 rounded-md border border-border-strong bg-bg-base px-2 text-xs tabular-nums text-text-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Huruf</label>
                  <select value={setelan.font} onChange={(e) => set("font", e.target.value)} className={sel}>
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Ukuran</label>
                  <select value={setelan.ukuranPt} onChange={(e) => set("ukuranPt", Number(e.target.value))} className={sel}>
                    {[10, 11, 12, 13, 14].map((n) => <option key={n} value={n}>{n} pt</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Spasi</label>
                  <select value={setelan.spasi} onChange={(e) => set("spasi", Number(e.target.value))} className={sel}>
                    {[1, 1.15, 1.5, 2].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Menjorok</label>
                  <select value={setelan.indentCm} onChange={(e) => set("indentCm", Number(e.target.value))} className={sel}>
                    {[0, 1, 1.27, 1.5].map((n) => <option key={n} value={n}>{n === 0 ? "tanpa" : `${n} cm`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Penomoran BAB</label>
                  <select value={setelan.nomorBab} onChange={(e) => set("nomorBab", e.target.value)} className={sel}>
                    <option value="romawi">BAB I, II, III</option>
                    <option value="arab">BAB 1, 2, 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Penomoran sub-bab</label>
                  <select value={setelan.nomorSubBab} onChange={(e) => set("nomorSubBab", e.target.value)} className={sel}>
                    <option value="angka">1.1 · 1.1.1</option>
                    <option value="huruf">A. · 1.</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Daftar isi</label>
                  <select value={setelan.daftarIsi} onChange={(e) => set("daftarIsi", e.target.value)} className={sel}>
                    <option value="3">Buat — 3 tingkat</option>
                    <option value="2">Buat — 2 tingkat</option>
                    <option value="mati">Jangan buat</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary">Nomor halaman</label>
                  <select value={setelan.nomorHalaman} onChange={(e) => set("nomorHalaman", e.target.value)} className={sel}>
                    <option value="romawi-arab">i, ii lalu 1, 2 dari Bab I</option>
                    <option value="arab">1, 2, 3 semua</option>
                    <option value="mati">Jangan pasang</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-border-subtle pt-2">
                {CHECKBOXES.map(([k, label]) => (
                  <label key={k} className="flex cursor-pointer items-start gap-2 text-[12px] text-text-primary">
                    <input type="checkbox" className="mt-0.5 size-3.5 accent-brand-primary" checked={!!setelan[k]} onChange={(e) => set(k, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex items-start gap-1.5 rounded-md border border-border-subtle bg-bg-base p-2 text-[11px] leading-relaxed text-text-secondary">
                <span className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400"><IcWarn /></span>
                Nomor halaman &amp; footer lama diganti — kalau footermu berisi nama kampus, isinya hilang. Tata letak halaman juga bergeser
                mengikuti margin baru. Isi naskah, tabel, gambar, catatan kaki, dan sitasi tidak disentuh.
              </div>
            </div>

            <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
              <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle p-3">
                <h2 className="mr-auto flex items-center gap-1.5 text-sm font-bold text-text-primary">
                  Struktur terdeteksi
                  <span className="rounded-md bg-bg-base px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-text-secondary">{judul.length}</span>
                </h2>
                {ragu.length > 0 && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/20 dark:text-amber-300">
                    {ragu.length} perlu dipastikan
                  </span>
                )}
              </div>

              <div className="max-h-[42vh] divide-y divide-border-subtle overflow-y-auto lg:max-h-[420px]">
                {judul.length === 0 && (
                  <p className="px-4 py-8 text-center text-xs text-text-muted">
                    Tak ada judul terdeteksi. Format tetap bisa dirapikan, atau tandai sendiri di daftar paragraf di bawah.
                  </p>
                )}
                {judul.map((j) => (
                  <div key={j.idx} className={`flex items-start gap-2 p-2 ${j.ragu ? "bg-amber-50 dark:bg-amber-400/5" : ""}`}>
                    <span className="mt-1 w-7 shrink-0 text-[10px] tabular-nums text-text-muted">#{j.idx}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-text-primary">{j.teks || "(tanpa teks)"}</span>
                      <span className="text-[10px] text-text-muted">
                        {j.asal === "gaya" ? "dari gaya Judul Word" : "dari pola teks"}
                        {j.nomorLama ? ` · nomor lama "${j.nomorLama}" diganti` : ""}
                      </span>
                    </span>
                    <select
                      value={String(j.tingkat)}
                      onChange={(e) => ubahTingkat(j.idx, e.target.value)}
                      className="h-7 w-[104px] shrink-0 rounded-md border border-border-strong bg-bg-base text-[11px] text-text-primary"
                    >
                      <option value="1">Bab / Judul</option>
                      <option value="2">Sub-bab</option>
                      <option value="3">Sub-sub-bab</option>
                      <option value="bukan">Bukan judul</option>
                    </select>
                  </div>
                ))}
              </div>

              <details className="border-t border-border-subtle">
                <summary className="cursor-pointer list-none px-3 py-2 text-[11px] font-semibold text-text-secondary hover:text-text-primary">
                  <IcSearch />Judul yang terlewat? Cari paragrafnya di sini
                </summary>
                <div className="border-t border-border-subtle p-2">
                  <input
                    value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik sebagian judulnya…"
                    className="h-8 w-full rounded-md border border-border-strong bg-bg-base px-2 text-xs text-text-primary placeholder:text-text-muted"
                  />
                  <div className="mt-1.5 max-h-48 divide-y divide-border-subtle overflow-y-auto">
                    {cari.map((x: any) => (
                      <div key={x.idx} className="flex items-center gap-2 py-1.5">
                        <span className="min-w-0 flex-1 truncate text-[11.5px] text-text-secondary">{x.teks}</span>
                        <button
                          onClick={() => ubahTingkat(x.idx, "2")}
                          className="h-6 shrink-0 rounded-md border border-border-strong px-2 text-[10px] font-bold text-text-primary"
                        >
                          Jadikan sub-bab
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Aksi */}
        {file && !reading && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-3">
            <button
              onClick={terapkan} disabled={applying}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {applying ? <><IcSpin /> Merapikan…</> : <><IcWand /> Rapihkan &amp; Unduh</>}
            </button>
            <span className="text-[11px] text-text-secondary">
              3 kredit · mengubah setelan lalu mengulang berkas yang sama dalam 24 jam: gratis
            </span>
            {doneUrl && (
              <a href={doneUrl} download={doneName} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-sm font-bold text-text-primary">
                <IcDownload /> Unduh
              </a>
            )}

            {ring && doneUrl && (
              <div className="w-full border-t border-border-subtle pt-3">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
                  <IcCheck /> Berkas rapih sudah terunduh.
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] tabular-nums text-text-secondary">
                  <span>{ring.paragrafDiubah} paragraf dirapikan</span>
                  <span>{ring.judulDitandai} judul ditandai</span>
                  <span>{ring.bagian} bagian halaman</span>
                  {Number(ring.paragrafTabelDilewati) > 0 && <span>{ring.paragrafTabelDilewati} paragraf tabel dilewati</span>}
                  <span>{ring.tarif === 0 ? "gratis (berkas sama)" : `${ring.tarif} kredit`}</span>
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                  Saat dibuka di Word, jawab <b>Yes</b> bila ditanya &quot;update fields&quot; — itu yang mengisi daftar isi &amp; nomor halamannya.
                </p>
              </div>
            )}
          </div>
        )}

        {needsTopup && (
          <div className="flex items-center justify-between rounded-lg border border-accent-red/30 bg-accent-red/10 p-4 text-sm">
            <span className="text-text-primary">Kredit habis.</span>
            <Link href="/dashboard/billing" className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white">Pilih Paket →</Link>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-sm shadow-lg">
          <span className={toast.ok ? "text-text-primary" : "text-accent-red"}>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
