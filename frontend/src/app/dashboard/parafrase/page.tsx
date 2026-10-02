"use client";

import { useState } from "react";

export default function ParafrasePage() {
  const [materi, setMateri] = useState("");
  const [bahasa, setBahasa] = useState("id");
  const [gaya, setGaya] = useState("formal");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = materi.trim().length > 0;

  const handleParafrase = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Lakukan parafrase akademik pada teks berikut. 
Bahasa yang digunakan: ${bahasa === 'id' ? 'Indonesia' : 'Inggris'}. 
Gaya bahasa: ${gaya === 'formal' ? 'Akademik Formal' : 'Semi-formal'}.
Pastikan parafrase menurunkan tingkat plagiasi tanpa menghilangkan substansi makna, sitasi, atau daftar pustaka (jika ada).
Teks Asli:\n\n${materi}`;

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
            <div className="text-text-secondary hover:text-text-primary mr-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
              I
            </div>
            <span className="text-sm font-medium text-text-primary hidden sm:block">Indah Permata ...</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto pb-32">
        
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center shrink-0 text-brand-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Parafrase Akademik</h1>
            <p className="text-text-secondary text-sm mt-1">Parafrase proyekmu per bab atau sub-bab, tanpa mengubah substansi. Tempel teks di kolom sebelah kiri.</p>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
           <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl p-5">
              <label className="font-bold text-text-primary text-sm mb-3 block">Bahasa teks</label>
              <div className="grid grid-cols-2 gap-3">
                 <div onClick={() => setBahasa('id')} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${bahasa === 'id' ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                    <div className={`w-4 h-4 rounded-full shrink-0 ${bahasa === 'id' ? 'border-4 border-brand-primary' : 'border border-text-muted'}`}></div>
                    <span className={`text-sm ${bahasa === 'id' ? 'font-semibold text-brand-primary' : 'text-text-secondary'}`}>Indonesia</span>
                 </div>
                 <div onClick={() => setBahasa('en')} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${bahasa === 'en' ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                    <div className={`w-4 h-4 rounded-full shrink-0 ${bahasa === 'en' ? 'border-4 border-brand-primary' : 'border border-text-muted'}`}></div>
                    <span className={`text-sm ${bahasa === 'en' ? 'font-semibold text-brand-primary' : 'text-text-secondary'}`}>English</span>
                 </div>
              </div>
           </div>
           <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl p-5">
              <label className="font-bold text-text-primary text-sm mb-3 block">Gaya bahasa</label>
              <div className="grid grid-cols-2 gap-3">
                 <div onClick={() => setGaya('formal')} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${gaya === 'formal' ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                    <div className={`w-4 h-4 rounded-full shrink-0 ${gaya === 'formal' ? 'border-4 border-brand-primary' : 'border border-text-muted'}`}></div>
                    <span className={`text-sm ${gaya === 'formal' ? 'font-semibold text-brand-primary' : 'text-text-secondary'}`}>Formal</span>
                 </div>
                 <div onClick={() => setGaya('semi')} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${gaya === 'semi' ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                    <div className={`w-4 h-4 rounded-full shrink-0 ${gaya === 'semi' ? 'border-4 border-brand-primary' : 'border border-text-muted'}`}></div>
                    <span className={`text-sm ${gaya === 'semi' ? 'font-semibold text-brand-primary' : 'text-text-secondary'}`}>Semi-formal</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Editor Area */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[400px]">
           <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl p-5 flex flex-col">
              <label className="font-bold text-text-primary text-sm mb-3 block">Teks asli</label>
              <textarea 
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Tempel teks (maks 10.000 karakter)..." 
                className="flex-1 min-h-[250px] bg-bg-base border border-border-strong rounded-t-lg p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none resize-none"
              ></textarea>
              <div className="bg-bg-base border-x border-b border-border-strong px-4 py-2 text-right text-xs text-text-muted border-t-0 rounded-b-lg mb-4">
                 {materi.length}/10.000
              </div>
              <button 
                onClick={handleParafrase}
                disabled={!isFormValid || loading}
                className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed'}`}
              >
                 {loading ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Memproses...
                   </>
                 ) : (
                   <>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                     Parafrase
                   </>
                 )}
              </button>
           </div>
           
           <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl p-5 flex flex-col">
              <label className="font-bold text-text-primary text-sm mb-3 block">Hasil</label>
              <div className={`flex-1 bg-bg-base border border-border-strong rounded-lg p-4 ${hasil ? 'overflow-y-auto' : 'flex items-center justify-center text-center'}`}>
                 {hasil ? (
                   <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{hasil}</div>
                 ) : (
                   <p className="text-text-secondary text-sm">Hasil parafrase akan muncul di sini.</p>
                 )}
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}
