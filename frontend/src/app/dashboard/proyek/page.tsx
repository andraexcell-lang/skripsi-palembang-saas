import Link from "next/link";

export default function ProyekPage() {
  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      
      {/* Top Header */}
      <header className="h-16 flex items-center justify-end px-8 border-b border-border-subtle bg-bg-base">
        <div className="flex items-center gap-4">
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
      <div className="p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto">
        
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Proyek Penelitian</h1>
          <p className="text-text-secondary mt-1">Buat skripsi, tesis, disertasi, atau artikel jurnal — semua di satu tempat.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/proyek/buat" className="bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-xl p-5 flex items-center gap-4 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
            </div>
            <div>
              <div className="font-bold text-base text-text-primary group-hover:text-brand-primary transition-colors">Buat Skripsi</div>
              <div className="text-sm text-text-muted mt-0.5">S1 — Bab 1-5 lengkap</div>
            </div>
          </Link>

          <div className="bg-bg-surface border border-border-subtle hover:border-accent-teal rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div>
              <div className="font-bold text-base text-text-primary group-hover:text-accent-teal transition-colors">Buat Tesis</div>
              <div className="text-sm text-text-muted mt-0.5">S2 — analisis kritis</div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle hover:border-accent-purple rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <div>
              <div className="font-bold text-base text-text-primary group-hover:text-accent-purple transition-colors">Buat Disertasi</div>
              <div className="text-sm text-text-muted mt-0.5">S3 — novelty kuat</div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle hover:border-text-secondary rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-text-secondary/20 text-text-secondary flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
            </div>
            <div>
              <div className="font-bold text-base text-text-primary transition-colors">Artikel Sinta</div>
              <div className="text-sm text-text-muted mt-0.5">Jurnal terakreditasi</div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle hover:border-accent-red rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center shrink-0">
              <span className="font-bold text-lg">Q</span>
            </div>
            <div>
              <div className="font-bold text-base text-text-primary group-hover:text-accent-red transition-colors">Artikel Scopus</div>
              <div className="text-sm text-text-muted mt-0.5">Jurnal internasional (Q1-Q4)</div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle hover:border-brand-gold rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
            </div>
            <div>
              <div className="font-bold text-base text-text-primary group-hover:text-yellow-500 transition-colors">Ubah Skripsi → Artikel</div>
              <div className="text-sm text-text-muted mt-0.5">Skripsi/tesis jadi artikel jurnal</div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
          <p className="text-text-secondary">Belum ada proyek. Pilih salah satu di atas untuk mulai.</p>
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
