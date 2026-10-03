"use client";

import { aiGenerate } from "@/lib/api";

import { useState } from "react";

export default function BrainstormingPage() {
  const [topik, setTopik] = useState("");
  const [bidangIlmu, setBidangIlmu] = useState("manajemen");
  const [lokasi, setLokasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = topik.trim().length > 0;

  const handleGenerate = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Berikan saya 10 ide judul skripsi untuk bidang ilmu: ${bidangIlmu}. Topik utama: ${topik}. ${lokasi ? `Lokasi penelitian: ${lokasi}.` : ""} Fokuskan pada metode kualitatif dan kuantitatif. Format output berupa daftar Markdown.`;

    try {
      const data = await aiGenerate(prompt, "brainstorming");
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
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg-surface-hover text-text-secondary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
          </div>
          <div>
            <h1 className="font-bold text-text-primary leading-tight text-sm">Brainstorming Judul</h1>
            <p className="text-xs text-text-muted">Temukan 10 ide judul penelitian sesuai topik dan kebutuhanmu.</p>
          </div>
        </div>
        <div className="ml-auto text-xs font-semibold text-accent-red border border-accent-red/20 bg-accent-red/10 px-3 py-1 rounded-full flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
          0 kredit
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto pb-32">
        
        {/* Step 1: Topik Penelitian */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
          <div className="bg-bg-surface-hover border-b border-border-subtle p-3 flex flex-col items-center justify-center">
             <div className="w-6 h-6 rounded bg-brand-primary/20 text-brand-primary text-xs font-bold flex items-center justify-center mb-1">1</div>
             <h2 className="font-bold text-text-primary text-sm">Topik penelitian</h2>
             <p className="text-[10px] text-text-muted">Mulai dari topik yang ingin kamu teliti.</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block font-bold text-text-primary text-sm mb-2">Topik umum</label>
              <textarea 
                rows={3}
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="Contoh: Pengaruh media sosial terhadap prestasi belajar siswa SMA"
                className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none resize-none"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-text-primary text-sm mb-2">Bidang ilmu</label>
                <input type="text" value={bidangIlmu} onChange={(e) => setBidangIlmu(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-text-primary text-sm mb-2">Lokasi penelitian <span className="text-text-muted font-normal">Opsional</span></label>
                <input type="text" value={lokasi} onChange={(e) => setLokasi(e.target.value)} placeholder="Contoh: SMA Negeri 1 Bandung" className="w-full bg-bg-base border border-border-strong rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Jenis dan Metode */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden opacity-70">
          <div className="bg-bg-surface-hover border-b border-border-subtle p-3 flex flex-col items-center justify-center">
             <div className="w-6 h-6 rounded bg-brand-primary/20 text-brand-primary text-xs font-bold flex items-center justify-center mb-1">2</div>
             <h2 className="font-bold text-text-primary text-sm">Jenis dan metode</h2>
             <p className="text-[10px] text-text-muted">Untuk demo ini, pengaturan metode dijadikan default.</p>
          </div>
          {/* ... (disederhanakan untuk demo API) ... */}
          <div className="p-5 text-center text-sm text-text-muted">
            Opsi ini akan diaktifkan secara dinamis di versi final. Saat ini AI akan menggunakan prompt default kualitatif & kuantitatif.
          </div>
        </div>

        {/* Action Area */}
        <div className="flex items-center justify-between p-4 bg-bg-base border border-border-subtle rounded-xl">
           <div className="flex items-center gap-2 text-[11px]">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
             <span className="text-text-secondary">Lengkapi topik untuk mulai membuat judul.</span>
             <span className="text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded ml-2">Mode Testing Lokal</span>
           </div>
           <button 
              onClick={handleGenerate}
              disabled={!isFormValid || loading}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 cursor-pointer' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed'}`}
           >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Memproses AI...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                  Buat 10 Judul →
                </>
              )}
           </button>
        </div>

        {/* Result Area */}
        {hasil ? (
          <div className="border border-brand-primary/20 bg-bg-surface-hover rounded-xl p-6 text-sm text-text-primary mt-8 shadow-sm whitespace-pre-wrap leading-relaxed">
             <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Hasil Generate:</h3>
             {hasil}
          </div>
        ) : (
          <div className="border border-border-subtle rounded-xl p-16 flex flex-col items-center justify-center text-center mt-8 bg-bg-surface">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted mb-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             <p className="text-text-secondary text-sm">Hasil judul akan muncul di sini setelah kamu generate.</p>
          </div>
        )}

      </div>

    </div>
  );
}
