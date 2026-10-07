'use client';
import EmptyState, { IcDok } from '@/components/EmptyState';

// Paritas mantrariset §3.17: daftar Karil = empty state + tombol "Buat Karil",
// plus kartu panduan dengan tabel (nilai persis dari screenshot 19-karil-ut).
const PANDUAN: [string, string][] = [
  ['Sistematika', 'Judul · Identitas · Abstrak & kata kunci · Pendahuluan · Metode · Hasil dan Pembahasan · Simpulan dan Saran · Daftar Pustaka'],
  ['Format', 'Times New Roman 12 pt, spasi 1,5, A4, margin 2,5 cm, menjorok 1 cm, nomor halaman di bawah tengah'],
  ['Panjang', '10–20 halaman (di luar Daftar Pustaka) — ikuti arahan pembimbingmu'],
  ['Abstrak', 'Bahasa Indonesia, 1 paragraf 150–200 kata, 3–5 kata kunci urut abjad; versi Inggris opsional'],
  ['Penulis', 'Mahasiswa sebagai penulis pertama, tutor/pembimbing kedua, tanpa gelar'],
  ['Rujukan', 'Minimal 10 sumber, sedikitnya 5 artikel jurnal terbitan 5 tahun terakhir, gaya APA'],
];

export default function KarilPage() {
  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto pb-24">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Karil UT</h1>
          <p className="text-text-secondary text-sm">Karya Ilmiah (artikel ilmiah) Universitas Terbuka · MKWI4560</p>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl">
          <EmptyState
            ikon={<IcDok className="size-14" />}
            judul="Belum ada Karil"
            teks="Tulis Karil-mu langsung dengan sistematika & format Panduan Karil UT — tanpa memilih jurnal tujuan."
            aksi="Buat Karil →"
            href="/dashboard/karil/baru"
          />
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
          <h2 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-brand-primary"><IcDok className="size-5" /></span>
            Mengikuti Panduan Karil UT (MKWI4560)
          </h2>
          <dl className="space-y-3 text-sm">
            {PANDUAN.map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="font-bold text-text-primary sm:w-28 shrink-0">{k}</dt>
                <dd className="text-text-secondary">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-text-muted mt-4">
            Kelulusan Karil ditentukan pembimbing (nilai minimal 75) dan kemiripan Turnitin maksimal 30%. Unggah naskah final ke kelas di e-learning UT setelah disetujui pembimbing.
          </p>
        </div>
      </div>
    </div>
  );
}
