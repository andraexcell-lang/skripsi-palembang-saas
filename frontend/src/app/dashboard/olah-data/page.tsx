"use client";

import { aiGenerate, isInsufficientCredits } from "@/lib/api";
import CreditBadge from "@/components/CreditBadge";

import { useState } from "react";
import Link from "next/link";

// 6 kartu Olah Data paritas mantrariset §3.8 — urutan, judul, tag, dan harga
// persis referensi. id = key FEATURE_COSTS di backend (biaya otomatis terpotong).
const TOOLS = [
  {
    id: "transkripsi",
    judul: "Transkripsi Audio/Video",
    tag: "KUALITATIF",
    harga: "1 kredit / 10 menit",
    desc: "Tempel teks kasar dari audio/video (caption atau ketikan) — dirapikan jadi transkrip rapi per pembicara.",
    contoh: "Contoh teks kasar:\n[00:12] selamat pagi... kami bahas latar belakang dulu\n[00:41] oke jadi datanya dari kantor",
    hasil: "Hasil Transkripsi:",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h2"></path><path d="M6 8v8"></path><path d="M10 4v16"></path><path d="M14 7v10"></path><path d="M18 5v14"></path><path d="M22 10v4"></path></svg>,
  },
  {
    id: "spss",
    judul: "Olah Data SPSS",
    tag: "KUANTITATIF",
    harga: "3 kredit",
    desc: "Paste data mentah CSV/Tabel → uji statistik otomatis (validitas, regresi) dengan tabel gaya SPSS + interpretasi.",
    contoh: "Contoh data CSV:\nResponden, X1, X2, Y\n1, 4, 5, 4\n2, 3, 4, 3",
    hasil: "Output Bab IV:",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  },
  {
    id: "smartpls",
    judul: "Olah Data SmartPLS",
    tag: "KUANTITATIF",
    harga: "5 kredit",
    desc: "Uji PLS-SEM lengkap: outer/inner model, loading, AVE, CR, VIF, R², bootstrapping + interpretasi.",
    contoh: "Contoh model:\nX1 → Y: 0.42 (t=5.1)\nX2 → Y: 0.31 (t=3.8)\nLoading X1: 0.84, X2: 0.79, Y: 0.88\nAVE: X1 0.71, X2 0.63",
    hasil: "Output Bab IV:",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>,
  },
  {
    id: "kualitatif",
    judul: "Analisis Kualitatif",
    tag: "KUALITATIF",
    harga: "1 kredit / 3 informan",
    desc: "Paste transkrip wawancara → dapatkan tema, matriks, dan kutipan verbatim terstruktur otomatis.",
    contoh: "Contoh wawancara:\nPewawancara: Bagaimana strategi pemasaran Anda?\nNarasumber: Kami fokus ke media sosial...",
    hasil: "Output Bab IV:",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>,
  },
  {
    id: "dokumen",
    judul: "Analisis Dokumen",
    tag: "KUALITATIF",
    harga: "1 kredit / 3 segmen",
    desc: "Tempel dokumen (kebijakan, laporan, artikel) → tema, simpul informasi, analisis teks, dan kesimpulan.",
    contoh: "Contoh dokumen:\nSURAT EDARAN NOMOR 1 TAHUN 2026...\nTentang: peningkatan mutu layanan...",
    hasil: "Hasil Analisis Dokumen:",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
  },
  {
    id: "visual",
    judul: "Analisis Visual Video",
    tag: "KUALITATIF",
    harga: "±4 kredit",
    desc: "Tempel deskripsi atau catatan adegan video → analisis objek, pesan visual, dan temuan per adegan.",
    contoh: "Contoh catatan adegan:\n00:00-00:15 Ruang kelas, dosen menulis di papan\n00:16-00:40 Siswa membalas pesan di ponsel",
    hasil: "Hasil Analisis Visual:",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>,
  },
];

