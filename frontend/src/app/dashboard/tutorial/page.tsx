import Link from 'next/link';

// Paritas §3.18 — grid video tutorial: thumbnail + judul + badge "Tonton di YouTube"
// (2 kolom, lihat hasil-analisis-mantrariset/screenshot-tombol/20-tutorial.png).
// Keputusan owner 7 Okt: video belum ada → placeholder JUJUR — tanpa link/badge YouTube
// palsu, kartu bilang "Video segera hadir". Isi `url` dengan link YouTube di bawah →
// thumbnail (i.ytimg.com) + badge "Tonton di YouTube" otomatis aktif.
// JANGAN memakai video/thumbnail milik mantrariset.
type Video = { judul: string; url?: string };

const VIDEOS: Video[] = [
  { judul: 'TUTORIAL SKRISI PALEMBANG' },
  { judul: 'CARA MENCARI JUDUL SKRIPSI/TESIS/DISERTASI/ARTIKEL' },
  { judul: 'TUTORIAL MENCARI ARTIKEL' },
  { judul: 'TUTORIAL PENGERJAAN SKRIPSI/TESIS/DISERTASI KUANTITATIF' },
  { judul: 'TUTORIAL PENGERJAAN ARTIKEL SINTA DAN SCOPUS' },
  { judul: 'TUTORIAL MENAMBAH DAN MENCARI SITASI' },
];

/** ID video YouTube dari URL (watch / youtu.be / shorts / embed); null bila bukan. */
function ytId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const GUIDES = [
  { t: 'Mencari judul skripsi/tesis/disertasi/artikel', d: 'Brainstorming 10 judul dari topik + metode, lalu cek kelayakan dan novelty sebelum memutuskan.', href: '/dashboard/brainstorming' },
  { t: 'Mencari artikel referensi', d: 'Ketik topik di Cari Artikel — hanya referensi ber-DOI nyata dari Crossref yang tampil.', href: '/dashboard/artikel' },
  { t: 'Mengerjakan skripsi Bab I–V', d: 'Buat proyek, buka Studio, generate per bab (10 kredit). Setiap bab otomatis bersitasi + Daftar Pustaka.', href: '/dashboard/proyek/buat' },
  { t: 'Artikel Sinta & Scopus', d: 'Generate artikel siap submit, Indonesia untuk Sinta, Inggris untuk Scopus (15 kredit).', href: '/dashboard/artikel-sinta' },
  { t: 'Menambah sitasi', d: 'Sitasi otomatis masuk di tiap bab. Tambahan manual: salin format APA dari Daftar Pustaka Bab Ini.', href: '/dashboard/proyek' },
];

export default function TutorialPage() {
  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto pb-24">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Video Tutorial</h1>
          <p className="text-text-secondary text-sm">Panduan memakai Skripsi Palembang — dari membuat judul sampai ekspor Word.</p>
        </div>

        {/* Grid video paritas §3.18 — 2 kolom, thumbnail + judul + badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VIDEOS.map((v) => {
            const id = ytId(v.url);
            const thumb = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
            return (
              <article key={v.judul} className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm">
                <div className="relative aspect-video bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
                  {thumb && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={thumb} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  {/* Overlay judul kiri atas — paritas screenshot referensi */}
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-3">
                    <p className="text-sm font-bold text-white drop-shadow line-clamp-2">{v.judul}</p>
                    <p className="text-[11px] text-white/80">Skripsi Palembang</p>
                  </div>
                  {!thumb && (
                    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur">
                        <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </div>
                  )}
                  {id ? (
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-black/80"
                    >
                      Tonton di
                      <span className="inline-flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                          <path fill="#FF0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8z" />
                          <path fill="#fff" d="M9.6 15.6V8.4l6.3 3.6z" />
                        </svg>
                        <span className="font-bold">YouTube</span>
                      </span>
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur"
                    >
                      Video segera hadir
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold uppercase text-text-primary">{v.judul}</h3>
                </div>
              </article>
            );
          })}
        </div>

        {/* Panduan langkah demi langkah (konten situs kita, di bawah grid video) */}
        {GUIDES.map((g) => (
          <Link key={g.t} href={g.href} className="block bg-bg-surface border border-border-subtle hover:border-brand-primary rounded-xl p-5 transition-colors">
            <div className="font-bold text-text-primary">{g.t}</div>
            <div className="text-sm text-text-secondary mt-1">{g.d}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
