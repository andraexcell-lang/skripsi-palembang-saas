'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** Daftar fitur yang bisa dimatikan/dinyalakan admin (tab Fitur di Dashboard Admin).
 *  slug WAJIB cocok dengan atribut data-fitur di sidebar & kartu dashboard. */
export type Fitur = { slug: string; label: string; ket?: string };
export type GrupFitur = { grup: string; items: Fitur[] };

export const DAFTAR_FITUR: GrupFitur[] = [
  {
    grup: 'Utama',
    items: [{ slug: 'asisten', label: 'AI Skripsi Palembang', ket: 'Asisten chat + FAB di semua halaman' }],
  },
  {
    grup: 'Penelitian',
    items: [
      { slug: 'proyek', label: 'Proyek Penelitian', ket: 'Daftar proyek & Studio penulisan' },
      { slug: 'brainstorming', label: 'Brainstorming Judul' },
      { slug: 'kelayakan', label: 'Kelayakan Judul' },
      { slug: 'novelty', label: 'Temukan Novelty' },
      { slug: 'artikel', label: 'Cari Artikel' },
      { slug: 'artikel-sinta', label: 'Artikel Sinta' },
      { slug: 'artikel-scopus', label: 'Artikel Scopus' },
      { slug: 'olah-data', label: 'Olah Data' },
      { slug: 'generate-ppt', label: 'Generate PPT' },
      { slug: 'lanjutkan', label: 'Lanjutkan Skripsi' },
    ],
  },
  {
    grup: 'Uji & Revisi',
    items: [
      { slug: 'simulasi', label: 'Simulasi Sidang' },
      { slug: 'plagiasi', label: 'Cek Plagiasi' },
      { slug: 'lab-revisi', label: 'Lab Revisi' },
      { slug: 'rapihkan', label: 'Rapihkan Skripsi' },
      { slug: 'parafrase', label: 'Parafrase' },
      { slug: 'ai-writer', label: 'AI Writer' },
      { slug: 'karil', label: 'Karil UT' },
      { slug: 'tuton', label: 'Tuton UT' },
    ],
  },
  {
    grup: 'Pendampingan',
    items: [{ slug: 'tutorial', label: 'Tutorial' }],
  },
];

/** Flags fitur dari server (publik GET /api/flags). null = belum termuat.
 *  Simpulan module-level supaya tidak bolak-balik fetch antar komponen.
 *  Pendengar (useFitur) diberi tahu saat admin menyimpan flags baru →
 *  sidebar/kartu langsung tersembunyi TANPA reload. */
let cacheFlags: Record<string, boolean> | null = null;
let pernahGagal = false;
let sedangFetch = false;
const pendengar = new Set<(f: Record<string, boolean>) => void>();

export function perbaruiFlags(f: Record<string, boolean>) {
  cacheFlags = f;
  pernahGagal = false;
  pendengar.forEach((fn) => {
    try { fn(f); } catch { /* abaikan */ }
  });
}

export function useFitur(): Record<string, boolean> | null {
  const [flags, setFlags] = useState<Record<string, boolean> | null>(cacheFlags);
  useEffect(() => {
    pendengar.add(setFlags);
    if (!cacheFlags && !pernahGagal && !sedangFetch) {
      sedangFetch = true;
      fetch(`${API}/api/flags`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((j) => {
          sedangFetch = false;
          perbaruiFlags(j && typeof j.flags === 'object' && j.flags ? j.flags : {});
          if (!pendengar.has(setFlags)) return;
          setFlags(cacheFlags);
        })
        .catch(() => { sedangFetch = false; pernahGagal = true; });
    }
    return () => { pendengar.delete(setFlags); };
  }, []);
  return flags;
}

/** true bila fitur `slug` tampil (default tampil — fail-open). */
export const fiturNyala = (flags: Record<string, boolean> | null, slug: string) => flags?.[slug] !== false;

/** Terapkan flags ke SEMUA elemen ber-data-fitur di dokumen (semua = false → sembunyikan). */
export function terapkanFlags(flags: Record<string, boolean> | null) {
  if (!flags) return;
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLElement>('[data-fitur]').forEach((el) => {
    const slug = el.getAttribute('data-fitur') || '';
    el.classList.toggle('hidden', flags[slug] === false);
  });
}
