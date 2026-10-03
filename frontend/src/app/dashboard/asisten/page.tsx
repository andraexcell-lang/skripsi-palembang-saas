import Link from "next/link";

export default function AsistenPage() {
  const prompts = [
    { label: "/judul", desc: "Buatkan 10 judul dari tema & metode" },
    { label: "/skripsi", desc: "Mulai skripsi dari judul yang sudah ka..." },
    { label: "/tesis", desc: "Mulai tesis dari judul yang sudah kamu..." },
    { label: "/disertasi", desc: "Mulai disertasi dari judul yang sudah..." },
    { label: "/sinta", desc: "Mulai artikel jurnal Sinta dari judulmu" },
    { label: "/scopus", desc: "Mulai artikel jurnal Scopus (Bahasa In..." },
    { label: "/parafrase", desc: "Parafrase teks langsung di chat (1..." },
    { label: "/ppt", desc: "Unggah skripsi/proposal → jadi PPT, diun..." },
    { label: "/cari artikel", desc: "Cari artikel jurnal: tahun, indeks, a..." },
    { label: "/kelayakan judul", desc: "Nilai kelayakan judulmu: skor,..." }
  ];

  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-subtle bg-bg-base">
        <div className="flex items-center gap-3 text-brand-primary font-bold">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
           AI Skripsi Palembang
        </div>
        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-text-primary text-sm font-medium flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Riwayat
          </button>
          <button className="text-text-secondary hover:text-text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
              I
            </div>
            <span className="text-sm font-medium text-text-primary hidden sm:block">Indah Permata ...</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
        
        <div className="text-brand-primary mb-6">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">Apa yang ingin kamu kerjakan?</h1>
        <p className="text-text-secondary mb-12">Saya bisa menyusun judul, lalu memandu sampai proyeknya siap ditulis.</p>

        <div className="w-full relative mb-8">
          <input 
            type="text" 
            placeholder="Tulis pesan, atau ketik / untuk perintah" 
            className="w-full bg-bg-surface border border-border-subtle rounded-2xl py-5 px-6 pr-16 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-lg"
          />
          <button className="absolute inset-y-0 right-4 my-auto w-10 h-10 bg-bg-surface-hover border border-border-subtle text-text-primary rounded-full flex items-center justify-center hover:bg-border-strong transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          </button>
        </div>

        <div className="text-xs text-text-muted mb-8 text-center">
          Enter untuk kirim · Shift+Enter baris baru · / untuk perintah
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {prompts.map((p, idx) => (
            <button key={idx} className="flex items-center border border-border-subtle bg-bg-surface hover:border-brand-primary hover:bg-bg-surface-hover rounded-xl px-4 py-3 transition-colors text-left group">
              <span className="text-brand-primary font-bold text-sm mr-2 whitespace-nowrap">{p.label}</span>
              <span className="text-text-secondary text-sm truncate group-hover:text-text-primary transition-colors">{p.desc}</span>
            </button>
          ))}
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
