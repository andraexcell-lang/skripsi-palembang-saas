import Link from "next/link";

export default function DashboardIndex() {
  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      
      {/* Top Header */}
      <header className="h-16 flex items-center justify-end px-8 border-b border-border-subtle bg-bg-base">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/proyek" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
            <span>+</span> Proyek Baru
          </Link>
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
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto pb-24">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <div className="w-5 h-5 bg-brand-primary rounded-full opacity-80 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Tanya AI Mantra Riset, atau ketik / untuk mulai membuat proyek..." 
            className="w-full bg-bg-surface border border-border-subtle rounded-full py-4 pl-12 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
          />
          <button className="absolute inset-y-0 right-2 my-auto w-8 h-8 bg-text-primary text-bg-base rounded-full flex items-center justify-center hover:bg-text-secondary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          </button>
        </div>

        {/* Highlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Terakhir Dibuat */}
          <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 top-4 text-border-strong opacity-20">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
            </div>
            
            <div>
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-3 font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Terakhir dibuat
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-8 relative z-10 w-3/4">pengaruh motivasi kerja terhadap kinerja pegawai</h2>
            </div>
            
            <div className="flex items-end justify-between relative z-10">
              <div className="text-xs text-text-muted flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Diperbarui 3 Oktober 2026
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary">0/3 bab - 0%</span>
                  <div className="w-24 h-1.5 bg-bg-base rounded-full mt-1 border border-border-subtle overflow-hidden">
                    <div className="h-full bg-brand-primary w-0"></div>
                  </div>
                </div>
                <Link href="/dashboard/studio/1" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 shadow-md shadow-brand-primary/20">
                  Buka Proyek <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Paket Free */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-border-strong/20 flex items-center justify-center text-brand-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <span className="font-bold text-text-primary text-lg">Paket Free</span>
            </div>
            
            <div className="text-text-secondary text-sm flex items-center gap-2 mb-4 font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              0 kredit tersisa
            </div>
            
            <button className="w-full bg-transparent border border-border-strong text-text-primary hover:bg-bg-surface-hover py-2 rounded-lg text-sm font-semibold transition-colors mb-auto">
              Pilih Paket →
            </button>
            
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border-subtle text-xs font-semibold">
              <a href="#" className="flex items-center gap-1.5 text-brand-primary hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Plugin Word
              </a>
              <a href="#" className="flex items-center gap-1.5 text-green-500 hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Grup WA
              </a>
            </div>
          </div>
        </div>

        {/* Mulai Buat Karya */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Mulai buat karya</h3>
            <span className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">Pilih jenis karya sesuai kebutuhanmu →</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link href="/dashboard/proyek" className="bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-xl p-4 flex items-center gap-3 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
              </div>
              <div>
                <div className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">Skripsi</div>
                <div className="text-xs text-text-muted">S1 · Bab 1-5 lengkap</div>
              </div>
            </Link>
            
            <div className="bg-bg-surface border border-border-subtle hover:border-accent-teal rounded-xl p-4 flex items-center gap-3 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-accent-teal/20 text-accent-teal flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div>
                <div className="font-bold text-sm text-text-primary group-hover:text-accent-teal transition-colors">Tesis</div>
                <div className="text-xs text-text-muted">S2 · Analisis mendalam</div>
              </div>
            </div>
            
            <div className="bg-bg-surface border border-border-subtle hover:border-accent-purple rounded-xl p-4 flex items-center gap-3 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </div>
              <div>
                <div className="font-bold text-sm text-text-primary group-hover:text-accent-purple transition-colors">Disertasi</div>
                <div className="text-xs text-text-muted">S3 · Kebaruan penelitian</div>
              </div>
            </div>
            
            <div className="bg-bg-surface border border-border-subtle hover:border-text-secondary rounded-xl p-4 flex items-center gap-3 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-text-secondary/20 text-text-secondary flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
              </div>
              <div>
                <div className="font-bold text-sm text-text-primary transition-colors">Artikel Sinta</div>
                <div className="text-xs text-text-muted">Jurnal terakreditasi</div>
              </div>
            </div>
            
            <div className="bg-bg-surface border border-border-subtle hover:border-accent-red rounded-xl p-4 flex items-center gap-3 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center shrink-0">
                <span className="font-bold">Q</span>
              </div>
              <div>
                <div className="font-bold text-sm text-text-primary group-hover:text-accent-red transition-colors">Artikel Scopus</div>
                <div className="text-xs text-text-muted">Jurnal internasional</div>
              </div>
            </div>
          </div>
        </div>

        {/* Proyek Terakhir List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Proyek terakhir</h3>
            <div className="flex gap-4 text-sm font-semibold">
              <span className="text-brand-primary border-b-2 border-brand-primary pb-1">Semua</span>
              <span className="text-text-secondary hover:text-text-primary cursor-pointer pb-1">Skripsi</span>
              <span className="text-text-secondary hover:text-text-primary cursor-pointer pb-1">Artikel</span>
            </div>
          </div>
          
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-bg-surface-hover transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm group-hover:text-brand-primary transition-colors">pengaruh motivasi kerja terhadap kinerja pegawai</h4>
                <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                  <span className="text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">Skripsi</span>
                  <span className="text-text-secondary bg-bg-base px-2 py-0.5 rounded">S1</span>
                  <span className="text-text-muted flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Diperbarui 3 Oktober 2026
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right w-24">
                <div className="text-xs font-bold text-text-primary mb-1">0/3 bab</div>
                <div className="w-full h-1 bg-bg-base rounded-full border border-border-subtle overflow-hidden">
                   <div className="h-full bg-brand-primary w-0"></div>
                </div>
              </div>
              <div className="text-xs font-bold text-text-primary w-8 text-right">0%</div>
              <button className="text-text-muted hover:text-accent-red p-2 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
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
