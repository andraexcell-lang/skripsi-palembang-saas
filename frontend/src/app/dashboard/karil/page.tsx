'use client';
import { useState } from 'react';
import Link from 'next/link';
import { apiPost, isInsufficientCredits } from '@/lib/api';

export default function KarilPage() {
  const [judul, setJudul] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState('');
  const [err, setErr] = useState('');
  const [needsTopup, setNeedsTopup] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setHasil(''); setErr(''); setNeedsTopup(false);
    try {
      const p = await apiPost('/api/projects', { judul, jenis: 'karil', metode: 'Studi Pustaka', tahap: 'full' });
      const r = await apiPost(`/api/projects/${p.item.id}/generate-karil`, {});
      setHasil(r.text);
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      setErr(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-4 overflow-y-auto pb-24">
        <h1 className="text-2xl font-bold text-text-primary">Karil UT</h1>
        <p className="text-text-secondary text-sm">Karya Ilmiah Universitas Terbuka · MKWI4560. Sistematika: Judul · Identitas · Abstrak & kata kunci · Pendahuluan · Metode · Hasil dan Pembahasan · Simpulan dan Saran · Daftar Pustaka. TNR 12, spasi 1,5, A4, 10–20 halaman, min 10 sumber (5 jurnal 5 tahun terakhir), APA. 15 kredit.</p>
        <form onSubmit={generate} className="space-y-3">
          <textarea rows={3} required value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul Karil..." className="w-full bg-bg-surface border border-border-strong rounded-lg p-4 text-sm text-text-primary" />
          {err && <p className="text-sm text-accent-red">{err}</p>}
          {needsTopup && <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 text-sm flex justify-between items-center"><span>Kredit habis.</span><Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Pilih Paket →</Link></div>}
          <button disabled={loading} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">{loading ? 'Menggenerate...' : 'Buat Karil (15 kredit)'}</button>
        </form>
        {hasil && <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm whitespace-pre-wrap">{hasil}</div>}
      </div>
    </div>
  );
}
