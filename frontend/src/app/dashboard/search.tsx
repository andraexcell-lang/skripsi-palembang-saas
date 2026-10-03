'use client';
import { useState } from 'react';
import Link from 'next/link';

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
  const open = q.startsWith('/');
  const list = COMMANDS.filter((c) => c.cmd.startsWith(q.toLowerCase()) || c.desc.toLowerCase().includes(q.slice(1).toLowerCase()));

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <div className="w-5 h-5 bg-brand-primary rounded-full opacity-80 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
        </div>
      </div>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tanya AI Skripsi Palembang, atau ketik / untuk mulai membuat proyek..."
        className="w-full bg-bg-surface border border-border-subtle rounded-full py-4 pl-12 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
      />
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-bg-surface border border-border-subtle rounded-xl shadow-xl overflow-hidden">
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
  );
}
