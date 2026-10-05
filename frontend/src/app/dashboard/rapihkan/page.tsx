"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { isInsufficientCredits } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type Det = { idx: number; tingkat: number; asal: string; teks: string; nomorLama: string; ragu: boolean };

const FONTS = ["Times New Roman", "Arial", "Calibri", "Cambria", "Garamond", "Book Antiqua"];

export default function RapihkanSkripsiPage() {
  const inp = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [setelan, setSetelan] = useState<any>(null);
  const [judul, setJudul] = useState<Det[]>([]);
  const [stat, setStat] = useState<any>(null);
  const [q, setQ] = useState("");
  const [paraList, setParaList] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [needsTopup, setNeedsTopup] = useState(false);
  const [doneUrl, setDoneUrl] = useState("");
  const [doneName, setDoneName] = useState("");

  function api(path: string) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${path}`;
  }

  const set = (k: string, v: any) => setSetelan((s: any) => ({ ...s, [k]: v }));

  async function token() {
    const { data } = await supabase.auth.getSession();
    let t = data.session?.access_token || '';
    if (!t) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.endsWith('-auth-token')) {
          try { t = JSON.parse(localStorage.getItem(k) || '').access_token || ''; if (t) break; } catch {}
        }
      }
    }
    return t;
  }

  async function analisis(f: File) {
    if (!/\.docx$/i.test(f.name)) { setMsg("Berkas harus .docx (Word). PDF belum bisa."); return; }
    if (f.size > 15 * 1024 * 1024) { setMsg("Berkas terlalu besar (maks 15 MB)."); return; }
    setFile(f); setReading(true); setMsg(""); setDoneUrl("");
    try {
      const fd = new FormData();
      fd.append('file', f);
      const tt = await token();
      const hh: Record<string, string> = tt ? { Authorization: `Bearer ${tt}` } : {};
      const res = await fetch(api('/api/files/rapihkan/analisis'), { method: 'POST', headers: hh, body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Berkas gagal dibaca.');
      setSetelan(j.setelan); setJudul(j.judul || []); setParaList(j.paragraf || []); setStat(j.statistik);
    } catch (e: any) { setMsg("Error: " + e.message); setFile(null); }
    setReading(false);
  }

  function ubahTingkat(idx: number, v: string) {
    if (v === 'bukan') { setJudul(judul.filter((j) => j.idx !== idx)); return; }
    const n = Number(v);
    const ada = judul.find((j) => j.idx === idx);
    if (ada) setJudul(judul.map((j) => j.idx === idx ? { ...j, tingkat: n, ragu: false } : j).sort((a, b) => a.idx - b.idx));
    else {
      const p = paraList.find((x: any) => x.idx === idx);
      setJudul([...judul, { idx, tingkat: n, asal: 'manual', teks: p?.teks || '', nomorLama: '', ragu: false }].sort((a, b) => a.idx - b.idx));
    }
  }

  async function terapkan() {
    if (!file) return;
    setApplying(true); setMsg(""); setNeedsTopup(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('setelan', JSON.stringify(setelan));
      fd.append('koreksi', JSON.stringify(judul.map((j) => ({ idx: j.idx, tingkat: j.tingkat }))));
      const t = await token();
      const hh2: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
      const res = await fetch(api('/api/files/rapihkan/terapkan'), { method: 'POST', headers: hh2, body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 402) setNeedsTopup(true);
        throw new Error(j.error || 'Gagal merapikan.');
      }
      const ring = JSON.parse(decodeURIComponent(res.headers.get('X-Rapih-Ringkasan') || '{}'));
      const blob = await res.blob();
      const nama = `${file.name.replace(/\.docx$/i, '')} (rapih).docx`;
      setDoneUrl(URL.createObjectURL(blob));
      setDoneName(nama);
      setMsg(`Selesai — ${ring.paragrafDiubah} paragraf dirapikan, ${ring.judulDitandai} judul ditandai (${ring.tarif === 0 ? 'gratis (berkas sama)' : ring.tarif + ' kredit'}). Saat dibuka di Word, jawab Yes bila ditanya update fields.`);
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      setMsg("Error: " + e.message);
    }
    setApplying(false);
  }

  const cari = q.trim().length >= 2
    ? paraList.filter((x: any) => x.teks.toLowerCase().includes(q.toLowerCase()) && !judul.some((j) => j.idx === x.idx)).slice(0, 25)
    : [];

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <h1 className="text-xl font-bold text-text-primary">Rapihkan Skripsi</h1>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-4 overflow-y-auto pb-24">
        <p className="text-text-secondary text-sm">Unggah .docx dari mana pun · margin, spasi, huruf, penomoran bab, daftar isi, nomor halaman · isi naskah tidak diubah · Berkasnya tidak kami simpan.</p>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={inp} type="file" accept=".docx" className="hidden" onChange={(e) => e.target.files?.[0] && analisis(e.target.files[0])} />
            <button onClick={() => inp.current?.click()} disabled={reading} className="border border-border-strong px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
              {reading ? 'Membaca...' : file ? 'Ganti berkas' : 'Pilih berkas .docx'}
            </button>
            {file ? <span className="text-sm text-text-primary truncate">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</span>
              : <span className="text-[13px] text-text-muted">Word (.docx) dari mana pun — maks 15 MB. Berkasnya tidak kami simpan.</span>}
          </div>
          {stat && <p className="mt-2 text-[11px] text-text-muted">{stat.paragraf} paragraf · {judul.length} judul terdeteksi · {stat.tabel} tabel · {stat.gambar} gambar{stat.punyaTocLama ? ' · ada daftar isi lama' : ''}</p>}
        </div>

        {file && !reading && setelan && (
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-3">
              <h2 className="font-bold text-sm text-text-primary">Setelan format</h2>
              <div>
                <label className="text-[11px] font-bold">Margin halaman (cm)</label>
                <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[['marginAtasCm', 'Atas'], ['marginBawahCm', 'Bawah'], ['marginKiriCm', 'Kiri'], ['marginKananCm', 'Kanan']].map(([k, l]) => (
                    <label key={k} className="flex items-center gap-1.5 text-[10px] text-text-muted">
                      {l}
                      <input type="number" step="0.1" min="0.5" max="8" value={setelan[k]} onChange={(e) => set(k, Number(e.target.value))} className="w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                <div>
                  <label className="text-[11px] font-bold">Huruf</label>
                  <select value={setelan.font} onChange={(e) => set('font', e.target.value)} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    {["Times New Roman", "Arial", "Calibri", "Cambria", "Garamond", "Book Antiqua"].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold">Ukuran</label>
                  <select value={setelan.ukuranPt} onChange={(e) => set('ukuranPt', Number(e.target.value))} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    {[10, 11, 12, 13, 14].map((n) => <option key={n} value={n}>{n} pt</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold">Spasi</label>
                  <select value={setelan.spasi} onChange={(e) => set('spasi', Number(e.target.value))} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    {[1, 1.15, 1.5, 2].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold">Menjorok</label>
                  <select value={setelan.indentCm} onChange={(e) => set('indentCm', Number(e.target.value))} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    {[0, 1, 1.27, 1.5].map((n) => <option key={n} value={n}>{n === 0 ? 'tanpa' : `${n} cm`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold">Penomoran BAB</label>
                  <select value={setelan.nomorBab} onChange={(e) => set('nomorBab', e.target.value)} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    <option value="romawi">BAB I, II, III</option>
                    <option value="arab">BAB 1, 2, 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold">Penomoran sub-bab</label>
                  <select value={setelan.nomorSubBab} onChange={(e) => set('nomorSubBab', e.target.value)} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    <option value="angka">1.1 · 1.1.1</option>
                    <option value="huruf">A. · 1.</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold">Daftar isi</label>
                  <select value={setelan.daftarIsi} onChange={(e) => set('daftarIsi', e.target.value)} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    <option value="3">Buat — 3 tingkat</option>
                    <option value="2">Buat — 2 tingkat</option>
                    <option value="mati">Jangan buat</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold">Nomor halaman</label>
                  <select value={setelan.nomorHalaman} onChange={(e) => set('nomorHalaman', e.target.value)} className="mt-1 w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary">
                    <option value="romawi-arab">i, ii lalu 1, 2 dari Bab I</option>
                    <option value="arab">1, 2, 3 semua</option>
                    <option value="mati">Jangan pasang</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-text-muted">Nomor halaman & footer lama diganti. Isi naskah, tabel, gambar, dan sitasi tidak disentuh.</p>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border-subtle font-bold text-sm">Struktur terdeteksi ({judul.length})</div>
              <div className="max-h-[300px] divide-y divide-line overflow-y-auto">
                {judul.length === 0 && <p className="px-4 py-8 text-center text-xs text-text-muted">Tak ada judul terdeteksi. Format tetap bisa dirapikan, atau tandai sendiri di bawah.</p>}
                {judul.map((j) => (
                  <div key={j.idx} className={`flex items-center gap-2 p-2 ${j.ragu ? 'bg-amber-50 dark:bg-amber-400/5' : ''}`}>
                    <span className="text-[10px] text-text-muted w-7">#{j.idx}</span>
                    <span className="flex-1 min-w-0 truncate text-xs text-text-primary">{j.teks || '(tanpa teks)'}</span>
                    <select value={String(j.tingkat)} onChange={(e) => ubahTingkat(j.idx, e.target.value)} className="h-7 text-[11px] bg-bg-base border border-border-strong rounded">
                      <option value="1">Bab / Judul</option>
                      <option value="2">Sub-bab</option>
                      <option value="3">Sub-sub-bab</option>
                      <option value="bukan">Bukan judul</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="border-t border-border-subtle p-2">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ketik sebagian judulnya…" className="w-full bg-bg-base border border-border-strong rounded p-1.5 text-xs text-text-primary" />
                {q.trim().length >= 2 && paraList.filter((x: any) => x.teks.toLowerCase().includes(q.toLowerCase()) && !judul.some((j) => j.idx === x.idx)).slice(0, 10).map((x: any) => (
                  <div key={x.idx} className="flex items-center gap-2 py-1.5">
                    <span className="flex-1 truncate text-[11px] text-text-muted">{x.teks}</span>
                    <button onClick={() => ubahTingkat(x.idx, '2')} className="text-[10px] border border-border-strong rounded px-2 py-0.5">Jadikan sub-bab</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {file && !reading && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-wrap items-center gap-3">
            <button onClick={terapkan} disabled={applying} className="bg-brand-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
              {applying ? 'Merapikan…' : 'Rapihkan & Unduh'}
            </button>
            <span className="text-[11px] text-text-muted">1 kredit · mengulang berkas yang sama dalam 24 jam: gratis</span>
            {doneUrl && <a href={doneUrl} download={doneName} className="ml-auto border border-border-strong px-4 py-2 rounded-lg text-sm font-bold">Unduh lagi</a>}
          </div>
        )}

        {needsTopup && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm flex justify-between items-center">
            <span>Kredit habis.</span>
            <Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Pilih Paket →</Link>
          </div>
        )}
        {msg && <p className="text-sm text-text-secondary">{msg}</p>}
      </div>
    </div>
  );
}
