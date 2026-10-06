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
  return (
    <span className="text-xs font-semibold text-accent-red border border-accent-red/20 bg-accent-red/10 px-3 py-1 rounded-full flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
      {credits === null ? '…' : `${credits} kredit`}
    </span>
  );
}
