'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardSearch from "./search";
import CreditBadge from "@/components/CreditBadge";
import { supabase } from "@/lib/supabase";
import { apiGet } from "@/lib/api";

export default function DashboardIndex() {
  const [initial, setInitial] = useState("?");
  const [bal, setBal] = useState<{ credits: number; plan: string } | null>(null);
  const [latest, setLatest] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = String(data.user?.user_metadata?.full_name || data.user?.email || "?");
      setInitial(n.charAt(0).toUpperCase());
    });
    apiGet('/api/credits/balance').then(setBal).catch(() => {});
    apiGet('/api/projects').then((r) => setLatest(r.items?.[0] || null)).catch(() => {});
  }, []);

  const doneCount = latest ? Object.keys(latest.content || {}).length : 0;
  const pct = latest ? Math.round((doneCount / 5) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-bg-base relative">

      {/* Top Header */}
      <header className="h-16 flex items-center justify-end px-8 border-b border-border-subtle bg-bg-base">
        <div className="flex items-center gap-4">
          <CreditBadge />
          <Link href="/dashboard/proyek/buat" className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
            <span>+</span> Proyek Baru
          </Link>
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto pb-24">

        {/* Search Bar */}
        <DashboardSearch />

        {/* Highlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Terakhir Dibuat */}
          <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="text-text-secondary text-xs mb-3 font-medium">Terakhir dibuat</div>
              <h2 className="text-xl font-bold text-text-primary mb-8 relative z-10 w-3/4">{latest?.judul || 'Belum ada proyek — buat yang pertama'}</h2>
            </div>

            <div className="flex items-end justify-between relative z-10">
              <div className="text-xs text-text-muted">
                {latest ? `Diperbarui ${new Date(latest.updated_at).toLocaleDateString('id-ID')}` : '—'}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-text-primary">{doneCount}/5 bab - {pct}%</span>
                  <div className="w-24 h-1.5 bg-bg-base rounded-full mt-1 border border-border-subtle overflow-hidden">
                    <div className="h-full bg-brand-primary" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                {latest && (
                  <Link href={`/dashboard/studio/${latest.id}`} className="bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 shadow-md shadow-brand-primary/20">
                    Buka Proyek <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Paket */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-bold text-text-primary text-lg capitalize">Paket {bal?.plan || '...'}</span>
            </div>

            <div className="text-text-secondary text-sm flex items-center gap-2 mb-4 font-medium">
              {bal === null ? 'Memuat...' : `${bal.credits} kredit tersisa`}
            </div>

            <Link href="/dashboard/billing" className="w-full text-center bg-transparent border border-border-strong text-text-primary hover:bg-bg-surface-hover py-2 rounded-lg text-sm font-semibold transition-colors mb-auto">
              Pilih Paket →
            </Link>
          </div>
        </div>

        {/* Mulai Buat Karya */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary">Mulai buat karya</h3>
            <Link href="/dashboard/proyek" className="text-xs text-text-secondary hover:text-text-primary">Pilih jenis karya sesuai kebutuhanmu →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link href="/dashboard/proyek/buat" className="bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-xl p-4 flex items-center gap-3 transition-colors group">
              <div>
                <div className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">Skripsi</div>
                <div className="text-xs text-text-muted">S1 · Bab 1-5 lengkap</div>
              </div>
            </Link>

            <Link href="/dashboard/artikel-sinta" className="bg-bg-surface border border-border-subtle hover:border-text-secondary rounded-xl p-4 flex items-center gap-3 transition-colors group">
              <div>
                <div className="font-bold text-sm text-text-primary transition-colors">Artikel Sinta</div>
                <div className="text-xs text-text-muted">Jurnal terakreditasi</div>
              </div>
            </Link>

            <Link href="/dashboard/artikel-scopus" className="bg-bg-surface border border-border-subtle hover:border-accent-red rounded-xl p-4 flex items-center gap-3 transition-colors group">
              <div>
                <div className="font-bold text-sm text-text-primary group-hover:text-accent-red transition-colors">Artikel Scopus</div>
                <div className="text-xs text-text-muted">Jurnal internasional</div>
              </div>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
