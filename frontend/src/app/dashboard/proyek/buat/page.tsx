'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost, apiUpload } from '@/lib/api';
import CreditBadge from '@/components/CreditBadge';

const METODE = [
  ['Kualitatif', ''],
  ['Kuantitatif', ''],
  ['Kuantitatif — Data Sekunder', 'BPS, deret waktu, arsip'],
  ['Studi Pustaka', 'Library Research'],
  ['PTK', 'Penelitian Tindakan Kelas'],
  ['R&D', ''],
  ['Mixed Method', ''],
  ['Hukum Normatif', ''],
  ['Hukum Empiris', ''],
  ['Eksperimen / Rekayasa', 'dataset, alat, laboratorium'],
];
const GAYA = ['APA 7th', 'Harvard', 'IEEE', 'Vancouver', 'MLA 9th', 'Chicago', 'Chicago Fullnote (Footnote)', 'Turabian (Footnote)'];
const BAHASA = ['Indonesia', 'Inggris (English)', 'Melayu', 'Spanyol (Español)', 'Prancis (Français)', 'Mandarin (中文)', 'Hindi (हिन्दी)', 'Arab (العربية)'];
const TAHUN = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006];

export default function BuatSkripsiPage() {
  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState('skripsi');
  const [metode, setMetode] = useState('Kualitatif');
  const [tahap, setTahap] = useState('full');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [kampus, setKampus] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [fakultas, setFakultas] = useState('');
  const [logo, setLogo] = useState('');
  const [gaya, setGaya] = useState('APA 7th');
  const [bahasa, setBahasa] = useState('Indonesia');
  const [tahun, setTahun] = useState('');
  const [asal, setAsal] = useState('semua');
  const [scopeUmum, setScopeUmum] = useState(true);
  const [scopeSinta, setScopeSinta] = useState(false);
  const [scopeScopus, setScopeScopus] = useState(false);
  const [dataAwal, setDataAwal] = useState('');
  const [outlineOn, setOutlineOn] = useState(false);
  const [outline, setOutline] = useState('');
  const [fenomena, setFenomena] = useState(true);
  const [sources, setSources] = useState<{ name: string; text: string }[]>([]);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const router = useRouter();

  const JENIS_LABEL: Record<string, string> = { skripsi: 'Skripsi (S1)', tesis: 'Tesis (S2)', disertasi: 'Disertasi (S3)', artikel: 'Ubah Skripsi → Artikel' };
  const ringkas = (): [string, string][] => {
    const scopes = [scopeSinta ? 'Sinta' : '', scopeScopus ? 'Scopus' : ''].filter(Boolean);
    const sumber = [scopeUmum ? 'Umum' : '', ...scopes].join(' + ') || 'Umum';
    const rows: [string, string][] = [
      ['Judul', judul.trim()],
      ['Jenis', JENIS_LABEL[jenis] || jenis],
      ['Metode', metode],
    ];
    if (jenis !== 'artikel') rows.push(['Tahap', tahap === 'proposal' ? 'Proposal (Bab I–III)' : 'Skripsi Penuh (Bab I–V)']);
    rows.push(
      ['Gaya sitasi', gaya],
      ['Bahasa tulisan', bahasa],
      ['Asal referensi', asal === 'semua' ? 'Indonesia & Internasional' : asal === 'indonesia' ? 'Indonesia' : 'Internasional'],
      ['Sumber referensi', sumber],
      ['Struktur bab', outlineOn && outline.trim() ? `Custom (${(outline.match(/BAB/gi) || []).length || '-'} bab)` : 'Baku'],
    );
    return rows;
  };

  useEffect(() => {
    try {
      const j = new URLSearchParams(window.location.search).get('jenis');
      if (j === 'tesis' || j === 'disertasi' || j === 'skripsi') setJenis(j);
    } catch { /* abaikan */ }
  }, []);

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => setLogo(String(rd.result || '').slice(0, 500000));
    rd.readAsDataURL(f);
  }

  async function extractTo(setter: (v: string) => void, current: string, tag: string) {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.pdf,.docx,.txt';
    inp.onchange = async () => {
      const f = inp.files?.[0];
      if (!f) return;
      setBusy(tag);
      try {
        const r = await apiUpload('/api/files/extract', f);
        setter(((current ? current + '\n\n' : '') + (r.text || '')).slice(0, 8000));
      } catch (e: any) { setErr(e.message); }
      setBusy('');
    };
    inp.click();
  }

  async function addSource(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || sources.length >= 10) return;
    setBusy('sumber');
    try {
      const r = await apiUpload('/api/files/extract', f);
      setSources([...sources, { name: f.name, text: String(r.text || '').slice(0, 3000) }]);
    } catch (e: any) { setErr(e.message); }
    setBusy('');
    e.target.value = '';
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!konfirmasi) { setKonfirmasi(true); return; }
    await jalankan();
  }

  async function jalankan() {
    setErr(''); setLoading(true);
    try {
      const scopes = [];
      if (scopeUmum) scopes.push('umum');
      if (scopeSinta) scopes.push('sinta');
      if (scopeScopus) scopes.push('scopus');
      const r = await apiPost('/api/projects', {
        judul, jenis, metode, tahap,
        identitas: { nama, nim, kampus, jurusan, fakultas, logo },
        citation_style: gaya, language: bahasa,
        min_year: tahun ? parseInt(tahun, 10) : null,
        ref_origin: asal, ref_scope: scopes.join(',') || 'umum', initial_data: dataAwal,
        custom_outline: outlineOn ? outline : '', fetch_fenomena: fenomena,
        custom_sources: sources,
      });
      if (jenis === 'artikel') {
        router.push('/dashboard/artikel-sinta');
      } else {
        router.push(`/dashboard/studio/${r.item.id}?mulai=1`);
      }
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <header className="h-16 flex items-center justify-end px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <CreditBadge />
      </header>
      <form onSubmit={submit} className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-5 overflow-y-auto pb-24">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Buat Proyek Skripsi</h1>
          <p className="text-xs text-text-muted">Lengkapi informasi penelitian. Data ini akan digunakan untuk penyusunan skripsi dan halaman sampul.</p>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <label className="font-bold text-text-primary text-sm">Judul penelitian</label>
            <Link href="/dashboard/brainstorming" className="text-xs text-brand-primary hover:underline">Belum punya judul?</Link>
          </div>
          <textarea rows={3} required value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Ketik judul atau gunakan Brainstorming Judul" className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-center text-sm text-text-primary" />
          <p className="text-xs text-text-muted">Gunakan judul yang sesuai dengan fokus penelitianmu.</p>
          <label className="font-bold text-text-primary text-sm block pt-2">Logo kampus</label>
          <label className="border-2 border-dashed border-border-strong rounded-xl bg-bg-base flex flex-col items-center justify-center py-8 cursor-pointer hover:border-brand-primary transition-colors">
            <input type="file" accept=".png,.jpg,.jpeg" onChange={onLogo} className="hidden" />
            <span className="font-bold text-sm text-text-primary">{logo ? 'Logo terpasang ✓' : 'Unggah logo'}</span>
            <span className="text-xs text-text-muted">PNG/JPG, maksimal 2 MB</span>
          </label>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary">Jenis dan metode penelitian</h3>
          <div>
            <label className="font-bold text-text-primary text-sm block mb-2">Jenis penelitian</label>
            <div className="grid grid-cols-2 gap-3">
              {[['skripsi', 'Skripsi (S1)'], ['tesis', 'Tesis (S2)'], ['disertasi', 'Disertasi (S3)'], ['artikel', 'Ubah Skripsi → Artikel']].map(([v, l]) => (
                <div key={v} onClick={() => setJenis(v)} className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer ${jenis === v ? 'border-2 border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base'}`}>
                  <span className="text-sm text-text-primary">{l}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-2">Tesis (S2) & Disertasi (S3) tersedia di paket Profesor.</p>
          </div>
          <div>
            <label className="font-bold text-text-primary text-sm block mb-2">Metode penelitian</label>
            <div className="grid grid-cols-2 gap-3">
              {METODE.map(([m, sub]) => (
                <div key={m} onClick={() => setMetode(m)} className={`border rounded-lg p-3 cursor-pointer ${metode === m ? 'border-2 border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                  <span className="text-sm text-text-primary">{m}</span>
                  {sub ? <div className="text-[11px] text-text-muted">{sub}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
          <h3 className="font-bold text-text-primary">Tahap pengerjaan</h3>
          <p className="text-[11px] text-text-muted">Pilih sesuai kesiapan penelitianmu.</p>
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => setTahap('proposal')} className={`border rounded-lg p-4 cursor-pointer ${tahap === 'proposal' ? 'border-2 border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base'}`}>
              <div className="font-bold text-sm text-text-primary">Proposal (Bab I–III)</div>
              <div className="text-[11px] text-text-muted mt-1">Untuk seminar proposal. Bab IV–V terkunci sampai penelitian selesai.</div>
            </div>
            <div onClick={() => setTahap('full')} className={`border rounded-lg p-4 cursor-pointer ${tahap === 'full' ? 'border-2 border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base'}`}>
              <div className="font-bold text-sm text-brand-primary">Skripsi Penuh (Bab I–V)</div>
              <div className="text-[11px] text-text-muted mt-1">Data penelitian sudah tersedia dan siap dilanjutkan sampai Bab V.</div>
            </div>
          </div>
          <p className="text-[11px] text-text-muted">Tahap bisa diubah dari Studio. Bab I–III tetap tersimpan dan menjadi acuan Bab IV.</p>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary text-sm">Identitas mahasiswa dan kampus</h3>
          <p className="text-[11px] text-text-muted">Data ini akan ditampilkan pada halaman sampul.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Nama lengkap</label>
              <input value={nama} onChange={(e) => setNama(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">NIM</label>
              <input value={nim} onChange={(e) => setNim(e.target.value)} placeholder="Nomor Induk Mahasiswa" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Nama kampus</label>
              <input value={kampus} onChange={(e) => setKampus(e.target.value)} placeholder="Universitas" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Jurusan / Program studi</label>
              <input value={jurusan} onChange={(e) => setJurusan(e.target.value)} placeholder="Program studi" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Fakultas</label>
              <input value={fakultas} onChange={(e) => setFakultas(e.target.value)} placeholder="Masukkan nama fakultas" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text-primary text-sm">Struktur bab kustom <span className="text-[10px] text-text-muted font-normal">OPSIONAL</span></h3>
              <p className="text-[11px] text-text-muted">Atur bab/sub-bab manual. Jika tidak diaktifkan, sistem menggunakan struktur standar Bab I–V.</p>
            </div>
            <button type="button" onClick={() => setOutlineOn(!outlineOn)} className={`w-12 h-7 rounded-full transition-colors ${outlineOn ? 'bg-brand-primary' : 'bg-border-strong'}`}>
              <span className={`block w-5 h-5 bg-white rounded-full mt-1 transition-all ${outlineOn ? 'ml-6' : 'ml-1'}`}></span>
            </button>
          </div>
          {outlineOn && (
            <textarea rows={3} value={outline} onChange={(e) => setOutline(e.target.value)} placeholder="Contoh: BAB I: Pendahuluan (1.1 Latar Belakang, 1.2 Rumusan Masalah...)" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          )}
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary text-sm">Data awal penelitian <span className="text-[10px] text-text-muted font-normal">OPSIONAL</span></h3>
          <p className="text-[11px] text-text-muted">Tambahkan kondisi nyata, angka, atau hasil observasi awal untuk mendukung latar belakang penelitian.</p>
          <textarea rows={3} value={dataAwal} onChange={(e) => setDataAwal(e.target.value)} placeholder="Contoh: Di SMAN 1 X, 62% siswa belum memanfaatkan e-library; rata-rata skor literasi digital 40/100 (survei 2024)." className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          <button type="button" onClick={() => extractTo(setDataAwal, dataAwal, 'awal')} disabled={busy === 'awal'} className="w-full border-2 border-dashed border-border-strong rounded-xl bg-bg-base py-6 text-sm font-bold text-text-primary hover:border-brand-primary disabled:opacity-50">
            {busy === 'awal' ? 'Membaca file...' : 'Klik untuk unggah file pendukung'}
            <span className="block text-[10px] font-normal text-text-muted">PDF atau DOCX, maksimal 10 MB</span>
          </button>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={fenomena} onChange={(e) => setFenomena(e.target.checked)} className="mt-1 accent-brand-primary" />
            <div>
              <div className="text-sm font-bold text-text-primary">Cari data fenomena di internet dan sertakan tabel</div>
              <div className="text-[11px] text-text-muted">AI mencari statistik dan fakta terbaru sesuai topikmu, lalu menyusun tabel fenomena di Bab I lengkap dengan sumber dan tahun. Nonaktifkan jika topik sangat lokal atau data daring terbatas.</div>
            </div>
          </label>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary text-sm">Pengaturan sitasi</h3>
          <p className="text-[11px] text-text-muted">Sesuaikan referensi dan format penulisan dengan kebutuhan penelitianmu.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Tahun terbit minimum</label>
              <select value={tahun} onChange={(e) => setTahun(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                <option value="">Semua tahun</option>
                {TAHUN.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <p className="text-[10px] text-text-muted mt-1">Berlaku untuk jurnal. Buku teori & metodologi dibebaskan.</p>
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Asal referensi</label>
              <select value={asal} onChange={(e) => setAsal(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                <option value="semua">Indonesia & Internasional</option>
                <option value="indonesia">Indonesia</option>
                <option value="internasional">Internasional</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Gaya sitasi</label>
              <select value={gaya} onChange={(e) => setGaya(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                {GAYA.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Bahasa penulisan</label>
              <select value={bahasa} onChange={(e) => setBahasa(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                {BAHASA.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-text-primary block mb-1">Sumber referensi</label>
            <p className="text-[10px] text-text-muted mb-2">Pilih satu atau lebih kategori sumber referensi.</p>
            <div className="grid grid-cols-3 gap-3">
              <label className={`flex items-center gap-2 border rounded-lg p-3 text-sm cursor-pointer ${scopeUmum ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong'}`}><input type="checkbox" checked={scopeUmum} onChange={(e) => setScopeUmum(e.target.checked)} className="accent-brand-primary" /> Umum</label>
              <label className={`flex items-center gap-2 border rounded-lg p-3 text-sm cursor-pointer ${scopeSinta ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong'}`}><input type="checkbox" checked={scopeSinta} onChange={(e) => setScopeSinta(e.target.checked)} className="accent-brand-primary" /> Terindeks Sinta</label>
              <label className={`flex items-center gap-2 border rounded-lg p-3 text-sm cursor-pointer ${scopeScopus ? 'border-brand-primary bg-brand-primary/10' : 'border-border-strong'}`}><input type="checkbox" checked={scopeScopus} onChange={(e) => setScopeScopus(e.target.checked)} className="accent-brand-primary" /> Terindeks Scopus</label>
            </div>
            <p className="text-[10px] text-text-muted mt-1">Umum: referensi dari sumber mana pun (default).</p>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-text-primary text-sm">Unggah artikel atau buku <span className="text-[10px] text-text-muted font-normal">OPSIONAL</span></h3>
            <span className="text-[10px] text-text-muted">{sources.length}/10 sumber</span>
          </div>
          <p className="text-[11px] text-text-muted">Untuk sumber yang wajib kamu pakai — arahan pembimbing, buku teori, atau jurnal berlangganan. Sumber ini ikut masuk Daftar Pustaka bila benar-benar disitasi.</p>
          <label className="flex items-center gap-3 border border-border-strong rounded-lg p-3 text-sm cursor-pointer">
            <span className="bg-bg-surface-hover border border-border-strong px-3 py-1.5 rounded text-xs font-bold">Pilih File</span>
            <span className="text-text-muted text-xs">{busy === 'sumber' ? 'Membaca...' : 'Tidak ada file yang dipilih'}</span>
            <input type="file" accept=".pdf,.docx,.txt" onChange={addSource} className="hidden" />
          </label>
          {sources.map((s, i) => (
            <div key={i} className="text-xs text-text-secondary flex justify-between border-t border-border-subtle py-1">
              <span className="truncate">{s.name}</span>
              <button type="button" onClick={() => setSources(sources.filter((_, j) => j !== i))} className="text-accent-red font-bold ml-2">Hapus</button>
            </div>
          ))}
          <p className="text-[10px] text-text-muted">Maks 15MB. PDF hasil scan tak bisa dibaca otomatis.</p>
        </div>

        {err && <p className="text-sm text-accent-red">{err}</p>}

        {konfirmasi && (
          <div className="border border-brand-primary/40 bg-brand-primary/5 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-text-primary">Periksa dulu sebelum generate</p>
            <p className="text-xs text-text-muted">Pilihan di bawah menentukan arah seluruh naskah. Mengubahnya nanti berarti generate ulang.</p>
            <dl className="space-y-1.5 text-xs">
              {ringkas().map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-28 shrink-0 text-text-muted">{k}</dt>
                  <dd className="font-medium text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setKonfirmasi(false)} disabled={loading} className="flex-1 border border-border-strong rounded-lg py-2.5 text-sm font-bold text-text-primary disabled:opacity-50">
                Ubah dulu
              </button>
              <button type="button" onClick={() => jalankan()} disabled={loading} className="flex-1 bg-brand-primary text-white rounded-lg py-2.5 text-sm font-bold disabled:opacity-50">
                {loading ? 'Menyiapkan…' : 'Ya, generate'}
              </button>
            </div>
          </div>
        )}

        <button disabled={loading || konfirmasi} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Lanjut Generate Skripsi →'}
        </button>
      </form>
    </div>
  );
}
