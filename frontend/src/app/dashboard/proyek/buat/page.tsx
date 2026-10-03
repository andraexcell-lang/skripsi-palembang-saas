'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

export default function BuatSkripsiPage() {
  const [judul, setJudul] = useState('');
  const [jenis, setJenis] = useState('skripsi');

  useEffect(() => {
    try {
      const j = new URLSearchParams(window.location.search).get('jenis');
      if (j === 'tesis' || j === 'disertasi' || j === 'skripsi') setJenis(j);
    } catch { /* abaikan */ }
  }, []);  const [metode, setMetode] = useState('Kualitatif');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [kampus, setKampus] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const r = await apiPost('/api/projects', { judul, jenis, metode, tahap: 'full', identitas: { nama, nim, kampus } });
      router.push(`/dashboard/studio/${r.item.id}`);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <form onSubmit={submit} className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-5 overflow-y-auto pb-24">
        <h1 className="text-xl font-bold text-text-primary">Buat Proyek Skripsi</h1>
        <div>
          <label className="font-bold text-text-primary text-sm">Judul penelitian (min 10 karakter)</label>
          <textarea rows={3} required value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Contoh: Pengaruh motivasi kerja terhadap kinerja pegawai..." className="mt-2 w-full bg-bg-surface border border-border-strong rounded-lg p-4 text-sm text-text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-text-primary text-sm">Jenis</label>
            <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="mt-2 w-full bg-bg-surface border border-border-strong rounded-lg p-3 text-sm text-text-primary">
              <option value="skripsi">Skripsi (S1)</option>
              <option value="tesis">Tesis (S2)</option>
              <option value="disertasi">Disertasi (S3)</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-text-primary text-sm">Metode</label>
            <select value={metode} onChange={(e) => setMetode(e.target.value)} className="mt-2 w-full bg-bg-surface border border-border-strong rounded-lg p-3 text-sm text-text-primary">
              {['Kualitatif', 'Kuantitatif', 'Mixed Method', 'Studi Pustaka', 'PTK', 'R&D'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" className="bg-bg-surface border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          <input value={nim} onChange={(e) => setNim(e.target.value)} placeholder="NIM" className="bg-bg-surface border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          <input value={kampus} onChange={(e) => setKampus(e.target.value)} placeholder="Kampus" className="bg-bg-surface border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        <button disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Buat Proyek & Buka Studio'}
        </button>
      </form>
    </div>
  );
}
