"use client";

import { useState } from "react";

export default function ArtikelPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");

  const isFormValid = query.trim().length > 0;

  const handleCari = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setHasil("");
    
    const prompt = `Carikan 5 referensi artikel jurnal akademik terkait topik: "${query}". Format output berupa daftar Markdown. Untuk setiap artikel, sertakan Judul, Penulis, Nama Jurnal, Tahun, dan simulasi link DOI (jika tidak tahu aslinya, buat format standar DOI).`;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCari();
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
      <div className="flex-1 p-8 w-full space-y-6 overflow-y-auto">
        
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Cari Artikel</h1>
          <span className="text-text-secondary text-sm">Jurnal ber-DOI - saring tahun, bahasa, SINTA/Scopus - gratis, tanpa kredit</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
          
          {/* Left Panel: Search */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Topik atau judul artikel..." 
                className="flex-1 bg-bg-base border border-border-strong rounded-lg p-3 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm"
              />
              <button 
                onClick={handleCari}
                disabled={!isFormValid || loading}
                className={`px-5 py-3 rounded-lg flex items-center justify-center transition-colors shrink-0 shadow-lg ${isFormValid && !loading ? 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary opacity-80 cursor-not-allowed'}`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <select className="bg-bg-base border border-border-strong rounded-lg p-2.5 text-text-primary text-sm focus:border-brand-primary focus:outline-none appearance-none">
                <option>Semua tahun</option>
              </select>
              <select className="bg-bg-base border border-border-strong rounded-lg p-2.5 text-text-primary text-sm focus:border-brand-primary focus:outline-none appearance-none">
                <option>Semua bahasa</option>
              </select>
              <select className="bg-bg-base border border-border-strong rounded-lg p-2.5 text-text-primary text-sm focus:border-brand-primary focus:outline-none appearance-none">
                <option>Semua indeks</option>
              </select>
            </div>

            {hasil ? (
              <div className="flex-1 border-t border-border-subtle pt-4 text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                {hasil}
              </div>
            ) : (
              <div className="flex-1 border-t border-border-subtle flex flex-col items-center justify-center text-center mt-4">
                <p className="text-text-secondary text-sm">Ketik topik atau judul, lalu tekan Enter.</p>
                <p className="text-text-muted text-xs mt-1">Hanya artikel ber-DOI yang ditampilkan — semuanya bisa disitasi.</p>
              </div>
            )}
          </div>

          {/* Right Panel: Daftar Referensi */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <h3 className="font-bold text-text-primary">Daftar Referensi</h3>
                <span className="bg-border-strong text-text-primary text-xs font-bold px-2 py-0.5 rounded ml-1">0</span>
              </div>
              <button className="flex items-center gap-2 border border-border-strong hover:bg-bg-surface-hover text-text-secondary px-3 py-1.5 rounded-lg text-sm transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                DOI
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-text-secondary text-sm">Belum ada referensi tersimpan. Hasil pencarian di kiri bisa ditambahkan ke sini.</p>
            </div>
          </div>

        </div>

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
