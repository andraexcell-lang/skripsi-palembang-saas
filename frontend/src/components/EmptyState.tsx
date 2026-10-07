import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * Empty state paritas mantrariset (laporan analisis §4):
 * "ikon besar slate-300 + teks slate-400 + tombol biru".
 * Path ikon sengaja disamakan dengan ikon sidebar (dashboard/layout.tsx)
 * agar gaya stroke konsisten antar halaman.
 */

export function IcFolder({ className = 'size-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IcLab({ className = 'size-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v7.31" />
      <path d="M14 9.3V1.99" />
      <path d="M8.5 2h7" />
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
      <path d="M5.52 16h12.96" />
    </svg>
  );
}

export function IcDok({ className = 'size-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

export function IcChat({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function EmptyState({
  ikon,
  teks,
  aksi,
  href,
  onClick,
}: {
  ikon: ReactNode;
  teks: string;
  aksi?: string;
  href?: string;
  onClick?: () => void;
}) {
  const gayaTombol =
    'rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover';
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <span className="text-[#cbd5e1] dark:text-[#cbd5e1]">{ikon}</span>
      <p className="max-w-md text-sm text-text-muted">{teks}</p>
      {aksi &&
        (href ? (
          <Link href={href} className={gayaTombol}>
            {aksi}
          </Link>
        ) : (
          <button onClick={onClick} className={gayaTombol}>
            {aksi}
          </button>
        ))}
    </div>
  );
}
