'use client';
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import UserChip from "@/components/UserChip";
import ThemeToggle from "@/components/ThemeToggle";
import CreditBadge from "@/components/CreditBadge";
import { IcChat } from "@/components/EmptyState";
import { useFitur, terapkanFlags, fiturNyala } from "@/lib/fitur";
import { apiGet } from "@/lib/api";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const flags = useFitur();
  const [isAdmin, setIsAdmin] = useState(false);

  // Sembunyikan menu yang dimatikan admin (tab Fitur di Dashboard Admin):
  // setiap menu punya data-fitur="<slug>" → flags[slug] === false → class 'hidden'.
  useEffect(() => { terapkanFlags(flags); }, [flags, pathname]);

  // Tautan "Dashboard Admin" hanya untuk akun plan admin (backend tetap penjaga utama)
  useEffect(() => {
    apiGet('/api/credits/balance').then((b: any) => setIsAdmin(b?.plan === 'admin')).catch(() => {});
  }, []);

  // Penanda halaman aktif di sidebar (paritas referensi):
  // sorot menu sesuai route yang dibuka; hanya menu nav (di dalam .custom-scrollbar)
  // yang disorot — logo & chip kredit dikecualikan lewat scoping selektor ini.
  useEffect(() => {
    if (!pathname) return;
    const nav = document.querySelector('.custom-scrollbar');
    if (!nav) return;
    const tautan = nav.querySelectorAll<HTMLAnchorElement>('a[href^="/dashboard"]');
    tautan.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const aktif =
        href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname === href ||
            pathname.startsWith(href + '/') ||
            (href === '/dashboard/proyek' && pathname.startsWith('/dashboard/studio'));
      a.classList.toggle('bg-brand-primary/10', aktif);
      a.classList.toggle('text-brand-primary', aktif);
      a.classList.toggle('font-medium', aktif);
      a.classList.toggle('text-text-secondary', !aktif);
      a.classList.toggle('hover:text-text-primary', !aktif);
      a.classList.toggle('hover:bg-bg-surface-hover', !aktif);
      if (aktif) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }, [pathname]);

  // Tutup drawer saat Escape / pindah ke lebar desktop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans flex-col lg:flex-row">
      {/* Header sempit (mobile/tablet) — paritas referensi: logo + kredit + hamburger */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle bg-bg-surface px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-brand-primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </span>
          <span className="font-bold text-base tracking-wide">Skripsi<span className="text-brand-primary">Palembang</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/kredit" className="inline-flex items-center py-1.5 -my-1.5" title="Sisa kredit AI">
            <CreditBadge />
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="sidebar-utama"
            onClick={() => setOpen((v) => !v)}
            className="p-2 -m-1 text-text-secondary hover:text-text-primary"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Overlay drawer (mobile) */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`${open ? 'block' : 'hidden'} fixed inset-0 z-30 bg-black/40 lg:hidden`}
      />

      {/* Sidebar — off-canvas di <lg, stasioner di ≥lg (paritas referensi) */}
      <aside
        id="sidebar-utama"
        onClick={() => setOpen(false)}
        className={`${open ? 'flex translate-x-0' : 'hidden -translate-x-full'} w-64 shrink-0 bg-bg-surface border-r border-border-subtle flex-col justify-between h-full transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-40 lg:static lg:z-auto lg:translate-x-0 lg:flex`}
      >

        {/* Top Section */}
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-brand-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span className="font-bold text-lg tracking-wide">Skripsi<span className="text-brand-primary">Palembang</span></span>
          </Link>
          <button className="text-text-secondary hover:text-text-primary">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="15 3 15 21"></polyline><polyline points="9 9 12 12 9 15"></polyline></svg>
          </button>
        </div>

        {/* Kredit — chip seperti referensi (di sidebar) */}
        <div className="px-4 pt-3 shrink-0">
          <Link href="/dashboard/kredit" className="flex w-full items-center justify-center">
            <CreditBadge />
          </Link>
        </div>

        {/* Scrollable Nav Menu */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-primary/10 text-brand-primary font-medium text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Dashboard
          </Link>
          <Link href="/dashboard/asisten" data-fitur="asisten" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            AI Skripsi Palembang
          </Link>

          <div className="pt-5 pb-2 px-3">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">PENELITIAN</p>
          </div>

          <Link href="/dashboard/proyek" data-fitur="proyek" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Proyek Penelitian
          </Link>
          <Link href="/dashboard/brainstorming" data-fitur="brainstorming" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            Brainstorming Judul
          </Link>
          <Link href="/dashboard/kelayakan" data-fitur="kelayakan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Kelayakan Judul
          </Link>
          <Link href="/dashboard/novelty" data-fitur="novelty" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Temukan Novelty
          </Link>
          <Link href="/dashboard/artikel" data-fitur="artikel" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Cari Artikel
          </Link>
          <Link href="/dashboard/artikel-sinta" data-fitur="artikel-sinta" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Artikel Sinta
          </Link>
          <Link href="/dashboard/artikel-scopus" data-fitur="artikel-scopus" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            Artikel Scopus
          </Link>
          <Link href="/dashboard/olah-data" data-fitur="olah-data" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Olah Data
          </Link>
          <Link href="/dashboard/generate-ppt" data-fitur="generate-ppt" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Generate PPT
          </Link>
          <Link href="/dashboard/lanjutkan" data-fitur="lanjutkan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Lanjutkan Skripsi
          </Link>

          <div className="pt-5 pb-2 px-3">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">UJI & REVISI</p>
          </div>

          <Link href="/dashboard/simulasi" data-fitur="simulasi" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            Simulasi Sidang
          </Link>
          <Link href="/dashboard/plagiasi" data-fitur="plagiasi" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
            Cek Plagiasi
          </Link>
          <Link href="/dashboard/lab-revisi" data-fitur="lab-revisi" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>
            Lab Revisi
          </Link>
          <Link href="/dashboard/rapihkan" data-fitur="rapihkan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            Rapihkan Skripsi
          </Link>
          <Link href="/dashboard/parafrase" data-fitur="parafrase" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
            Parafrase
          </Link>
          <Link href="/dashboard/ai-writer" data-fitur="ai-writer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            AI Writer
          </Link>
          <Link href="/dashboard/karil" data-fitur="karil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Karil UT
          </Link>
          <Link href="/dashboard/tuton" data-fitur="tuton" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            Tuton UT
          </Link>

          <div className="pt-5 pb-2 px-3" data-fitur="tutorial">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">PENDAMPINGAN</p>
          </div>

          <Link href="/dashboard/tutorial" data-fitur="tutorial" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
            Tutorial
          </Link>

          <div className="pt-5 pb-2 px-3">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">AKUN</p>
          </div>

          <Link href="/dashboard/kredit" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Riwayat Kredit
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Billing
          </Link>
          <Link href="/dashboard/affiliate" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect><path d="M12 8v12"></path><path d="M19 8c0-1.66-1.34-3-3-3s-3 1.34-3 3"></path><path d="M5 8c0-1.66 1.34-3 3-3s3 1.34 3 3"></path></svg>
            Affiliate
          </Link>
          <Link href="/dashboard/pengaturan" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Pengaturan
          </Link>
          {isAdmin && (
            <Link href="/dashboard/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="10" r="2"></circle></svg>
              Dashboard Admin
            </Link>
          )}
          <div className="h-4"></div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border-subtle space-y-4 shrink-0 bg-bg-surface">
          <ThemeToggle />

          <UserChip />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children}
      </main>

      {/* FAB paritas (§"Floating action buttons"): "Buka asisten" 48px biru-600,
          radius penuh, kanan bawah. Disembunyikan di halaman asisten (redundan)
          dan saat fitur asisten dimatikan admin. */}
      {fiturNyala(flags, 'asisten') && pathname !== '/dashboard/asisten' && (
        <Link
          href="/dashboard/asisten"
          aria-label="Buka asisten"
          className="fixed bottom-6 right-6 z-20 flex size-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-colors hover:bg-brand-primary-hover"
        >
          <IcChat />
        </Link>
      )}
    </div>
  );
}
