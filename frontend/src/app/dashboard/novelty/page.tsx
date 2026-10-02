"use client";

import { useState } from "react";

export default function NoveltyPage() {
  const [topik, setTopik] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = topik.trim().length > 0;

  const handleCari = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Analisis novelty (kebaruan) untuk topik penelitian: "${topik}". Jelaskan apa yang sudah banyak diteliti (teori, populasi, metode) dan tunjukkan celah penelitian (research gap) yang bisa dieksplorasi. Format output menggunakan Markdown.`;

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
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Temukan Novelty</h1>
          <p className="text-text-secondary text-sm">
            Tulis topik atau calon judulmu. Sistem membaca ratusan artikel terbit, lalu menunjukkan apa yang <span className="text-text-primary font-bold">sudah</span> diteliti — teori, populasi, metode, dan variabel moderasi yang pernah dicoba. Celahmu ada di yang belum muncul di daftar itu.
          </p>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <label className="block font-bold text-text-primary text-sm mb-4">Topik atau calon judul penelitian</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="mis. pengaruh literasi keuangan terhadap perilaku menabung mahasiswa"
              className="flex-1 bg-bg-base border border-border-strong rounded-lg p-3 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm"
            />
            <button 
              onClick={handleCari}
              disabled={!isFormValid || loading}
              className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-lg ${isFormValid && !loading ? 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Mencari...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Cari celah
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-3">Makin spesifik topiknya, makin tajam petanya. Pencarian pertama pada topik baru ±1 menit; topik yang sudah pernah dipetakan muncul seketika.</p>
        </div>

        {/* Result Area */}
        {hasil && (
          <div className="border border-brand-primary/20 bg-bg-surface-hover rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed mt-6">
             <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Hasil Peta Novelty:</h3>
             {hasil}
          </div>
        )}

      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-primary-hover transition-transform hover:scale-105">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
        </button>
        <button className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform hover:scale-105">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </button>
      </div>

    </div>
  );
}
