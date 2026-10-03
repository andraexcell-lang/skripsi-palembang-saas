'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function RiwayatKreditPage() {
  const [bal, setBal] = useState<{ credits: number; plan: string } | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setBal(await apiGet('/api/credits/balance'));
        const l = await apiGet('/api/credits/ledger');
        setItems(l.items);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Riwayat Kredit</h1>
          <p className="text-text-secondary text-sm">Sisa kredit dan rincian setiap aktivitas yang memakainya.</p>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <div className="text-[10px] font-bold text-text-muted uppercase mb-1">SISA KREDIT</div>
          <div className="text-4xl font-bold text-text-primary mb-1">{bal ? bal.credits : '—'}</div>
          <div className="text-sm text-text-secondary">{bal ? `Paket: ${bal.plan}` : err || 'Login untuk melihat saldo.'}</div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <h3 className="font-bold text-text-primary mb-1">Rincian Aktivitas</h3>
          <p className="text-xs text-text-secondary mb-4">Kredit dipotong SEKALI per bab.</p>
          {items.length === 0 && <p className="text-text-muted text-sm">Belum ada aktivitas kredit.</p>}
          {items.map((it: any) => (
            <div key={it.id} className="text-xs text-text-secondary flex justify-between border-t border-border-subtle py-2">
              <span>{it.ref}</span><span className={it.amount < 0 ? 'text-accent-red' : 'text-green-500'}>{it.amount > 0 ? '+' : ''}{it.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
