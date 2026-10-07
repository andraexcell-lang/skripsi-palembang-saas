'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardSearch from './search';
import { supabase } from '@/lib/supabase';
import { apiGet } from '@/lib/api';

/** Isi dengan link Grup WA kita sendiri bila sudah ada. */
const GRUP_WA = 'https://chat.whatsapp.com/JFKzEThZQzDGwZKkMcxLq6';

/* ---------- ikon (setara lucide) ---------- */
const S = (cls: string) => ({ className: cls, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });
const IcPlus = () => <svg {...S('size-4 shrink-0')}><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
const IcArrowRight = () => <svg {...S('size-4 shrink-0')}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
const IcArrowRightSm = () => <svg {...S('size-3.5 shrink-0')}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
const IcBell = () => <svg {...S('size-5')}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
const IcClock = () => <svg {...S('size-3')}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcCalendar = () => <svg {...S('size-3.5 shrink-0')}><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>;
const IcCrown = () => <svg {...S('size-4')}><path d="M11.564 1.67a.5.5 0 0 1 .872 0l2.536 4.733 5.296.768a.5.5 0 0 1 .277.849l-3.83 3.734.906 5.27a.5.5 0 0 1-.726.53L12 15.09l-4.889 2.57a.5.5 0 0 1-.726-.53l.906-5.27L3.465 8.02a.5.5 0 0 1 .277-.849l5.296-.768z" /></svg>;
const IcCoins = () => <svg {...S('size-4 shrink-0 text-text-muted')}><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></svg>;
const IcDownload = () => <svg {...S('size-3.5 shrink-0')}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>;
const IcCap = () => <svg {...S('size-4')}><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>;
const IcBook = () => <svg {...S('size-4')}><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>;
const IcAward = () => <svg {...S('size-4')}><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></svg>;
const IcFile = () => <svg {...S('size-4')}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>;
const IcGlobe = () => <svg {...S('size-4')}><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>;
const IcTrash = () => <svg {...S('size-4')}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>;
const IcGear = () => <svg {...S('size-4')}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const IcLogout = () => <svg {...S('size-4')}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>;
const IcWa = () => (
  <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.37 9.37 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.41-9.4a9.35 9.35 0 0 1 6.65 2.76 9.32 9.32 0 0 1 2.75 6.65c0 5.18-4.22 9.41-9.4 9.41zM20.52 3.45A11.78 11.78 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.14 1.6 5.95L.08 24l6.35-1.66a11.85 11.85 0 0 0 5.61 1.43h.01c6.54 0 11.86-5.32 11.86-11.87 0-3.17-1.24-6.15-3.39-8.45z" />
  </svg>
);

