"use client";

import { useState } from "react";

export default function GeneratePPTPage() {
  const [jenisPresentasi, setJenisPresentasi] = useState("sempro");
  const [materi, setMateri] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = materi.trim().length > 0;

  const handleGenerate = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Buatkan outline presentasi PowerPoint (${jenisPresentasi === 'sempro' ? 'Seminar Proposal' : 'Seminar Hasil'}) berdasarkan teks materi berikut. Buat dalam format Markdown. Berikan judul setiap slide dan poin-poin isinya (bullet points) secara ringkas, jelas, dan profesional. Teks Materi:\n\n${materi}`;

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
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto pb-32">
        
        <div className="flex items-start gap-4 mb-2">
          <div className="w-10 h-10 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center shrink-0 text-brand-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Generate PPT</h1>
            <p className="text-text-secondary text-sm mt-0.5">Buat slide presentasi dari dokumen atau skripsi yang sudah kamu kerjakan di Studio.</p>
          </div>
        </div>

        {/* Jenis presentasi */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <label className="block font-bold text-text-primary text-sm mb-4">Jenis presentasi</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label onClick={() => setJenisPresentasi("sempro")} className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${jenisPresentasi === 'sempro' ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
              <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${jenisPresentasi === 'sempro' ? 'border-4 border-brand-primary' : 'border border-text-muted'}`}></div>
              <div>
                <div className={`font-bold text-sm mb-1 ${jenisPresentasi === 'sempro' ? 'text-brand-primary' : 'text-text-primary'}`}>Seminar Proposal <span className="text-xs font-normal">10–15 slide</span></div>
                <div className="text-[11px] text-text-secondary">Fokus pada latar belakang, gap, teori, dan metode.</div>
              </div>
            </label>
            <label onClick={() => setJenisPresentasi("semhas")} className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${jenisPresentasi === 'semhas' ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
              <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 ${jenisPresentasi === 'semhas' ? 'border-4 border-brand-primary' : 'border border-text-muted'}`}></div>
              <div>
                <div className={`font-bold text-sm mb-1 ${jenisPresentasi === 'semhas' ? 'text-brand-primary' : 'text-text-primary'}`}>Seminar Hasil <span className="text-xs font-normal">12–18 slide</span></div>
                <div className="text-[11px] text-text-secondary">Fokus pada hasil, pembahasan, kesimpulan, dan saran.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Tema warna (Static for demo) */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 opacity-70">
          <label className="block font-bold text-text-primary text-sm mb-1">Tema warna (Demo Mode)</label>
          <p className="text-xs text-text-muted mb-4">Pilih tampilan warna untuk presentasimu.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'sempro', name: 'Sempro Pro', color1: '#1E3A8A', color2: '#1D4ED8', active: true },
              { id: 'navy', name: 'Navy Emas', color1: '#1E3A8A', color2: '#F59E0B', active: false },
            ].map((theme) => (
              <label key={theme.id} className={`flex items-center gap-3 border rounded-lg p-3 cursor-not-allowed transition-colors ${theme.active ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base'}`}>
                {theme.active ? (
                  <div className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-text-muted shrink-0"></div>
                )}
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full overflow-hidden flex shadow-sm">
                      <div className="w-1/2 h-full" style={{backgroundColor: theme.color1}}></div>
                      <div className="w-1/2 h-full" style={{backgroundColor: theme.color2}}></div>
                   </div>
                   <span className={`text-sm font-semibold ${theme.active ? 'text-brand-primary' : 'text-text-primary'}`}>{theme.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Sumber materi */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <label className="block font-bold text-text-primary text-sm mb-1">Sumber materi</label>
          <p className="text-xs text-text-muted mb-4">Paste ringkasan/bab skripsi Anda di sini (Simulasi Upload).</p>
          
          <textarea 
             rows={6}
             value={materi}
             onChange={(e) => setMateri(e.target.value)}
             placeholder="Contoh: Penelitian ini membahas pengaruh algoritma rekomendasi pada kepuasan pengguna e-commerce. Latar belakang masalahnya adalah tingginya tingkat churn pelanggan..."
             className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm mb-4"
          ></textarea>

          <div className="flex items-start gap-2 text-[11px] text-text-secondary bg-bg-base border border-border-strong rounded-lg p-3">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
             <span>AI merangkum isi materi menjadi slide sesuai jenis presentasi yang dipilih.</span>
          </div>
        </div>

        {/* Riwayat / Hasil */}
        {hasil && (
          <div className="border border-brand-primary/20 bg-bg-surface-hover rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed mt-6">
             <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Draft Slide Presentasi:</h3>
             {hasil}
          </div>
        )}

      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-bg-surface border-t border-border-subtle z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-bg-base border border-border-strong text-text-secondary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             </div>
             <div>
                <div className="font-bold text-sm text-text-primary">Hasil: Draft Teks PPT (Markdown)</div>
                <div className="text-[11px] text-text-muted">Jumlah slide mengikuti jenis presentasi.</div>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-text-muted">Biaya</div>
              <div className="text-sm font-bold text-brand-primary">Mode Testing Lokal</div>
            </div>
            <div className="flex flex-col items-end">
               <button 
                 onClick={handleGenerate}
                 disabled={!isFormValid || loading}
                 className={`px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors mb-1 shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary opacity-80 cursor-not-allowed'}`}
               >
                 {loading ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Memproses...
                   </>
                 ) : (
                   <>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                     Generate PPT
                   </>
                 )}
               </button>
               <span className="text-[9px] text-text-muted">{!isFormValid ? 'Paste materi untuk melanjutkan' : 'Siap digenerate!'}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
