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
      <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
        <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-8 text-center space-y-3">
          <div className="text-green-500 text-4xl">✓</div>
          <h1 className="text-xl font-bold text-text-primary">Word berhasil terhubung 🎉</h1>
          <p className="text-sm text-text-secondary">Kembali ke Microsoft Word — panel akan aktif dalam beberapa detik. Kamu bisa menutup halaman ini.</p>
          <p className="text-xs text-text-muted">Perangkat ini kini punya akses ke proyek &amp; kredit akunmu. Kamu bisa memutusnya kapan saja lewat <Link href="/dashboard/pengaturan" className="text-brand-primary">Pengaturan → Kunci API</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-8 space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Hubungkan Microsoft Word</h1>
        <p className="text-sm text-text-secondary">Cocokkan kode yang tampil di panel plugin Word.</p>
        <div>
          <label className="text-sm font-semibold text-text-primary">Kode dari plugin</label>
          <input value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" className="mt-1 w-full text-center tracking-widest font-bold bg-bg-base border border-border-strong rounded-lg p-3 text-text-primary" />
        </div>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        {logged === false && (
          <p className="text-sm text-text-secondary">Kamu belum login. <Link href={`/login?next=/hubungkan?kode=${encodeURIComponent(kode)}`} className="text-brand-primary font-semibold">Masuk dulu</Link> lalu setujui.</p>
        )}
        <button onClick={approve} disabled={loading || !kode || logged === false} className="w-full bg-brand-primary text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50">
          {loading ? 'Memproses...' : 'Setujui & Hubungkan'}
        </button>
        <p className="text-xs text-text-muted">Dengan menyetujui, plugin Word di perangkat itu bisa membaca proyekmu dan memakai kreditmu untuk generate. Jangan setujui kode yang tidak kamu minta sendiri.</p>
      </div>
    </div>
  );
}