/* ---------- kartu karya ---------- */
const KARYA = [
  { label: 'Skripsi', desc: 'S1 · Bab 1–5 lengkap', href: '/dashboard/proyek/buat?jenis=skripsi', wrap: 'bg-brand-primary/10 text-brand-primary', dot: 'bg-brand-primary', Icon: IcCap },
  { label: 'Tesis', desc: 'S2 · Analisis mendalam', href: '/dashboard/proyek/buat?jenis=tesis', wrap: 'bg-accent-purple/10 text-accent-purple', dot: 'bg-accent-purple', Icon: IcBook },
  { label: 'Disertasi', desc: 'S3 · Kebaruan penelitian', href: '/dashboard/proyek/buat?jenis=disertasi', wrap: 'bg-violet-600/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', dot: 'bg-violet-600 dark:bg-violet-500', Icon: IcAward },
  { label: 'Artikel Sinta', desc: 'Jurnal terakreditasi', href: '/dashboard/artikel-sinta', wrap: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', Icon: IcFile },
  { label: 'Artikel Scopus', desc: 'Jurnal internasional', href: '/dashboard/artikel-scopus', wrap: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', Icon: IcGlobe },
  { label: 'Karil UT', desc: 'Artikel Karya Ilmiah UT', href: '/dashboard/karil', wrap: 'bg-accent-teal/10 text-accent-teal', dot: 'bg-accent-teal', Icon: IcBook },
];

const NAMA_JENIS: Record<string, string> = {
  skripsi: 'Skripsi', tesis: 'Tesis', disertasi: 'Disertasi', artikel: 'Artikel',
  artikel_sinta: 'Artikel Sinta', artikel_scopus: 'Artikel Scopus', karil: 'Karil UT',
};
const LEVEL: Record<string, string> = { skripsi: 'S1', tesis: 'S2', disertasi: 'S3' };

const tgl = (s?: string) => (s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const isArtikel = (j?: string) => !!j && (j.startsWith('artikel') || j === 'karil');

function Bar({ pct, cls }: { pct: number; cls: string }) {
  return (
    <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${cls}`}>
      <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function DashboardIndex() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [initial, setInitial] = useState('?');
  const [bal, setBal] = useState<{ credits: number; plan: string } | null>(null);
  const [berakhir, setBerakhir] = useState('');
  const [latest, setLatest] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [filter, setFilter] = useState<'semua' | 'skripsi' | 'artikel'>('semua');
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = String(data.user?.user_metadata?.full_name || data.user?.email || '?');
      setName(n);
      setInitial(n.charAt(0).toUpperCase());
    });
    apiGet('/api/credits/balance').then(setBal).catch(() => {});
    apiGet('/api/credits/ledger').then((r) => setNotifs(r.items || [])).catch(() => {});
    apiGet('/api/billing/transactions').then((r) => {
      const paid = (r.items || []).find((t: any) => ['paid', 'settlement', 'capture', 'success'].includes(String(t.status || '').toLowerCase()));
      if (paid?.created_at) {
        const d = new Date(paid.created_at);
        d.setDate(d.getDate() + 30);
        setBerakhir(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
      }
    }).catch(() => {});
    apiGet('/api/projects').then((r) => {
      setLatest(r.items?.[0] || null);
      setRecent(r.items || []);
    }).catch(() => {});
  }, []);

  async function hapus(id: string) {
    if (!confirm('Hapus proyek ini?')) return;
    try {
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token || '';
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/projects/${id}`, {
        method: 'DELETE', headers: t ? { Authorization: `Bearer ${t}` } : {},
      });
      const sisa = recent.filter((x) => x.id !== id);
      setRecent(sisa);
      if (latest?.id === id) setLatest(sisa[0] || null);
    } catch { /* abaikan */ }
  }

  async function keluar() {
    await supabase.auth.signOut();
    try { localStorage.clear(); } catch { /* abaikan */ }
    router.push('/login');
  }

  const doneCount = latest ? Object.keys(latest.content || {}).length : 0;
  const pct = latest ? Math.round((doneCount / 5) * 100) : 0;
  const tampil = recent.filter((p) => (filter === 'semua' ? true : filter === 'artikel' ? isArtikel(p.jenis) : !isArtikel(p.jenis))).slice(0, 6);
  const paket = bal?.plan && bal.plan !== 'free' ? `Paket ${cap(bal.plan)}` : 'Paket Gratis';

  const btnPrimer = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors bg-brand-primary text-white hover:bg-brand-primary-hover px-4 py-2';
  const btnOutline = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors border border-border-strong text-text-primary hover:bg-bg-surface-hover px-4 py-2';

  return (
    <div className="flex-1 overflow-y-auto p-3 lg:p-5">
      <div className="mx-auto max-w-5xl space-y-3 pb-10">
        {/* Baris atas: Proyek Baru + notifikasi + akun */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          <Link href="/dashboard/proyek/buat" className={btnPrimer}>
            <IcPlus /> Proyek Baru
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                aria-label="Notifikasi"
                onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }}
                className="relative rounded-full p-2 text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary"
              >
                <IcBell />
                {notifs.length > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent-red ring-2 ring-bg-base" />}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-xl">
                    <div className="border-b border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-primary">Notifikasi</div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <p className="p-4 text-center text-xs text-text-muted">Belum ada notifikasi.</p>
                      ) : notifs.slice(0, 20).map((n: any, i: number) => (
                        <div key={n.id || i} className="border-b border-border-subtle px-4 py-3 last:border-0">
                          <p className="text-sm font-semibold text-text-primary">
                            {Number(n.amount) > 0 ? `+${n.amount}` : n.amount} kredit
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                            {n.meta?.feature ? `Fitur ${n.meta.feature}` : n.ref}
                          </p>
                          <p className="mt-1 text-[10px] text-text-muted">
                            {new Date(n.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-bg-surface-hover"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">{initial}</span>
                <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:inline">{name}</span>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-xl">
                    <div className="border-b border-border-subtle px-4 py-3">
                      <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
                    </div>
                    <Link href="/dashboard/pengaturan" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-surface-hover">
                      <span className="text-text-secondary"><IcGear /></span> Pengaturan
                    </Link>
                    <button onClick={keluar} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-accent-red hover:bg-accent-red/10">
                      <IcLogout /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tanya AI */}
        <DashboardSearch />

        {/* Terakhir dibuat + Paket */}
        <div className="grid gap-2.5 lg:grid-cols-3">
          {latest ? (
            <div className="relative overflow-hidden rounded-xl border border-[#B9D4FF] bg-[#E7F1FF] p-3 dark:border-[#2C4370] dark:bg-[#14243F] lg:col-span-2">
              <svg className="pointer-events-none absolute -top-1 right-2 hidden h-20 text-[#2875FF] opacity-70 sm:block" viewBox="0 0 80 80" aria-hidden>
                {[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => (
                  <rect key={`${r}-${c}`} x={c * 15 + 2} y={r * 15 + 2} width="7" height="7" rx="1.5" fill="currentColor" opacity={(5 - r) * 0.09 + (5 - c) * 0.03} />
                )))}
              </svg>
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-1 text-xs font-medium text-[#2563EB] dark:bg-[#1B2E52] dark:text-[#93B4FF]">
                  <IcClock /> Terakhir dibuat
                </span>
                <p className="mt-1.5 line-clamp-2 pr-0 text-base font-bold leading-snug text-text-primary sm:pr-24">{latest.judul}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#C6DAF5] dark:bg-[#2A3A55]">
                    <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-text-primary">{doneCount}/5 bab · {pct}%</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <IcCalendar /> Diperbarui {tgl(latest.updated_at)}
                  </span>
                  <Link href={`/dashboard/studio/${latest.id}`} className={btnPrimer}>
                    Buka Proyek <IcArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-[#B9D4FF] bg-[#E7F1FF] p-3 dark:border-[#2C4370] dark:bg-[#14243F] lg:col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-1 text-xs font-medium text-[#2563EB] dark:bg-[#1B2E52] dark:text-[#93B4FF]">
                <IcClock /> Belum ada proyek
              </span>
              <p className="mt-1.5 line-clamp-2 pr-0 text-base font-bold leading-snug text-text-primary sm:pr-24">
                Pilih jenis karya di bawah, isi topiknya, dan AI menyusun kerangkanya.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-text-muted">Gratis untuk mulai</span>
                <Link href="/dashboard/proyek/buat" className={btnPrimer}>
                  Buat Proyek <IcArrowRight />
                </Link>
              </div>
            </div>
          )}

          {/* Kartu paket */}
          <div className="rounded-xl border border-[#E6D3A3] bg-[#FBF1D9] p-3 dark:border-[#4C3E1F] dark:bg-[#2B2311]">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface text-[#9A7328] dark:bg-[#1C170B]">
                <IcCrown />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold text-text-primary">{paket}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                    {bal?.plan && bal.plan !== 'free' && bal.plan !== 'admin' ? 'Aktif' : bal?.plan === 'admin' ? 'Admin' : 'Gratis'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {bal?.plan && !['free', 'admin'].includes(bal.plan)
                    ? (berakhir ? <>Bulanan · berakhir {berakhir}</> : 'Bulanan · isi ulang kapan saja')
                    : bal?.plan === 'admin' ? 'Akses penuh · tanpa masa berlaku'
                    : 'Tanpa masa berlaku · isi ulang kapan saja'}
                </p>
              </div>
            </div>

            <p className="mt-2.5 flex items-center gap-2 text-sm text-text-primary">
              <IcCoins />
              {bal === null ? 'Memuat…' : `${bal.credits} kredit tersisa`}
            </p>

            <Link href="/dashboard/billing" className={`${btnOutline} mt-2 w-full border-[#E6D3A3] bg-bg-surface dark:border-[#4C3E1F] dark:bg-[#1C170B]`}>
              Tambah Kredit <IcArrowRight />
            </Link>

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#E6D3A3] pt-2.5 dark:border-[#4C3E1F]">
              <Link href="/hubungkan" className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline">
                <IcDownload /> Plugin Word
              </Link>
              <a
                href={GRUP_WA || '#'}
                target={GRUP_WA ? '_blank' : undefined}
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0B7A38] dark:text-[#25D366] hover:underline"
                title={GRUP_WA ? undefined : 'Link Grup WA belum diisi'}
              >
                <IcWa /> Grup WA
              </a>
            </div>
          </div>
        </div>

        {/* Mulai buat karya */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[15px] font-bold text-text-primary">Mulai buat karya</h2>
            <Link href="/dashboard/proyek" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-primary">
              <span className="sm:hidden">Lihat semua</span>
              <span className="hidden sm:inline">Pilih jenis karya sesuai kebutuhanmu</span>
              <IcArrowRightSm />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {KARYA.map((k) => (
              <Link key={k.label} href={k.href}>
                <div className="flex h-full items-center gap-2 rounded-xl border-2 border-border-subtle bg-bg-surface p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_3px_8px_rgba(15,23,42,0.05)] transition-colors hover:border-brand-primary">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${k.wrap}`}>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full text-white ${k.dot}`}><k.Icon /></span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold leading-tight text-text-primary">{k.label}</h3>
                    <p className="mt-0.5 text-xs leading-snug text-text-secondary">{k.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Proyek terakhir */}
        <div className="rounded-xl border border-border-subtle bg-bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
            <h2 className="text-[15px] font-bold text-text-primary">Proyek terakhir</h2>
            <div className="flex items-center gap-1 rounded-lg bg-bg-base p-0.5">
              {(['semua', 'skripsi', 'artikel'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${filter === f ? 'bg-bg-surface text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {cap(f)}
                </button>
              ))}
            </div>
          </div>

          <ul className="divide-y divide-border-subtle">
            {tampil.length === 0 && <li className="px-4 py-6 text-center text-sm text-text-muted">Belum ada proyek.</li>}
            {tampil.map((p: any) => {
              const n = Object.keys(p.content || {}).length;
              const pc = Math.round((n / 5) * 100);
              const jenis = NAMA_JENIS[p.jenis] || cap(String(p.jenis || 'Skripsi'));
              const lvl = LEVEL[p.jenis] || 'S1';
              const href = isArtikel(p.jenis)
                ? (p.jenis === 'artikel_scopus' ? '/dashboard/artikel-scopus' : p.jenis === 'karil' ? '/dashboard/karil' : '/dashboard/artikel-sinta')
                : `/dashboard/studio/${p.id}`;
              return (
                <li key={p.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-bg-surface-hover sm:items-center">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-primary text-white"><IcCap /></span>
                  </span>
                  <Link href={href} className="min-w-0 flex-1">
                    <p className="line-clamp-2 pr-2 text-sm font-semibold leading-snug text-text-primary sm:line-clamp-none sm:truncate">{p.judul}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary">{jenis}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-bg-base px-2.5 py-1 text-xs font-semibold text-text-secondary">{lvl}</span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">Diperbarui {tgl(p.updated_at)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 sm:hidden">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-border-subtle">
                        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pc}%` }} />
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold tabular-nums text-text-secondary">{n}/5 bab · {pc}%</span>
                    </div>
                  </Link>
                  <div className="hidden w-40 shrink-0 sm:block">
                    <p className="text-right text-xs font-semibold text-text-secondary">{n}/5 bab</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Bar pct={pc} cls="bg-bg-base" />
                      <span className="w-9 shrink-0 text-right text-xs font-semibold text-text-primary">{pc}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => hapus(p.id)}
                    title="Hapus proyek"
                    className="-mr-2 -mt-1 shrink-0 rounded-md p-2 text-text-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red sm:m-0"
                  >
                    <IcTrash />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
