export default function AffiliatePage() {
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
             <button className="text-text-secondary hover:text-text-primary mr-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             </button>
             <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
                I
             </div>
             <span className="text-sm font-medium text-text-primary hidden sm:block">Indah Permata ...</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
        
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Program Affiliate</h1>
          <p className="text-text-secondary text-sm">Ajak orang lain berlangganan dan dapatkan komisi. Komisi saat ini: <strong className="text-text-primary">10% per transaksi referral</strong>.</p>
        </div>

        {/* Blurred Content */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-16 flex flex-col items-center justify-center text-center opacity-30 filter blur-[2px] select-none pointer-events-none">
           <div className="text-text-muted mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
           </div>
           <p className="text-text-primary font-bold text-lg mb-2">Program Terkunci</p>
           <p className="text-text-secondary text-sm">Anda harus berlangganan minimal 1 kali.</p>
        </div>

      </div>

      {/* Modal Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
          <button className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect><path d="M12 8v12"></path><path d="M19 8c0-1.66-1.34-3-3-3s-3 1.34-3 3"></path><path d="M5 8c0-1.66 1.34-3 3-3s3 1.34 3 3"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-3">Berlangganan dulu, yuk!</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Program affiliate hanya untuk pengguna yang pernah berlangganan. Pilih paket dan mulai dapatkan komisi dari setiap referral.
            </p>
            <button className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm py-3 rounded-lg transition-colors shadow-lg shadow-brand-primary/20">
              Lihat Paket Langganan
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
