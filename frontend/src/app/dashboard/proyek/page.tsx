'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import EmptyState, { IcFolder } from '@/components/EmptyState';

// Grid 8 kartu paritas §3.2 (Proyek Penelitian): Buat Skripsi/Tesis/Disertasi,
// Artikel Sinta/Scopus, Ubah Skripsi → Artikel, Tuton UT, Karil UT.
const START: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: 'Buat Skripsi', href: '/dashboard/proyek/buat?jenis=skripsi', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> },
  { label: 'Buat Tesis', href: '/dashboard/proyek/buat?jenis=tesis', icon: <><path d="M22 10L12 5 2 10l10 5 10-5z"></path><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"></path></> },
  { label: 'Buat Disertasi', href: '/dashboard/proyek/buat?jenis=disertasi', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></> },
  { label: 'Artikel Sinta', href: '/dashboard/artikel-sinta', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></> },
  { label: 'Artikel Scopus', href: '/dashboard/artikel-scopus', icon: <><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></> },
  { label: 'Ubah Skripsi → Artikel', href: '/dashboard/proyek/buat?jenis=artikel', icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></> },
  { label: 'Tuton UT', href: '/dashboard/tuton', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></> },
  { label: 'Karil UT', href: '/dashboard/karil', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> },
];

export default function ProyekListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    apiGet('/api/projects').then((r) => setItems(r.items)).catch((e) => setErr(e.message));
  }, []);
  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Proyek Penelitian</h1>
            <p className="text-text-secondary text-sm">Buat skripsi, tesis, disertasi, atau artikel jurnal.</p>
          </div>
          <Link href="/dashboard/proyek/buat" className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold">+ Buat Proyek</Link>
        </div>
        {err && <p className="text-sm text-accent-red">{err}</p>}

        {/* Grid 8 kartu paritas §3.2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {START.map((s) => (
            <Link key={s.label} href={s.href} className="flex items-center gap-3 bg-bg-surface border border-border-subtle rounded-xl p-4 hover:border-brand-primary transition-colors group">
              <span className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{s.icon}</svg>
              </span>
              <span className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">{s.label}</span>
              <svg className="ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>
          ))}
        </div>

        {items.length === 0 && !err && (
          <EmptyState ikon={<IcFolder />} teks="Belum ada proyek. Pilih salah satu di atas untuk mulai." />
        )}
        {items.map((p: any) => (
          <Link key={p.id} href={`/dashboard/studio/${p.id}`} className="block bg-bg-surface border border-border-subtle rounded-xl p-4 hover:border-brand-primary">
            <div className="font-bold text-text-primary text-sm">{p.judul}</div>
            <div className="text-xs text-text-secondary mt-1">{p.jenis} · {p.metode} · {Object.keys(p.content || {}).length}/5 bab</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
