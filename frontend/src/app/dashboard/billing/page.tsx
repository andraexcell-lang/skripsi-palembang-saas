export default function BillingPage() {
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
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8 overflow-y-auto pb-20">
        
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Billing</h1>
          <p className="text-text-secondary text-sm">Kelola paket dan kreditmu.</p>
        </div>

        {/* Current Plan Box */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="font-bold text-text-primary text-base">Paket Free</span>
                 <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Aktif</span>
              </div>
              <div className="text-xs text-text-secondary">0 dari 0 kredit tersisa</div>
           </div>
        </div>

        {/* Pilih Paket Section */}
        <div>
           <h2 className="font-bold text-text-primary text-base mb-4">Pilih Paket</h2>

           {/* Paket Mahasiswa */}
           <div className="mb-6">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-sm mb-4 cursor-pointer">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                 Paket Mahasiswa
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 {/* Card 1 */}
                 <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">BULANAN</div>
                    <div className="flex items-baseline gap-1 mb-3">
                       <span className="text-xl font-bold text-text-primary">Rp 109.000</span>
                       <span className="text-xs text-text-secondary">/ bulan</span>
                    </div>
                    <div className="bg-bg-base border border-border-strong rounded-lg p-3 mb-4">
                       <div className="font-bold text-text-primary text-sm mb-1">100 + 10 bonus <span className="font-normal text-text-secondary">kredit</span></div>
                       <div className="text-[11px] text-brand-primary font-semibold flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          Bisa perpanjang otomatis (hemat 10%)
                       </div>
                       <p className="text-[10px] text-text-muted mt-2 leading-relaxed">Satu kreditnya hanya Rp909! Menulis bab — parafrase, cek plagiasi, PPT, & simulasi sidang memakai kredit yang sama.</p>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Semua eksport AI ke Word</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Unduh Word & Generate PPT</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Pembacaan Bab I-V</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Olah otomatis</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Lab Revisi</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Simulasi percakapan sidang</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Simulasi Sidang dengan AI</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Cek Plagiasi tanpa limit</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Uji coba 7 hari gratis selamanya</li>
                    </ul>
                    <div className="text-[10px] text-text-muted flex items-center gap-1.5 mb-4 border-t border-border-subtle pt-3"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Tidak dikenakan biaya di awal jurnal</div>
                    <button className="w-full bg-bg-surface-hover hover:bg-border-strong border border-border-strong text-text-primary font-bold text-xs py-3 rounded-lg transition-colors">Pilih Bulanan</button>
                 </div>

                 {/* Card 2 (Populer) */}
                 <div className="bg-bg-surface border-2 border-brand-primary rounded-xl p-6 flex flex-col relative shadow-[0_0_15px_rgba(0,102,255,0.1)]">
                    <div className="absolute -top-3 left-6 bg-brand-primary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                       Populer
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 mt-2">3 BULAN</div>
                    <div className="flex items-baseline gap-1 mb-3">
                       <span className="text-xl font-bold text-text-primary">Rp 299.000</span>
                       <span className="text-xs text-text-secondary">/ 3 bulan</span>
                    </div>
                    <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-3 mb-4">
                       <div className="font-bold text-text-primary text-sm mb-1">300 + 45 bonus <span className="font-normal text-text-secondary">kredit</span></div>
                       <div className="text-[11px] text-brand-primary font-semibold flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          Bisa perpanjang otomatis (hemat 10%)
                       </div>
                       <p className="text-[10px] text-text-secondary mt-2 leading-relaxed">Satu kreditnya hanya Rp866! Menulis bab — parafrase, cek plagiasi, PPT, & simulasi sidang memakai kredit yang sama.</p>
                    </div>
                    <ul className="space-y-2.5 mb-6 flex-1">
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-brand-primary mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Hanya Rp99.667 / bln</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Unduh Word & Generate PPT</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Pembacaan Bab I-V</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Olah otomatis</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Lab Revisi</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Simulasi percakapan sidang</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Simulasi Sidang dengan AI</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Cek Plagiasi tanpa limit</li>
                       <li className="flex items-start gap-2 text-[11px] text-text-secondary"><svg className="text-green-500 mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Lengkap semuanya sebetulnya</li>
                    </ul>
                    <div className="text-[10px] text-text-muted flex items-center gap-1.5 mb-4 border-t border-border-subtle pt-3"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Tidak dikenakan biaya di awal jurnal</div>
                    <button className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs py-3 rounded-lg transition-colors shadow-lg shadow-brand-primary/20">Pilih 3 Bulan</button>
                 </div>

                 {/* Card 3 (Semester) */}
                 <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">SEMESTER (6 BULAN)</div>
                    <div className="flex items-baseline gap-1 mb-3">
                       <span className="text-xl font-bold text-text-primary">Rp 599.000</span>
                       <span className="text-xs text-text-secondary">/ 6 bulan</span>
                    </div>
                    <div className="bg-bg-base border border-border-strong rounded-lg p-3 mb-4">
                       <div className="font-bold text-text-primary text-sm mb-1">600 + 150 bonus <span className="font-normal text-text-secondary">kredit</span></div>
                       <div className="text-[11px] text-brand-primary font-semibold flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          + 30% diskon bayar (Rp 700 / cr)
                       </div>
                    </div>
                    <button className="w-full bg-bg-surface-hover hover:bg-border-strong border border-border-strong text-text-primary font-bold text-xs py-3 rounded-lg mt-auto transition-colors">Pilih Semester (6 bln)</button>
                 </div>

                 {/* Card 4 (Tahunan) */}
                 <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">TAHUNAN</div>
                    <div className="flex items-baseline gap-1 mb-3">
                       <span className="text-xl font-bold text-text-primary">Rp 999.000</span>
                       <span className="text-xs text-text-secondary">/ tahun</span>
                    </div>
                    <div className="bg-bg-base border border-border-strong rounded-lg p-3 mb-4">
                       <div className="font-bold text-text-primary text-sm mb-1">1200 + 300 bonus <span className="font-normal text-text-secondary">kredit</span></div>
                       <div className="text-[11px] text-brand-primary font-semibold flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          + 40% diskon bayar (Rp 600 / cr)
                       </div>
                    </div>
                    <button className="w-full bg-bg-surface-hover hover:bg-border-strong border border-border-strong text-text-primary font-bold text-xs py-3 rounded-lg mt-auto transition-colors">Pilih Tahunan</button>
                 </div>

              </div>
           </div>

           {/* Paket Profesor */}
           <div className="mb-6">
              <div className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold text-sm mb-4 cursor-pointer transition-colors">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                 Paket Profesor
              </div>
           </div>
           
           {/* University Box */}
           <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                 <div className="font-bold text-text-primary text-base">University</div>
                 <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 rounded">Berdua</div>
              </div>
              <div className="text-xs text-text-secondary mb-6">Untuk perpustakaan — lisensi akses tim anak, sama persis</div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                 <div className="border border-border-strong bg-bg-base rounded-lg p-4 text-center cursor-pointer hover:border-text-secondary">
                    <div className="font-bold text-text-primary text-sm mb-1">20 akun</div>
                    <div className="text-[10px] text-text-secondary">Hubungi kami</div>
                 </div>
                 <div className="border border-border-strong bg-bg-base rounded-lg p-4 text-center cursor-pointer hover:border-text-secondary">
                    <div className="font-bold text-text-primary text-sm mb-1">50 akun</div>
                    <div className="text-[10px] text-text-secondary">Hubungi kami</div>
                 </div>
                 <div className="border border-border-strong bg-bg-base rounded-lg p-4 text-center cursor-pointer hover:border-text-secondary">
                    <div className="font-bold text-text-primary text-sm mb-1">100 akun</div>
                    <div className="text-[10px] text-text-secondary">Hubungi kami</div>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button className="bg-bg-surface-hover hover:bg-border-strong border border-border-strong text-text-primary px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                    Hubungi Tim Kami
                 </button>
              </div>
           </div>

           <p className="text-center text-[10px] text-text-muted mb-8">Pembayaran via QRIS — instan, aman, paket langsung aktif seketika. Tanpa auto-charge.</p>

           {/* Riwayat Transaksi */}
           <div>
              <h3 className="font-bold text-text-primary text-base mb-3">Riwayat Transaksi</h3>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 flex items-center justify-center text-center">
                 <p className="text-sm text-text-muted">Belum ada transaksi.</p>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
}
