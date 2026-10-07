'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default function AffiliatePage() {
  const [data, setData] = useState<{ code: string; referrals: number; commission: number; items: any[] } | null>(null);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  // Paritas §3.21: modal "Berlangganan dulu, yuk!" untuk yang belum pernah berlangganan
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    apiGet('/api/affiliate/me').then(setData).catch((e) => setErr(e.message));
    // Pemicu: belum pernah ada transaksi lunas
    apiGet('/api/billing/transactions')
      .then((t) => {
        const pernahBayar = (t.items || []).some((x: any) => x.status === 'paid');
        if (!pernahBayar) setShowModal(true);
      })
      .catch(() => { /* abaikan */ });
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
          <p className="text-text-secondary text-sm">Ajak orang lain berlangganan dan dapatkan komisi. Komisi saat ini: <strong className="text-text-primary">10% per transaksi referral</strong>. Pencairan manual via admin.</p>
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

        {/* Modal paritas §3.21: ikon gift + "Berlangganan dulu, yuk!" + tombol biru + × */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="aff-modal-title">
            <div className="relative w-full max-w-md rounded-2xl bg-bg-surface p-8 text-center shadow-xl">
              <button onClick={() => setShowModal(false)} aria-label="Tutup" className="absolute right-4 top-4 text-text-muted hover:text-text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
              </div>
              <h2 id="aff-modal-title" className="text-lg font-bold text-text-primary">Berlangganan dulu, yuk!</h2>
              <p className="mt-2 text-sm text-text-secondary">Program affiliate hanya untuk pengguna yang pernah berlangganan. Pilih paket dan mulai dapatkan komisi dari setiap referal.</p>
              <Link href="/dashboard/billing" className="mt-5 block w-full rounded-lg bg-brand-primary py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover">Lihat Paket Langganan</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
