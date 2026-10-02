export default function PengaturanPage() {
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
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-6 overflow-y-auto pb-32">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary mb-1">Pengaturan</h1>
        </div>

        {/* Profil */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
           <h2 className="font-bold text-text-primary text-base mb-6">Profil</h2>
           
           <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-bg-surface-hover border border-border-strong flex items-center justify-center text-text-primary font-bold text-xl">
                 I
              </div>
              <div>
                 <div className="font-bold text-text-primary text-sm mb-1">Foto Profil</div>
                 <button className="text-brand-primary text-xs font-bold hover:underline">Unggah foto (JPG/PNG, maks 5 MB)</button>
              </div>
           </div>

           <div className="space-y-5">
              <div>
                 <label className="block font-bold text-text-primary text-sm mb-2">Nama</label>
                 <input type="text" defaultValue="Indah Permata Sari" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
              </div>
              
              <div>
                 <label className="block font-bold text-text-primary text-sm mb-2 flex items-center gap-1.5">
                    Email
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                 </label>
                 <input type="email" defaultValue="indahindahpermatasarisari@gmail.com" disabled className="w-full bg-bg-surface-hover border border-border-strong rounded-lg p-3 text-sm text-text-muted cursor-not-allowed mb-1" />
                 <p className="text-[11px] text-text-muted">Email tak bisa diubah (identitas login).</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block font-bold text-text-primary text-sm mb-2">Universitas</label>
                    <input type="text" defaultValue="Yogyakarta" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
                 </div>
                 <div>
                    <label className="block font-bold text-text-primary text-sm mb-2">Jurusan</label>
                    <input type="text" defaultValue="manajemen" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
                 </div>
              </div>

              <div>
                 <label className="block font-bold text-text-primary text-sm mb-2">Jenjang</label>
                 <select className="w-full max-w-[200px] bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none appearance-none">
                    <option>S1</option>
                    <option>S2</option>
                    <option>S3</option>
                 </select>
              </div>

              <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 mt-4 transition-colors">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                 Simpan Perubahan
              </button>
           </div>
        </div>

        {/* Ganti Password */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
           <h2 className="font-bold text-text-primary text-base mb-6 flex items-center gap-2">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
             Ganti Password
           </h2>
           <div className="space-y-4 max-w-sm">
              <div>
                 <label className="block font-bold text-text-primary text-sm mb-2">Password saat ini</label>
                 <div className="relative">
                    <input type="password" placeholder="••••••••" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 pr-10 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
                    <button className="absolute right-3 top-3 text-text-muted hover:text-text-primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                 </div>
              </div>
              <div>
                 <label className="block font-bold text-text-primary text-sm mb-2">Password baru (min. 8)</label>
                 <div className="relative">
                    <input type="password" placeholder="••••••••" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 pr-10 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
                    <button className="absolute right-3 top-3 text-text-muted hover:text-text-primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                 </div>
              </div>
              <div>
                 <label className="block font-bold text-text-primary text-sm mb-2">Ulangi password baru</label>
                 <div className="relative">
                    <input type="password" placeholder="••••••••" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 pr-10 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
                    <button className="absolute right-3 top-3 text-text-muted hover:text-text-primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                 </div>
              </div>
              <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 mt-2 transition-colors">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                 Simpan Password
              </button>
           </div>
        </div>

        {/* Tampilan Hasil Generate */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
           <h2 className="font-bold text-text-primary text-base mb-4">Tampilan Hasil Generate</h2>
           <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="border border-brand-primary bg-brand-primary/5 rounded-lg p-4 cursor-pointer">
                 <div className="font-bold text-brand-primary text-sm mb-1">Per sub-bab</div>
                 <div className="text-xs text-text-secondary leading-relaxed">Sub-bab langsung tampil utuh begitu selesai — paling cepat sampai ke layar.</div>
              </label>
              <label className="border border-border-strong bg-bg-base rounded-lg p-4 cursor-pointer hover:border-text-secondary">
                 <div className="font-bold text-text-primary text-sm mb-1">Kata per kata</div>
                 <div className="text-xs text-text-secondary leading-relaxed">Diketik seperti AI menulis langsung. Lebih menarik untuk direkam, sedikit lebih lama.</div>
              </label>
           </div>
           <p className="text-[11px] text-text-muted">Tersimpan di peramban ini. Kalau kamu membaca Mantra dari perangkat atau peramban lain, pilihannya kembali ke Per sub-bab.</p>
        </div>

        {/* Akun */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
           <h2 className="font-bold text-text-primary text-base mb-4">Akun</h2>
           <button className="border border-border-strong bg-bg-base hover:bg-bg-surface-hover text-text-primary px-5 py-2.5 rounded-lg text-sm font-bold mb-6 transition-colors">
              Keluar dari akun
           </button>
           
           <div className="border border-accent-red/30 bg-accent-red/5 rounded-lg p-5">
              <h3 className="font-bold text-accent-red text-sm mb-1">Hapus Akun</h3>
              <p className="text-xs text-text-secondary mb-4">Sesuai UU PDP, kamu berhak menghapus akun dan datamu. Fitur ini aktif pada fase berikutnya.</p>
              <button className="bg-accent-red/80 hover:bg-accent-red text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors">
                 Hapus Akun Saya
              </button>
           </div>
        </div>

        {/* Kunci API */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
           <h2 className="font-bold text-text-primary text-base mb-4 flex items-center gap-2">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
             Kunci API
           </h2>
           <p className="text-sm text-text-secondary mb-6 leading-relaxed">
             Untuk menghubungkan Mantra dengan aplikasi lain — misalnya plugin <strong className="text-text-primary">Microsoft Word</strong> — yang tidak bisa memakai sesi login browser. Kunci mewakili akunmu: siapa pun yang memegangnya bisa memakai kredit dan membaca proyekmu.
           </p>
           
           <div className="max-w-md mb-4">
              <label className="block font-bold text-text-primary text-sm mb-2">Nama kunci</label>
              <div className="flex gap-3">
                 <input type="text" defaultValue="Plugin Word" className="flex-1 bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
                 <button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors whitespace-nowrap">
                    <span className="text-lg leading-none">+</span> Buat kunci
                 </button>
              </div>
           </div>
           
           <p className="text-sm text-text-muted">Belum ada kunci aktif.</p>
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
