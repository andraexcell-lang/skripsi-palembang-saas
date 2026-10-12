'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { apiPost } from '@/lib/api';

export default function HubungkanPage() {
  const [kode, setKode] = useState('');
  const [logged, setLogged] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setKode(new URLSearchParams(window.location.search).get('kode') || '');
    } catch { /* abaikan */ }
    supabase.auth.getUser().then(({ data }) => setLogged(!!data.user));
  }, []);

  async function approve() {
    setLoading(true); setErr('');
    try {
      await apiPost('/api/word/pair/approve', { code: kode });
      setDone(true);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-base p-4">
        <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-8 text-center space-y-3">
          <div className="text-green-500 text-4xl">✓</div>
          <h1 className="text-xl font-bold text-text-primary">Word berhasil terhubung 🎉</h1>
          <p className="text-sm text-text-secondary">Kembali ke Microsoft Word — panel akan aktif dalam beberapa detik. Kamu bisa menutup halaman ini.</p>
          <p className="text-xs text-text-muted">Perangkat ini kini punya akses ke proyek &amp; kredit akunmu. Kamu bisa memutusnya kapan saja lewat <Link href="/dashboard/pengaturan" className="text-brand-primary">Pengaturan → Kunci API</Link>.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-8 space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Hubungkan Microsoft Word</h1>
        <p className="text-sm text-text-secondary">Cocokkan kode yang tampil di panel plugin Word.</p>

        {/* Banner Unduh Plugin */}
        <div className="rounded-lg border border-border-subtle bg-bg-base/70 p-3.5 text-xs text-text-secondary flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="font-semibold text-text-primary">Belum menginstall plugin?</p>
            <p className="text-[11px] text-text-muted">Unduh installer resmi untuk Microsoft Word</p>
          </div>
          <a
            href="/download/SkripsiPalembangSetup-latest.exe"
            download
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary-hover transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Unduh (.exe)
          </a>
        </div>

        <div>
          <label htmlFor="hub-kode" className="text-sm font-semibold text-text-primary">Kode dari plugin</label>
          <input id="hub-kode" value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" className="mt-1 w-full text-center tracking-widest font-bold bg-bg-base border border-border-strong rounded-lg p-3 text-text-primary" />
        </div>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        {logged === false && (
          <p className="text-sm text-text-secondary">Kamu belum login. <Link href={`/login?next=/hubungkan?kode=${encodeURIComponent(kode)}`} className="text-brand-primary font-semibold">Masuk dulu</Link> lalu setujui.</p>
        )}
        <button onClick={approve} disabled={loading || !kode || logged === false} className="w-full bg-brand-primary text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50">
          {loading ? 'Memproses...' : 'Setujui & Hubungkan'}
        </button>
        <p className="text-xs text-text-muted">Dengan menyetujui, plugin Word di perangkat itu bisa membaca proyekmu dan memakai kreditmu untuk generate. Jangan setujui kode yang tidak kamu minta sendiri.</p>

        <div className="border-t border-border-subtle pt-3 text-center">
          <a
            href="/download/SkripsiPalembangSetup-latest.exe"
            download
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Belum menginstall plugin? Unduh Installer Plugin Word (.exe)
          </a>
        </div>
      </div>
    </main>
  );
}
