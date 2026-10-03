'use client';
import { useState } from 'react';
import Link from 'next/link';
import { apiPost, isInsufficientCredits } from '@/lib/api';

export default function ArtikelScopusPage() {
  const [judul, setJudul] = useState('');
  const [metode, setMetode] = useState('Quantitative');
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState('');
  const [err, setErr] = useState('');
  const [needsTopup, setNeedsTopup] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setHasil(''); setErr(''); setNeedsTopup(false);
    try {
      const p = await apiPost('/api/projects', { judul, jenis: 'artikel_scopus', metode, tahap: 'full' });
      const r = await apiPost(`/api/projects/${p.item.id}/generate-artikel`, {});
      setHasil(r.text);
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      setErr(e.message);
    }
    setLoading(false);
  }

  function downloadWord() {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body><h1>${judul.replace(/</g, '&lt;')}</h1>${hasil.split('\n').map((x) => `<p>${x.replace(/</g, '&lt;')}</p>`).join('')}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'artikel-scopus.doc';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <form onSubmit={generate} className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-4 overflow-y-auto pb-24">
        <h1 className="text-2xl font-bold text-text-primary">Buat Artikel Scopus</h1>
        <p className="text-text-secondary text-sm">Artikel berbahasa Inggris siap submit ke jurnal Scopus Q1–Q4. 15 kredit/artikel.</p>
        <textarea rows={3} required value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Article title..." className="w-full bg-bg-surface border border-border-strong rounded-lg p-4 text-sm text-text-primary" />
        <select value={metode} onChange={(e) => setMetode(e.target.value)} className="bg-bg-surface border border-border-strong rounded-lg p-3 text-sm text-text-primary">
          {['Quantitative', 'Qualitative', 'Mixed Method', 'SLR'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        {needsTopup && <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm flex justify-between items-center"><span>Kredit habis.</span><Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Pilih Paket →</Link></div>}
        <div className="flex gap-3">
          <button disabled={loading} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">{loading ? 'Generating...' : 'Generate Article (15 credits)'}</button>
          {hasil && <button type="button" onClick={downloadWord} className="border border-border-strong px-5 py-2.5 rounded-lg text-sm font-bold">Download Word</button>}
        </div>
        {hasil && <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm whitespace-pre-wrap">{hasil}</div>}
      </form>
    </div>
  );
}
