export default function BuatSkripsiPage() {
  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      
      {/* Top Header */}
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary/20 text-brand-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z"/></svg>
          </div>
          <div>
            <h1 className="font-bold text-text-primary leading-tight text-sm">Buat Proyek Skripsi</h1>
            <p className="text-xs text-text-muted">Lengkapi informasi penelitian. Data ini akan digunakan untuk penyusunan skripsi...</p>
          </div>
        </div>
        <div className="ml-auto text-xs font-semibold text-accent-red border border-accent-red/20 bg-accent-red/10 px-3 py-1 rounded-full">
          0 kredit
        </div>
      </header>

      {/* Main Content Form */}
      <div className="p-6 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto pb-32">
        
        {/* Section 1: Judul & Logo */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <label className="font-bold text-text-primary text-sm">Judul penelitian</label>
            <span className="text-xs text-brand-primary cursor-pointer hover:underline flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Belum punya judul?
            </span>
          </div>
          <textarea 
            rows={3}
            placeholder="Ketik judul atau gunakan Brainstorming Judul" 
            className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-center text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors text-sm resize-none mb-2"
          ></textarea>
          <p className="text-xs text-text-muted mb-6">Gunakan judul yang sesuai dengan fokus penelitianmu.</p>

          <label className="font-bold text-text-primary text-sm block mb-2">Logo kampus</label>
          <div className="border-2 border-dashed border-border-strong rounded-xl bg-bg-base flex flex-col items-center justify-center py-8 cursor-pointer hover:border-brand-primary transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <span className="font-bold text-sm text-text-primary">Unggah logo</span>
            <span className="text-xs text-text-muted">PNG/JPG, maksimal 2 MB</span>
          </div>
        </div>

        {/* Section 2: Jenis dan Metode */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <h3 className="font-bold text-text-primary mb-4">Jenis dan metode penelitian</h3>
          
          <label className="font-bold text-text-primary text-sm block mb-2">Jenis penelitian</label>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="border-2 border-brand-primary bg-brand-primary/10 rounded-lg p-3 flex items-center gap-3 cursor-pointer">
              <div className="w-4 h-4 rounded-full border-4 border-brand-primary"></div>
              <span className="text-sm font-semibold text-text-primary">Skripsi (S1)</span>
            </div>
            <div className="border border-border-strong bg-bg-base rounded-lg p-3 flex items-center gap-3 opacity-50 cursor-not-allowed">
              <div className="w-4 h-4 rounded-full border border-text-muted"></div>
              <span className="text-sm text-text-secondary">Tesis (S2)</span>
            </div>
            <div className="border border-border-strong bg-bg-base rounded-lg p-3 flex items-center gap-3 opacity-50 cursor-not-allowed">
              <div className="w-4 h-4 rounded-full border border-text-muted"></div>
              <span className="text-sm text-text-secondary">Disertasi (S3)</span>
            </div>
            <div className="border border-border-strong bg-bg-base rounded-lg p-3 flex items-center gap-3 cursor-pointer">
              <div className="w-4 h-4 rounded-full border border-text-muted"></div>
              <span className="text-sm text-text-secondary">Ubah Skripsi → Artikel</span>
            </div>
          </div>
          <p className="text-[11px] text-text-muted mb-6 flex items-center gap-1"><span className="text-brand-primary">👑</span> Tesis (S2) & Disertasi (S3) tersedia di paket Profesor.</p>

          <label className="font-bold text-text-primary text-sm block mb-2">Metode penelitian</label>
          <div className="grid grid-cols-2 gap-3">
            {['Kualitatif', 'Kuantitatif', 'Kuantitatif — Data Sekunder', 'Studi Pustaka', 'PTK', 'R&D', 'Mixed Method', 'Hukum Normatif', 'Hukum Empiris', 'Eksperimen / Rekayasa'].map((metode, idx) => (
              <div key={idx} className="border border-border-strong bg-bg-base rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-text-secondary">
                <div className="w-4 h-4 rounded-full border border-text-muted"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-text-primary">{metode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Tahap Pengerjaan */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <h3 className="font-bold text-text-primary mb-4">Tahap pengerjaan</h3>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="border border-border-strong bg-bg-base rounded-lg p-4 cursor-pointer flex gap-3">
              <div className="w-4 h-4 rounded-full border border-text-muted shrink-0 mt-0.5"></div>
              <div>
                <div className="font-bold text-sm text-text-primary">Proposal (Bab I-III)</div>
                <div className="text-[11px] text-text-muted mt-1">Untuk seminar proposal. Bab IV-V menyusul sampai penelitian selesai.</div>
              </div>
            </div>
            <div className="border-2 border-brand-primary bg-brand-primary/10 rounded-lg p-4 cursor-pointer flex gap-3">
              <div className="w-4 h-4 rounded-full border-4 border-brand-primary shrink-0 mt-0.5"></div>
              <div>
                <div className="font-bold text-sm text-brand-primary">Skripsi Penuh (Bab I-V)</div>
                <div className="text-[11px] text-text-muted mt-1">Data penelitian sudah tersedia dan siap dilanjutkan sampai Bab V.</div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-text-muted">ℹ️ Tahap bisa diubah dari Studio. Bab I-III tetap tersimpan dan menjadi acuan Bab IV.</p>
        </div>

        {/* Section 4: Identitas */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-bg-base flex items-center justify-center text-text-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div className="font-bold text-sm text-text-primary">Identitas mahasiswa dan kampus</div>
              <div className="text-[11px] text-text-muted">Data ini akan ditampilkan pada halaman sampul.</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-primary mb-1.5 block">Nama lengkap</label>
              <input type="text" defaultValue="Indah Permata Sari" className="w-full bg-bg-base border border-border-strong rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary mb-1.5 block">NIM</label>
              <input type="text" placeholder="Nomor Induk Mahasiswa" className="w-full bg-bg-base border border-border-strong rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-text-primary mb-1.5 block">Nama kampus</label>
              <input type="text" defaultValue="Yogyakarta" className="w-full bg-bg-base border border-border-strong rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary mb-1.5 block">Jurusan / Program studi</label>
              <input type="text" defaultValue="manajemen" className="w-full bg-bg-base border border-border-strong rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary mb-1.5 block">Fakultas</label>
              <input type="text" placeholder="Masukkan nama fakultas" className="w-full bg-bg-base border border-border-strong rounded-lg px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Section 5: Data Awal */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-bg-base flex items-center justify-center text-text-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div>
              <div className="font-bold text-sm text-text-primary flex items-center gap-2">Data awal penelitian <span className="bg-border-strong text-[9px] px-1.5 rounded uppercase">Opsional</span></div>
              <div className="text-[11px] text-text-muted">Tuliskan kondisi nyata, angka, atau hasil observasi awal untuk mendukung latar belakang penelitian.</div>
            </div>
          </div>
          
          <textarea 
            rows={4}
            placeholder="Contoh: Di SMAN 1 X, 62% siswa belum memanfaatkan e-library; rata-rata skor literasi digital 40/100 (survei 2024)." 
            className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none mb-4 resize-none"
          ></textarea>
          
          <div className="border-2 border-dashed border-border-strong rounded-xl bg-bg-base flex flex-col items-center justify-center py-6 cursor-pointer hover:border-brand-primary transition-colors mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span className="font-bold text-sm text-text-primary">Klik untuk unggah file pendukung</span>
            <span className="text-[10px] text-text-muted">PDF, DOCX, maksimal 10 MB</span>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="mt-1 accent-brand-primary" />
            <div>
              <div className="text-sm font-bold text-text-primary">Cari data fenomena di internet dan sertakan lokal</div>
              <div className="text-[11px] text-text-muted">AI mencari statistik dan fakta terbaru sesuai topikmu, lalu menyusun tabel fenomena di Bab I lengkap dengan sumber dan tahun.</div>
            </div>
          </label>
        </div>

      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-bg-surface border-t border-border-subtle z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs text-text-muted">
            <span className="text-accent-red font-bold">0 kredit</span> tersisa
          </div>
          <button className="bg-brand-primary hover:bg-brand-primary-hover text-white w-2/3 md:w-1/2 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
            Lanjut Generate Skripsi <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>

    </div>
  );
}