export default function OlahDataPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [dataInput, setDataInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");
  const [needsTopup, setNeedsTopup] = useState(false);
  const [spssFile, setSpssFile] = useState<File | null>(null);

  const isFormValid = dataInput.trim().length > 0 || (selectedTool === "spss" && !!spssFile);

  const handleOlah = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    setNeedsTopup(false);

    if (selectedTool === "spss" && spssFile) {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: sess } = await supabase.auth.getSession();
        let token = sess.session?.access_token || '';
        if (!token) {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i) || '';
            if (k.endsWith('-auth-token')) {
              try { token = JSON.parse(localStorage.getItem(k) || '').access_token || ''; if (token) break; } catch { /* abaikan */ }
            }
          }
        }
        const fd = new FormData();
        fd.append('file', spssFile);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/files/spss`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 402) setNeedsTopup(true);
          throw new Error(json.error || 'Gagal olah SPSS');
        }
        const d = (json.deskriptif || []).map((x: any) => `| ${x.variabel} | ${x.n} | ${x.mean} | ${x.sd} | ${x.min} | ${x.max} |`).join('\n');
        setHasil(`N=${json.n}\n\n| Variabel | n | Mean | SD | Min | Max |\n|---|---|---|---|---|---|\n${d}\n\n${json.interpretasi || ''}`);
      } catch (error: any) {
        setHasil("Error: " + error.message + (/kredit kurang/i.test(error.message || "") ? " Buka Billing untuk top-up." : ""));
      } finally {
        setLoading(false);
      }
      return;
    }

    let prompt = "";
    if (selectedTool === "spss") {
      prompt = `Berperanlah sebagai dosen statistik ahli. Analisis data mentah kuantitatif berikut ini seolah-olah diproses menggunakan SPSS. Lakukan uji asumsi dasar, uji regresi, dan berikan tabel output (dalam format Markdown) beserta interpretasinya. Data: \n\n${dataInput}`;
    } else if (selectedTool === "kualitatif") {
      prompt = `Berperanlah sebagai peneliti kualitatif. Lakukan analisis tematik (coding) pada transkrip wawancara berikut. Kelompokkan menjadi beberapa tema utama dan berikan matriks tema beserta kutipan verbatimnya (format Markdown). Transkrip: \n\n${dataInput}`;
    } else if (selectedTool === "transkripsi") {
      prompt = `Berperanlah sebagai perekam transkrip profesional. Rapikan teks kasar hasil audio/video berikut menjadi transkrip rapi: pembicara (Pembicara 1, Pembicara 2, …) per giliran, hilangkan kata pengulang yang tidak bermakna, rapikan tanda baca, sisipkan [tak terdengar] bila teks tidak jelas, pertahankan penanda waktu bila ada. Format Markdown. Teks kasar:\n\n${dataInput}`;
    } else if (selectedTool === "smartpls") {
      prompt = `Berperanlah sebagai ahli PLS-SEM (SmartPLS). Analisis data/model berikut: (1) outer model — loading, convergent validity (AVE), discriminant validity, composite reliability, Cronbach alpha; (2) inner model — VIF, path coefficient, R², f², Q²; (3) mediasi/moderasi bila ada; (4) bootstrapping 5.000 sub-sampel (signifikan atau tidak). Sajikan tabel Markdown + interpretasi singkat tiap temuan. Data:\n\n${dataInput}`;
    } else if (selectedTool === "dokumen") {
      prompt = `Berperanlah sebagai analis dokumen. Pada dokumen berikut: (1) identifikasi tema utama; (2) simpul-simpul informasi; (3) analisis teks/wacana (sudut pandang & tujuan penulis); (4) kesimpulan dan pemanfaatan untuk penelitian. Format Markdown. Dokumen:\n\n${dataInput}`;
    } else if (selectedTool === "visual") {
      prompt = `Berperanlah sebagai analis media/visual. Dari deskripsi atau catatan adegan video berikut, susun analisis visual: (1) objek & elemen per adegan; (2) komposisi dan pesan visual; (3) temuan relevan untuk penelitian; (4) ringkasan. Format Markdown. Catatan:\n\n${dataInput}`;
    } else {
      prompt = `Lakukan analisis data untuk input berikut: \n\n${dataInput}`;
    }

    try {
      // id TOOLS = key FEATURE_COSTS backend (transkripsi 1, spss 3, smartpls 5,
      // kualitatif 1, dokumen 1, visual 4) → biaya terpotong otomatis
      const feature = selectedTool || "kualitatif";
      const data = await aiGenerate(prompt, feature);
      setHasil(data.result);
    } catch (error: any) {
      setHasil("Error: " + error.message + (/kredit kurang/i.test(error.message || "") ? " Buka Billing untuk top-up." : ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full">
          <div className="ml-auto">
            <CreditBadge />
          </div>
          <button className="text-text-secondary hover:text-text-primary ml-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto">
        
        {!selectedTool ? (
          <>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center shrink-0 text-brand-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Olah Data</h1>
                <p className="text-text-secondary text-sm mt-1">Pilih jenis olah data sesuai penelitianmu — hasilnya bisa langsung jadi data Bab IV.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {TOOLS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTool(t.id)}
                  className="bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-xl p-6 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                    {t.icon}
                  </div>
                  <h3 className="font-bold text-text-primary text-lg mb-1 flex items-center gap-1 group-hover:text-brand-primary transition-colors">
                    {t.judul}{' '}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </h3>
                  <p className={`text-[10px] font-bold tracking-widest mb-4 ${t.tag === 'KUANTITATIF' ? 'text-green-500' : 'text-brand-primary'}`}>{t.tag}</p>
                  <p className="text-sm text-text-secondary mb-4 leading-relaxed">{t.desc}</p>
                  <p className="inline-block text-xs font-bold text-brand-primary bg-brand-primary/10 rounded-full px-3 py-1">{t.harga}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => {setSelectedTool(null); setHasil(""); setDataInput("");}} className="text-text-secondary hover:text-text-primary p-2 bg-bg-surface rounded-lg border border-border-subtle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              <h1 className="text-xl font-bold text-text-primary">
                {TOOLS.find((t) => t.id === selectedTool)?.judul || 'Olah Data'}
              </h1>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
              <label className="block font-bold text-text-primary text-sm mb-4">Tempel Data Mentah / Transkrip / Konten</label>
              <textarea 
                rows={10}
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder={TOOLS.find((t) => t.id === selectedTool)?.contoh}
                className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm mb-4 font-mono whitespace-pre"
              ></textarea>
              {selectedTool === 'spss' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-text-primary mb-2">Atau upload file (xlsx/csv, maks 10 MB, 3 kredit)</label>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setSpssFile(e.target.files?.[0] || null)} className="text-xs text-text-secondary" />
                </div>
              )}
              {needsTopup && (
                <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm text-text-primary flex items-center justify-between gap-3 mb-4">
                  <span>Kredit habis. Top-up untuk lanjut.</span>
                  <Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap">Pilih Paket →</Link>
                </div>
              )}
              <div className="flex justify-end">
                <button 
                  onClick={handleOlah}
                  disabled={!isFormValid || loading}
                  className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary opacity-80 cursor-not-allowed'}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Memproses Data...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      Jalankan Analisis
                    </>
                  )}
                </button>
              </div>
            </div>

            {hasil && (
              <div className="border border-brand-primary/20 bg-bg-surface-hover rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed">
                 <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">{TOOLS.find((t) => t.id === selectedTool)?.hasil || 'Hasil Analisis:'}</h3>
                 {hasil}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
