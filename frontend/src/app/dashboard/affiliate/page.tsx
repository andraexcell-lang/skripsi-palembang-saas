'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function AffiliatePage() {
  const [data, setData] = useState<{ code: string; referrals: number; commission: number; items: any[] } | null>(null);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiGet('/api/affiliate/me').then(setData).catch((e) => setErr(e.message));
  }, []);

  const link = data ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${data.code}` : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* abaikan */ }
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Program Affiliate</h1>
          <p className="text-text-secondary text-sm">Komisi <strong className="text-text-primary">10%</strong> dari setiap transaksi referral yang lunas. Pencairan manual via admin.</p>
        </div>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
          <div className="text-[10px] font-bold text-text-muted uppercase">Link referral kamu</div>
          <div className="text-sm font-bold text-brand-primary break-all">{link || 'Memuat...'}</div>
          <button onClick={copy} disabled={!link} className="bg-brand-primary text-white px-5 py-2 rounded-lg text-xs font-bold disabled:opacity-50">{copied ? 'Tersalin!' : 'Salin Link'}</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <div className="text-[10px] font-bold text-text-muted uppercase">Teman bergabung</div>
            <div className="text-3xl font-bold text-text-primary">{data?.referrals ?? '—'}</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <div className="text-[10px] font-bold text-text-muted uppercase">Komisi (Rp)</div>
            <div className="text-3xl font-bold text-text-primary">{data ? data.commission.toLocaleString('id-ID') : '—'}</div>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <h3 className="font-bold text-text-primary mb-3">Riwayat Komisi</h3>
          {(data?.items.length || 0) === 0 && <p className="text-sm text-text-muted">Belum ada komisi.</p>}
          {(data?.items || []).map((c: any, i: number) => (
            <div key={i} className="text-xs text-text-secondary flex justify-between border-t border-border-subtle py-2">
              <span>{c.status}</span><span className="text-green-500 font-bold">+Rp {c.amount.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
