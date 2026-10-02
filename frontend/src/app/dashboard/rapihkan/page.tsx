"use client";

import { useState } from "react";

export default function RapihkanSkripsiPage() {
  const [materi, setMateri] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = materi.trim().length > 0;

  const handleRapihkan = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Rapihkan teks atau draf skripsi berikut secara formatting (struktur heading, paragraf, penomoran, dsb). Jangan merubah substansi isinya sama sekali, hanya buat strukturnya menjadi sangat rapi dan standar akademik. Format output dengan Markdown:\n\n${materi}`;

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
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary inline-block mr-2">Rapihkan Skripsi (Teks Mode)</h1>
          <p className="text-text-secondary text-sm mt-1">Paste draf tulisan yang berantakan penomorannya. AI akan merapihkan strukturnya tanpa mengubah substansi.</p>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
           <textarea 
             rows={8}
             value={materi}
             onChange={(e) => setMateri(e.target.value)}
             placeholder="Paste draf teks skripsi di sini..."
             className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm mb-4"
           ></textarea>

           <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">AI akan mendeteksi dan merapihkan struktur heading/penomoran.</span>
              <button 
                onClick={handleRapihkan}
                disabled={!isFormValid || loading}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Merapihkan...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Rapihkan Sekarang
                  </>
                )}
              </button>
           </div>
        </div>

        {/* Hasil Area */}
        {hasil && (
          <div className="bg-bg-surface-hover border border-brand-primary/20 rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed mt-6">
            <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Teks yang Sudah Dirapihkan:</h3>
            {hasil}
          </div>
        )}

      </div>

    </div>
  );
}
