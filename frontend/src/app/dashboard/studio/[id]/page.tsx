"use client";

import { useState } from "react";
import Link from "next/link";

export default function StudioWorkspace({ params }: { params: { id: string } }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      // Dalam produksi, ini akan melakukan fetch POST ke Express Backend (http://localhost:3001/api/generate)
      // dan kemudian melakukan polling / WebSockets.
      
      // Simulasi delay antrean BullMQ + proses Gemini API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulasi Response sukses
      setResult(`
        <h3>Kisi-kisi Instrumen Penelitian</h3>
        <p><strong>Variabel (X):</strong> Motivasi Kerja</p>
        <p><strong>Indikator:</strong> Kebutuhan Fisik, Kebutuhan Keamanan, Kebutuhan Sosial</p>
        <hr />
        <ul>
          <li>Saya merasa gaji yang diberikan perusahaan sudah sesuai. (Sangat Setuju - Sangat Tidak Setuju)</li>
          <li>Lingkungan kerja saya terasa aman dan nyaman.</li>
        </ul>
      `);
    } catch (error) {
      console.error(error);
      alert("Gagal menghubungi server");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full bg-surface">
      {/* Chapter Sidebar */}
      <div className="w-56 bg-surface-alt border-r border-border p-4 flex flex-col gap-1 overflow-y-auto hidden lg:flex">
        <Link href="/dashboard" className="text-sm font-semibold text-text-secondary hover:text-text-primary mb-6 flex items-center gap-2">
          &larr; Kembali
        </Link>
        
        <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 mt-4 px-2">Dokumen</div>
        <button className="text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-border/50 transition-colors">Bab I: Pendahuluan</button>
        <button className="text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-border/50 transition-colors">Bab II: Tinjauan Pustaka</button>
        <button className="text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-border/50 transition-colors">Bab III: Metodologi</button>
        <button className="text-left px-3 py-2 rounded-lg text-sm font-semibold bg-white text-brand-primary shadow-sm border border-border">Lampiran</button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto p-8 lg:p-12">
        <div className="w-full max-w-3xl space-y-8">
          
          <div className="text-center space-y-2 mb-12">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Lampiran Penelitian</h1>
            <p className="text-text-secondary">Pengaruh Motivasi Kerja Terhadap Kinerja Pegawai</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center">
            <h3 className="text-base font-semibold text-text-primary mb-2">Buat Kisi-Kisi & Kuesioner Otomatis</h3>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              AI akan menganalisis judul dan variabel Anda untuk menyusun draf tabel kisi-kisi instrumen (skala Likert) secara otomatis.
            </p>
            
            {!result && (
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 hover:bg-brand-primary/20 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memproses Antrean AI...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    Generate Lampiran via AI
                  </>
                )}
              </button>
            )}
          </div>

          {result && (
            <div className="bg-white border border-success/30 rounded-xl p-8 shadow-md">
              <div className="flex items-center gap-2 mb-6 text-success font-semibold border-b border-border pb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Generasi Berhasil
              </div>
              <div className="prose prose-sm max-w-none text-text-primary" dangerouslySetInnerHTML={{ __html: result }} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
