import Link from 'next/link';

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
        <h1 className="text-2xl font-bold text-text-primary">Video Tutorial</h1>
        <p className="text-text-secondary text-sm">Panduan memakai Skripsi Palembang — dari membuat judul sampai ekspor Word.</p>
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
