'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

const METODE = ['Kualitatif', 'Kuantitatif', 'Kuantitatif — Data Sekunder', 'Studi Pustaka', 'PTK', 'R&D', 'Mixed Method', 'Hukum Normatif', 'Hukum Empiris', 'Eksperimen / Rekayasa'];
const GAYA = ['APA 7th', 'Harvard', 'IEEE', 'Vancouver', 'MLA 9th', 'Chicago', 'Chicago Fullnote (Footnote)', 'Turabian (Footnote)'];
const BAHASA = ['Indonesia', 'Inggris (English)', 'Melayu', 'Arab'];

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
  const [gaya, setGaya] = useState('APA 7th');
  const [bahasa, setBahasa] = useState('Indonesia');
  const [tahun, setTahun] = useState('');
  const [asal, setAsal] = useState('semua');
  const [dataAwal, setDataAwal] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const j = new URLSearchParams(window.location.search).get('jenis');
      if (j === 'tesis' || j === 'disertasi' || j === 'skripsi') setJenis(j);
    } catch { /* abaikan */ }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const r = await apiPost('/api/projects', {
        judul, jenis, metode, tahap,
        identitas: { nama, nim, kampus, jurusan, fakultas },
        citation_style: gaya, language: bahasa,
        min_year: tahun ? parseInt(tahun, 10) : null,
        ref_origin: asal, initial_data: dataAwal,
      });
      router.push(`/dashboard/studio/${r.item.id}`);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
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
          <textarea rows={3} required value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Ketik judul atau gunakan Brainstorming Judul" className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-sm text-text-primary" />
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary">Jenis dan metode penelitian</h3>
          <div>
            <label className="font-bold text-text-primary text-sm block mb-2">Jenis penelitian</label>
            <div className="grid grid-cols-2 gap-3">
              {[['skripsi', 'Skripsi (S1)'], ['tesis', 'Tesis (S2)'], ['disertasi', 'Disertasi (S3)']].map(([v, l]) => (
                <div key={v} onClick={() => setJenis(v)} className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer ${jenis === v ? 'border-2 border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base'}`}>
                  <span className="text-sm text-text-primary">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="font-bold text-text-primary text-sm block mb-2">Metode penelitian</label>
            <div className="grid grid-cols-2 gap-3">
              {METODE.map((m) => (
                <div key={m} onClick={() => setMetode(m)} className={`border rounded-lg p-3 cursor-pointer ${metode === m ? 'border-2 border-brand-primary bg-brand-primary/10' : 'border-border-strong bg-bg-base hover:border-text-secondary'}`}>
                  <span className="text-sm text-text-primary">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
          <h3 className="font-bold text-text-primary">Tahap pengerjaan</h3>
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
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary text-sm">Identitas mahasiswa dan kampus</h3>
          <div className="grid grid-cols-2 gap-4">
            <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <input value={nim} onChange={(e) => setNim(e.target.value)} placeholder="NIM" className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input value={kampus} onChange={(e) => setKampus(e.target.value)} placeholder="Nama kampus" className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <input value={jurusan} onChange={(e) => setJurusan(e.target.value)} placeholder="Jurusan" className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <input value={fakultas} onChange={(e) => setFakultas(e.target.value)} placeholder="Fakultas" className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary text-sm">Data awal penelitian <span className="text-[10px] text-text-muted font-normal">OPSIONAL</span></h3>
          <textarea rows={3} value={dataAwal} onChange={(e) => setDataAwal(e.target.value)} placeholder="Contoh: 62% siswa belum memanfaatkan e-library (survei 2024)." className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-text-primary text-sm">Pengaturan sitasi</h3>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Tahun terbit minimum (jurnal)</label>
              <select value={tahun} onChange={(e) => setTahun(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                <option value="">Semua tahun</option>
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Asal referensi</label>
              <select value={asal} onChange={(e) => setAsal(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                <option value="semua">Indonesia & Internasional</option>
                <option value="indonesia">Indonesia</option>
                <option value="internasional">Internasional</option>
              </select>
            </div>
          </div>
        </div>

        {err && <p className="text-sm text-accent-red">{err}</p>}
        <button disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Lanjut Generate Skripsi'}
        </button>
      </form>
    </div>
  );
}
