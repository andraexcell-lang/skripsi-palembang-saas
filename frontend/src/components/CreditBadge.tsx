'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

export default function CreditBadge() {
  const [credits, setCredits] = useState<number | null>(null);
  useEffect(() => {
    const ambil = () => apiGet('/api/credits/balance').then((b) => setCredits(b.credits)).catch(() => {});
    ambil();
    // Jaga tetap akurat setelah generate/tulis ulang tanpa reload halaman
    const id = setInterval(ambil, 30000);
    const onUbah = () => ambil();
    window.addEventListener('sp:balance', onUbah);
    return () => { clearInterval(id); window.removeEventListener('sp:balance', onUbah); };
  }, []);
  // Paritas mantrariset: chip 88×28, radius 6px; merah (red-600) hanya saat saldo 0
  const habis = credits === 0;
  return (
    <span
      className="inline-flex h-7 min-w-[88px] items-center justify-center gap-1 px-3 text-xs font-semibold"
      style={{
        borderRadius: 'var(--radius-sm, 6px)',
        backgroundColor: habis ? 'var(--danger-light)' : 'var(--bg-surface-hover)',
        color: habis ? 'var(--danger)' : 'var(--text-secondary)',
        boxShadow: habis ? 'none' : 'inset 0 0 0 1px var(--border-subtle)',
      }}
      title={habis ? 'Kredit habis — isi ulang di Billing' : credits === null ? 'Memuat kredit…' : `${credits} kredit tersisa`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
      {credits === null ? '…' : `${credits} kredit`}
    </span>
  );
}
