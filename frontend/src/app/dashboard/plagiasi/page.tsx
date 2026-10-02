"use client";

import { useState } from "react";

export default function CekPlagiasiPage() {
  const [materi, setMateri] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = materi.trim().length > 0;

  const handleCek = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Lakukan simulasi pengecekan plagiasi (Turnitin/Mulfu style) pada teks berikut. Berikan output persentase plagiasi fiktif (misalnya 15%), rincian sumber yang mungkin mirip, dan kalimat mana saja yang terdeteksi mirip. Teks:\n\n${materi}\n\nFormat jawaban dalam Markdown yang terstruktur.`;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setHasil(data.result);
      } else {
        setHasil("Error: " + (data.error || "Gagal menghubungi server AI."));
      }
    } catch (error: any) {
      setHasil("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      
      {/* Top Header */}
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2 cursor-pointer ml-auto">
             <div className="text-xs font-semibold text-accent-red border border-accent-red/20 bg-accent-red/10 px-3 py-1 rounded-full flex items-center gap-1 mr-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                0 kredit
             </div>
             <button className="text-text-secondary hover:text-text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
        
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-brand-primary flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">MantraRiset <span className="text-text-muted font-normal text-sm">×</span> <span className="bg-purple-900/40 text-purple-400 px-2.5 py-0.5 rounded-md text-sm">Mulfu</span></h1>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Cek Plagiasi (Demo AI)</h2>
          <p className="text-text-secondary text-sm">Paste teks dokumen untuk memeriksa tingkat kemiripan (plagiarisme). (Simulasi dari mesin <strong className="text-purple-400">Mulfu</strong> menggunakan Gemini).</p>
        </div>

        {/* Warning Box */}
        <div className="bg-bg-surface border border-brand-primary rounded-xl p-4 flex items-start gap-3">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
           <p className="text-sm text-text-secondary">
             Dalam mode demo, fitur ini akan disimulasikan secara instan oleh AI tanpa memotong kredit Anda.
           </p>
        </div>

        {/* Unggah Dokumen Box */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 relative overflow-hidden">
           
           <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="font-bold text-text-primary text-base">Teks Dokumen</h3>
           </div>

           <div className="flex items-center gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                 <input type="checkbox" className="w-4 h-4 rounded border-border-strong bg-bg-base text-brand-primary focus:ring-brand-primary cursor-pointer" />
                 <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Kecualikan Daftar Pustaka</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                 <input type="checkbox" className="w-4 h-4 rounded border-border-strong bg-bg-base text-brand-primary focus:ring-brand-primary cursor-pointer" />
                 <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Kecualikan Kutipan</span>
              </label>
           </div>

           <textarea 
             rows={6}
             value={materi}
             onChange={(e) => setMateri(e.target.value)}
             placeholder="Paste bab skripsi atau paragraf di sini untuk dicek..."
             className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm mb-6"
           ></textarea>

           <div className="flex items-center justify-between border-t border-border-subtle pt-6">
              <div className="text-sm text-text-secondary">
                 Proses Instan · <strong className="text-text-primary">Mode Testing Lokal</strong>
              </div>
              <button 
                onClick={handleCek}
                disabled={!isFormValid || loading}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed'}`}
              >
                 {loading ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Menganalisis...
                   </>
                 ) : (
                   <>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                     Cek Sekarang
                   </>
                 )}
              </button>
           </div>
        </div>

        {/* Hasil Area */}
        {hasil && (
          <div className="bg-bg-surface-hover border border-brand-primary/20 rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed">
             <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Laporan Hasil Plagiasi (Simulasi):</h3>
             {hasil}
          </div>
        )}

      </div>

    </div>
  );
}
