"use client";

import { aiGenerate } from "@/lib/api";

import { useState } from "react";

export default function LabRevisiPage() {
  const [tab, setTab] = useState("luar");
  const [materi, setMateri] = useState("");
  const [instruksi, setInstruksi] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = materi.trim().length > 0 && instruksi.trim().length > 0;

  const handleRevisi = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Berperanlah sebagai editor akademik profesional. Saya memiliki draf tulisan berikut:\n\n${materi}\n\nTolong revisi tulisan tersebut berdasarkan instruksi berikut: "${instruksi}".\n\nBerikan hasil revisinya dalam format Markdown yang rapi.`;

    try {
      const data = await aiGenerate(prompt, "bab");
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
          <h1 className="text-2xl font-bold text-text-primary mb-2">Lab Revisi</h1>
          <p className="text-text-secondary text-sm">
            Pilih proyek & sub-bab, lalu tulis instruksi revisi. AI akan merevisi otomatis dan file Word-mu langsung ter-update. Skripsi, tesis, disertasi, hingga artikel bisa direvisi di sini.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-bg-surface border border-border-subtle rounded-lg w-max mb-6">
           <button 
             onClick={() => setTab("web")}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-l-lg text-sm font-bold border border-transparent ${tab === 'web' ? 'bg-bg-surface-hover text-text-primary border-r-border-subtle' : 'bg-transparent text-text-secondary hover:bg-bg-surface-hover'}`}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
             Proyek Web
           </button>
           <button 
             onClick={() => setTab("luar")}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-r-lg text-sm font-medium border border-transparent ${tab === 'luar' ? 'bg-bg-surface-hover text-text-primary font-bold border-l-border-subtle' : 'bg-transparent text-text-secondary hover:bg-bg-surface-hover'}`}
           >
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
             File dari Luar
           </button>
        </div>

        {tab === "web" ? (
          /* Empty State Box for Web */
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-16 flex flex-col items-center justify-center text-center">
             <div className="text-text-muted mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><line x1="5.52" y1="16" x2="18.48" y2="16"></line></svg>
             </div>
             <p className="text-text-secondary text-sm max-w-lg mb-8">
               Belum ada proyek yang bisa direvisi. Buat & generate proyekmu dulu di Studio, atau pakai tab "File dari Luar".
             </p>
             <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-brand-primary/20">
               Ke Studio
             </button>
          </div>
        ) : (
          /* Active State for File Luar */
          <div className="space-y-6">
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
              <label className="block font-bold text-text-primary text-sm mb-2">Teks yang Ingin Direvisi</label>
              <textarea 
                rows={5}
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Paste paragraf atau bab yang ingin Anda perbaiki di sini..."
                className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm mb-4"
              ></textarea>

              <label className="block font-bold text-text-primary text-sm mb-2">Instruksi Revisi (Dari Dosen/Anda)</label>
              <input 
                type="text"
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value)}
                placeholder="Contoh: Tolong buat bahasanya lebih akademis dan tambahkan sitasi jurnal 5 tahun terakhir."
                className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none mb-4"
              />

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleRevisi}
                  disabled={!isFormValid || loading}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed'}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Merevisi...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Revisi Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hasil Area */}
            {hasil && (
              <div className="bg-bg-surface-hover border border-brand-primary/20 rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed mt-6">
                <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Hasil Revisi AI:</h3>
                {hasil}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
