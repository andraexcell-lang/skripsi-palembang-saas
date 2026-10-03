"use client";

import { aiGenerate } from "@/lib/api";

import { useState } from "react";

export default function AIWriterPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [materi, setMateri] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = materi.trim().length > 0;

  const handleLanjutkan = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Berperanlah sebagai penulis akademik (AI Writer). Lanjutkan paragraf atau tulisan berikut ini secara logis, berbobot, dan menggunakan bahasa akademik formal. Tambahkan penjelasan, argumen, atau sitasi fiktif (bila relevan). Berikut adalah teks awalan dari pengguna:\n\n${materi}`;

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
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto">
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-text-primary">Penulisan AI</h1>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <span className="text-lg leading-none">+</span> Dokumen Baru
            </button>
          )}
        </div>

        {!isEditing ? (
          /* Empty State Box */
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-16 flex flex-col items-center justify-center text-center">
             <div className="text-text-muted mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             </div>
             <p className="text-text-secondary text-sm max-w-lg mb-8 leading-relaxed">
               Ruang menulis bebas dengan <strong className="text-text-primary">AI Writer</strong>: tulis awal kalimat atau paragraf, klik <strong className="text-text-primary">Lanjutkan dengan AI</strong> — sistem akan meneruskan tulisanmu secara logis dengan gaya bahasa akademik.
             </p>
             <button 
               onClick={() => setIsEditing(true)}
               className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-brand-primary/20 flex items-center gap-2"
             >
               <span className="text-lg leading-none">+</span> Buat Dokumen Pertama
             </button>
          </div>
        ) : (
          /* Editor State */
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-bg-surface p-2 border border-border-subtle rounded-lg">
               <div className="flex gap-2">
                 <button className="p-2 text-text-secondary hover:text-text-primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg></button>
                 <button className="p-2 text-text-secondary hover:text-text-primary font-bold">B</button>
                 <button className="p-2 text-text-secondary hover:text-text-primary italic">I</button>
                 <button className="p-2 text-text-secondary hover:text-text-primary underline">U</button>
               </div>
               <button onClick={() => {setIsEditing(false); setMateri(""); setHasil("");}} className="text-xs font-bold text-accent-red hover:underline px-4">Tutup Editor</button>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 min-h-[400px]">
               <input type="text" placeholder="Judul Dokumen Tanpa Nama" className="w-full text-2xl font-bold bg-transparent border-none outline-none text-text-primary mb-6" />
               <textarea 
                 value={materi}
                 onChange={(e) => setMateri(e.target.value)}
                 placeholder="Mulai mengetik di sini..."
                 className="w-full min-h-[200px] bg-transparent border-none outline-none text-text-primary text-base leading-relaxed resize-none mb-4"
               ></textarea>

               <div className="flex justify-start">
                  <button 
                    onClick={handleLanjutkan}
                    disabled={!isFormValid || loading}
                    className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors shadow-lg ${isFormValid && !loading ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20' : 'bg-purple-600/20 text-purple-400 opacity-80 cursor-not-allowed'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        AI Sedang Menulis...
                      </>
                    ) : (
                      <>
                        ✨ Lanjutkan dengan AI
                      </>
                    )}
                  </button>
               </div>
               
               {/* Hasil Area */}
               {hasil && (
                 <div className="mt-8 border-t border-border-subtle pt-6">
                   <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     ✨ Kelanjutan dari AI:
                   </div>
                   <div className="text-base text-text-primary whitespace-pre-wrap leading-relaxed opacity-90">{hasil}</div>
                   <button 
                     onClick={() => {
                        setMateri(prev => prev + "\n\n" + hasil);
                        setHasil("");
                     }}
                     className="mt-4 border border-border-strong bg-bg-base hover:bg-bg-surface-hover text-text-primary px-4 py-1.5 rounded text-xs font-semibold"
                   >
                     + Terima dan Gabungkan Teks
                   </button>
                 </div>
               )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
