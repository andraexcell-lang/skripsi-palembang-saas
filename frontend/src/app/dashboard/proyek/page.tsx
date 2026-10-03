'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';

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
        {items.length === 0 && !err && <p className="text-sm text-text-muted">Belum ada proyek. Buat yang pertama.</p>}
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
