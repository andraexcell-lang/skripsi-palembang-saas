"use client";

import { aiGenerate, isInsufficientCredits } from "@/lib/api";

import { useState } from "react";
import Link from "next/link";

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
    } else {
      prompt = `Lakukan analisis data untuk input berikut: \n\n${dataInput}`;
    }

    try {
      const feature = selectedTool === "spss" ? "spss" : "kualitatif";
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
          <div className="ml-auto text-xs font-semibold text-accent-red border border-accent-red/20 bg-accent-red/10 px-3 py-1 rounded-full flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            0 kredit
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
              
              {/* Card 1 */}
              <div onClick={() => setSelectedTool("kualitatif")} className="bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-xl p-6 transition-colors cursor-pointer group">
                 <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                 </div>
                 <h3 className="font-bold text-text-primary text-lg mb-1 flex items-center gap-1 group-hover:text-brand-primary transition-colors">
                   Analisis Kualitatif <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity"><polyline points="9 18 15 12 9 6"></polyline></svg>
                 </h3>
                 <p className="text-[10px] font-bold text-brand-primary tracking-widest mb-4">KUALITATIF</p>
                 <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                   Paste transkrip wawancara → dapatkan tema, matriks, dan kutipan verbatim terstruktur otomatis.
                 </p>
              </div>

              {/* Card 2 */}
              <div onClick={() => setSelectedTool("spss")} className="bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-xl p-6 transition-colors cursor-pointer group">
                 <div className="w-10 h-10 rounded-lg bg-text-muted/10 text-text-muted flex items-center justify-center mb-4">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                 </div>
                 <h3 className="font-bold text-text-primary text-lg mb-1 flex items-center gap-1 group-hover:text-brand-primary transition-colors">
                   Olah Data SPSS <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity"><polyline points="9 18 15 12 9 6"></polyline></svg>
                 </h3>
                 <p className="text-[10px] font-bold text-green-500 tracking-widest mb-4">KUANTITATIF</p>
                 <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                   Paste data mentah CSV/Tabel → uji statistik otomatis (validitas, regresi) dengan tabel gaya SPSS + interpretasi.
                 </p>
              </div>

            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => {setSelectedTool(null); setHasil(""); setDataInput("");}} className="text-text-secondary hover:text-text-primary p-2 bg-bg-surface rounded-lg border border-border-subtle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              <h1 className="text-xl font-bold text-text-primary">
                {selectedTool === 'spss' ? 'Olah Data SPSS (Kuantitatif)' : 'Analisis Kualitatif'}
              </h1>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
              <label className="block font-bold text-text-primary text-sm mb-4">Paste Data Mentah / Transkrip</label>
              <textarea 
                rows={10}
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder={selectedTool === 'spss' ? "Contoh data CSV: \nResponden, X1, X2, Y\n1, 4, 5, 4\n2, 3, 4, 3" : "Contoh wawancara: \nPewawancara: Bagaimana strategi pemasaran Anda?\nNarasumber: Kami fokus ke media sosial..."}
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
                 <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Output Bab IV:</h3>
                 {hasil}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
