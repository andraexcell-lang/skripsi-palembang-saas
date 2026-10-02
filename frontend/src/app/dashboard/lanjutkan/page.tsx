"use client";

import { useState } from "react";

export default function LanjutkanSkripsiPage() {
  const [judul, setJudul] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = judul.trim().length > 0;

  const handleBuatProyek = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Berperanlah sebagai asisten pembimbing skripsi. Berdasarkan judul penelitian: "${judul}", buatkan rancangan (outline) komprehensif dari Bab 1 hingga Bab 5 yang bisa dijadikan acuan untuk melanjutkan penulisan skripsi. Susun dalam format Markdown yang rapi dan terstruktur.`;

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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg-surface-hover text-text-secondary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <div>
            <h1 className="font-bold text-text-primary leading-tight text-sm">Lanjutkan Skripsi</h1>
            <p className="text-xs text-text-muted">Untuk skripsi yang sudah berjalan di luar sistem ini. Unggah filenya, lalu lanjutkan bab yang belum selesai.</p>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <div className="p-6 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto pb-48">
        
        {/* Info Box */}
        <div className="bg-bg-base border border-brand-primary/30 rounded-xl p-4 flex gap-3 text-sm text-text-secondary">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
           <div className="space-y-2 text-xs">
             <p>Sistem menilai tiap bab: yang <strong className="text-text-primary">sudah selesai</strong> dipakai apa adanya dan langsung tercentang, yang <strong className="text-text-primary">belum</strong> kamu susun sendiri lalu ditulis di sini. Bisa sampai Bab VII bila kampusmu memakainya.</p>
             <p>Bab yang ditulis di sini <strong className="text-text-primary">mengikuti tulisanmu</strong> — populasi, sampel, variabel, dan uji statistik diambil persis dari metodologi milikmu, bukan ditetapkan ulang oleh AI.</p>
           </div>
        </div>

        {/* Judul penelitian */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
          <label className="font-bold text-text-primary text-sm block mb-2">Judul penelitian (Untuk Simulasi Demo)</label>
          <input 
            type="text" 
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Ketik judul skripsi/tesis/disertasi" 
            className="w-full bg-bg-base border border-border-strong rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Jenis dan metode penelitian (UI Only - Static) */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 opacity-70">
          <h3 className="font-bold text-text-primary text-sm mb-4">Jenis dan metode penelitian</h3>
          
          <label className="font-bold text-text-primary text-xs block mb-2">Jenis penelitian</label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border border-brand-primary bg-brand-primary/10 rounded-lg p-3 flex items-center gap-3 cursor-pointer">
              <div className="w-4 h-4 rounded-full border-4 border-brand-primary"></div>
              <span className="text-sm font-semibold text-brand-primary">Skripsi (S1)</span>
            </div>
            <div className="border border-border-strong bg-bg-base rounded-lg p-3 flex items-center gap-3 cursor-not-allowed">
              <div className="w-4 h-4 rounded-full border border-text-muted"></div>
              <span className="text-sm text-text-secondary">Tesis (S2)</span>
            </div>
          </div>

          <label className="font-bold text-text-primary text-xs block mb-2">Metode penelitian</label>
          <div className="grid grid-cols-2 gap-3">
             <div className="border border-brand-primary bg-brand-primary/10 rounded-lg p-3 flex items-center gap-3 cursor-pointer">
               <div className="w-4 h-4 rounded-full border-4 border-brand-primary"></div>
               <span className="text-sm font-semibold text-brand-primary">Kuantitatif</span>
             </div>
             <div className="border border-border-strong bg-bg-base rounded-lg p-3 flex items-center gap-3 cursor-pointer">
               <div className="w-4 h-4 rounded-full border border-text-muted"></div>
               <span className="text-sm text-text-secondary">Kualitatif</span>
             </div>
          </div>
        </div>

        {/* Result Area */}
        {hasil && (
          <div className="border border-brand-primary/20 bg-bg-surface-hover rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed mt-6">
             <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Draft Outline Skripsi:</h3>
             {hasil}
          </div>
        )}

      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-bg-surface border-t border-border-subtle z-50">
        <div className="bg-yellow-500/20 px-4 py-2 text-center text-yellow-500 text-[10px] font-semibold">
           Unggah dan baca skripsi-mu dulu, dengar <strong className="text-yellow-400">Bab 1 yang sudah selesai</strong>. Tanpa itu hak ada rumusan masalah yang bisa diikuti bab-bab berikutnya.
        </div>
        <div className="p-4">
           <button 
             onClick={handleBuatProyek}
             disabled={!isFormValid || loading}
             className={`w-full max-w-4xl mx-auto block py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 border border-brand-primary/50 text-brand-primary cursor-not-allowed'}`}
           >
             {loading ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Menyusun Struktur Proyek...
               </>
             ) : (
               <>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg> 
                 Buat Proyek & Dapatkan Outline
               </>
             )}
           </button>
        </div>
      </div>

    </div>
  );
}
