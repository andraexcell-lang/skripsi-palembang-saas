'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COMMANDS = [
  { cmd: '/judul', desc: 'Brainstorming 10 judul', href: '/dashboard/brainstorming' },
  { cmd: '/kelayakan', desc: 'Cek kelayakan judul (gratis)', href: '/dashboard/kelayakan' },
  { cmd: '/novelty', desc: 'Temukan novelty', href: '/dashboard/novelty' },
  { cmd: '/skripsi', desc: 'Buat proyek skripsi', href: '/dashboard/proyek/buat' },
  { cmd: '/artikel-sinta', desc: 'Buat artikel Sinta', href: '/dashboard/artikel-sinta' },
  { cmd: '/artikel-scopus', desc: 'Buat artikel Scopus', href: '/dashboard/artikel-scopus' },
  { cmd: '/parafrase', desc: 'Parafrase akademik', href: '/dashboard/parafrase' },
  { cmd: '/ppt', desc: 'Generate PPT', href: '/dashboard/generate-ppt' },
  { cmd: '/sidang', desc: 'Simulasi sidang', href: '/dashboard/simulasi' },
  { cmd: '/plagiasi', desc: 'Cek kemiripan', href: '/dashboard/plagiasi' },
  { cmd: '/olah-data', desc: 'Olah data SPSS/kualitatif', href: '/dashboard/olah-data' },
  { cmd: '/billing', desc: 'Pilih paket / top-up', href: '/dashboard/billing' },
];

export default function DashboardSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const open = q.startsWith('/');
  const list = COMMANDS.filter((c) => c.cmd.startsWith(q.toLowerCase()) || c.desc.toLowerCase().includes(q.slice(1).toLowerCase()));

  function buka() {
    const t = q.trim();
    if (open && list.length === 1) { router.push(list[0].href); return; }
    router.push(t ? `/dashboard/asisten?q=${encodeURIComponent(t)}` : '/dashboard/asisten');
  }

  return (
    <div className="cursor-text rounded-2xl border border-border-subtle bg-bg-surface shadow-sm transition-shadow hover:shadow-md focus-within:border-brand-primary/40 focus-within:shadow-md p-2.5">
      <div className="flex items-center gap-3">
        <span className="grid size-5 shrink-0 place-items-center text-brand-primary" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </span>

        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') buka(); }}
            aria-label="Buka AI Skripsi Palembang"
            className="w-full bg-transparent text-text-primary outline-none focus-visible:ring-0 text-sm py-1"
          />
          {!q && (
            <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-text-muted text-sm">
              <span className="truncate sm:hidden">Tanya AI, atau ketik / untuk mulai…</span>
              <span className="hidden truncate sm:inline">Tanya AI Skripsi Palembang, atau ketik / untuk mulai membuat proyek…</span>
            </span>
          )}

          {open && (
            <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-bg-surface border border-border-subtle rounded-xl shadow-xl overflow-hidden">
              {list.length === 0 && <p className="p-4 text-sm text-text-muted">Tidak ada perintah cocok.</p>}
              {list.map((c) => (
                <Link key={c.cmd} href={c.href} className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface-hover">
                  <span className="text-brand-primary font-bold text-sm">{c.cmd}</span>
                  <span className="text-text-secondary text-sm">{c.desc}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={buka}
          aria-label="Buka AI Skripsi Palembang"
          className="flex shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition-opacity hover:opacity-90 focus-visible:outline-none size-9"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
        </button>
      </div>
    </div>
  );
}
