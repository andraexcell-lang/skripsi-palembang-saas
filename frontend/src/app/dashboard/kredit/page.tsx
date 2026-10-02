export default function RiwayatKreditPage() {
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
          <h1 className="text-2xl font-bold text-text-primary mb-1">Riwayat Kredit</h1>
          <p className="text-text-secondary text-sm">Sisa kredit dan rincian setiap aktivitas yang memakainya.</p>
        </div>

        {/* Sisa Kredit Box */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 relative">
           
           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                 <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">SISA KREDIT</div>
                 <div className="text-4xl font-bold text-accent-red mb-1">0</div>
                 <div className="text-sm text-text-secondary mb-2">Terpakai 0 dari 0 kredit</div>
                 <div className="bg-bg-surface-hover border border-border-strong text-text-secondary px-3 py-1 rounded text-xs font-semibold w-max">Gratis</div>
              </div>
              <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                 <span className="text-lg leading-none">+</span> Pilih paket berlangganan
              </button>
           </div>

           <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red rounded-lg p-4 text-xs font-semibold">
              Akun gratis belum punya kredit. Pilih paket berlangganan untuk mulai memakai fitur AI — kreditnya langsung terisi.
           </div>
        </div>

        {/* Rincian Aktivitas */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
           <h3 className="font-bold text-text-primary text-base mb-1">Rincian Aktivitas</h3>
           <p className="text-xs text-text-secondary mb-6">Kredit dipotong SEKALI per bab — sub-bab berikutnya di bab yang sama tidak menambah biaya.</p>

           <div className="border-t border-border-subtle pt-16 pb-12 flex items-center justify-center text-center">
              <p className="text-text-muted text-sm">Belum ada aktivitas kredit.</p>
           </div>
        </div>

        <p className="text-[10px] text-text-muted mt-4 flex items-center gap-1.5 px-2">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
           Sisa kredit di atas adalah angka resmi akunmu. Bila ada penyesuaian saldo oleh admin, riwayat penggunaan lama tetap ditampilkan sebagai catatan aktivitas.
        </p>

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
