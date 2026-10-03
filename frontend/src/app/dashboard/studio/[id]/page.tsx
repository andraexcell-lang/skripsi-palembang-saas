'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, isInsufficientCredits } from '@/lib/api';

const BABS = [
  { id: 'bab1', label: 'Bab I: Pendahuluan' },
  { id: 'bab2', label: 'Bab II: Tinjauan Pustaka' },
  { id: 'bab3', label: 'Bab III: Metodologi' },
  { id: 'bab4', label: 'Bab IV: Hasil & Pembahasan' },
  { id: 'bab5', label: 'Bab V: Penutup' },
];

export default function StudioWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proyek, setProyek] = useState<any>(null);
  const [active, setActive] = useState('bab1');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [needsTopup, setNeedsTopup] = useState(false);

  async function load() {
    try {
      const r = await apiGet(`/api/projects/${id}`);
      setProyek(r.item);
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, [id]);

  async function generate() {
    setLoading(true); setErr(''); setNeedsTopup(false);
    try {
      const r = await apiPost(`/api/projects/${id}/generate-bab`, { bab: active });
      setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), [active]: r.text } }));
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
    }
    setLoading(false);
  }

  function downloadWord() {
    const label = BABS.find((b) => b.id === active)?.label || active;
    const ident = proyek?.identitas || {};
    const logoImg = ident.logo ? `<img src="${ident.logo}" width="90"/><br/>` : '';
    const cover = (ident.nama || ident.kampus || proyek?.judul)
      ? `<div style="text-align:center">${logoImg}<h2>${String(proyek?.judul || '').replace(/</g, '&lt;')}</h2><br/><p>${String(ident.nama || '').replace(/</g, '&lt;')}</p><p>NIM: ${String(ident.nim || '').replace(/</g, '&lt;')}</p><p>${String(ident.kampus || '').replace(/</g, '&lt;')} — ${String(ident.jurusan || '').replace(/</g, '&lt;')} — ${String(ident.fakultas || '').replace(/</g, '&lt;')}</p><br style="mso-special-character:line-break;page-break-before:always"/></div>`
      : '';
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${label}</title></head><body>${cover}<h1>${label}</h1>${String(text).split('\n').map((p) => `<p>${p.replace(/</g, '&lt;')}</p>`).join('')}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${active}-${String(id).slice(0, 8)}.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const text = proyek?.content?.[active] || '';
  return (
    <div className="flex h-full bg-bg-base">
      <div className="w-56 border-r border-border-subtle p-4 hidden lg:flex flex-col gap-1">
        {BABS.map((b) => (
          <button key={b.id} onClick={() => setActive(b.id)} className={`text-left px-3 py-2 rounded-lg text-sm ${active === b.id ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-text-secondary'}`}>
            {b.label} {proyek?.content?.[b.id] ? '✓' : ''}
          </button>
        ))}
      </div>
      <div className="flex-1 p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-text-primary">{proyek?.judul || 'Memuat...'}</h1>
        <p className="text-xs text-text-secondary">{proyek?.jenis} · {proyek?.metode} · 10 kredit/bab</p>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        {needsTopup && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm text-text-primary flex items-center justify-between gap-3">
            <span>Kredit habis. Top-up untuk lanjut generate.</span>
            <Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap">Pilih Paket →</Link>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={generate} disabled={loading} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
            {loading ? 'Menggenerate...' : `Generate ${BABS.find((b) => b.id === active)?.label}`}
          </button>
          {text && (
            <button onClick={downloadWord} className="border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover">
              Unduh Word
            </button>
          )}
        </div>
        {text ? <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm text-text-primary whitespace-pre-wrap">{text}</div>
          : <p className="text-sm text-text-muted">Belum ada isi untuk bab ini. Klik generate (10 kredit).</p>}
      </div>
    </div>
  );
}
