'use client';
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiPatch, apiPostStream, apiUpload, apiDelete, apiDownloadPptx, isInsufficientCredits } from '@/lib/api';

const BABS = [
  { id: 'bab1', label: 'Bab I Pendahuluan', gen: 'Bab I: Pendahuluan' },
  { id: 'bab2', label: 'Bab II Tinjauan Pustaka', gen: 'Bab II: Tinjauan Pustaka' },
  { id: 'bab3', label: 'Bab III Metodologi', gen: 'Bab III: Metodologi' },
  { id: 'bab4', label: 'Bab IV Hasil Penelitian dan Pembahasan', gen: 'Bab IV: Hasil & Pembahasan' },
  { id: 'bab5', label: 'Bab V Penutup', gen: 'Bab V: Penutup' },
  { id: 'lampiran', label: 'Lampiran', gen: 'Lampiran' },
];

const SUB_LAMPIRAN_BAWAAN = ['6.1 Kisi-Kisi Instrumen Penelitian', '6.2 Pernyataan Responden'];

/* Opsi dialog metodologi Bab III — paritas mantrariset (chunk 5702/7997) */
type OpsiDesain = { label: string; fokus: string };
const DESAIN_KUANTITATIF: OpsiDesain[] = [
  { label: 'Penelitian Deskriptif', fokus: 'Menggambarkan kondisi suatu variabel' },
  { label: 'Penelitian Komparatif', fokus: 'Membandingkan dua kelompok atau lebih' },
  { label: 'Penelitian Korelasional', fokus: 'Menguji hubungan antarvariabel' },
  { label: 'Penelitian Asosiatif', fokus: 'Menguji hubungan antara dua variabel atau lebih' },
  { label: 'Penelitian Eksplanatori', fokus: 'Menjelaskan pengaruh/hubungan sebab-akibat' },
  { label: 'Penelitian Kausal', fokus: 'Menguji pengaruh variabel bebas terhadap terikat' },
  { label: 'Penelitian Survei', fokus: 'Mengumpulkan data dari sampel via kuesioner' },
  { label: 'Penelitian Eksperimen', fokus: 'Menguji pengaruh perlakuan tertentu' },
  { label: 'Pra-Eksperimen', fokus: 'Eksperimen dengan kontrol terbatas' },
  { label: 'Quasi Experiment', fokus: 'Eksperimen tanpa pengacakan penuh' },
  { label: 'True Experiment', fokus: 'Eksperimen dengan kelompok kontrol & randomisasi' },
  { label: 'Factorial Experiment', fokus: 'Menguji dua/lebih perlakuan sekaligus' },
  { label: 'Ex Post Facto', fokus: 'Mengkaji sebab-akibat setelah peristiwa terjadi' },
  { label: 'Penelitian Longitudinal', fokus: 'Mengamati objek dalam beberapa periode' },
  { label: 'Penelitian Cross-Sectional', fokus: 'Mengumpulkan data pada satu waktu' },
  { label: 'Penelitian Panel', fokus: 'Mengamati objek yang sama beberapa periode' },
  { label: 'Penelitian Time Series', fokus: 'Mengamati data berurutan berdasarkan waktu' },
  { label: 'Penelitian Sensus', fokus: 'Menggunakan seluruh anggota populasi' },
  { label: 'Penelitian Evaluatif Kuantitatif', fokus: 'Menilai efektivitas program dari data angka' },
  { label: 'Meta-Analisis', fokus: 'Menggabungkan hasil beberapa penelitian kuantitatif' },
];
const DESAIN_KUALITATIF: OpsiDesain[] = [
  { label: 'Studi Kasus', fokus: 'Mengkaji satu kasus secara mendalam' },
  { label: 'Fenomenologi', fokus: 'Menggali pengalaman hidup partisipan' },
  { label: 'Etnografi', fokus: 'Mengkaji budaya & pola kehidupan suatu kelompok' },
  { label: 'Grounded Theory', fokus: 'Menyusun teori berdasarkan data lapangan' },
  { label: 'Penelitian Naratif', fokus: 'Mengkaji cerita/perjalanan hidup seseorang' },
  { label: 'Biografi', fokus: 'Mengkaji riwayat hidup tokoh' },
  { label: 'Autobiografi', fokus: 'Pengalaman hidup yang ditulis subjek sendiri' },
  { label: 'Sejarah/Historis', fokus: 'Mengkaji peristiwa masa lalu dari sumber sejarah' },
  { label: 'Analisis Isi Kualitatif', fokus: 'Mengkaji makna isi teks, media, atau dokumen' },
  { label: 'Analisis Wacana', fokus: 'Mengkaji bahasa, ideologi, dan kekuasaan' },
  { label: 'Hermeneutika', fokus: 'Menafsirkan makna teks secara mendalam' },
  { label: 'Semiotika', fokus: 'Mengkaji tanda, simbol, dan makna' },
  { label: 'Studi Dokumen', fokus: 'Mengkaji dokumen sebagai sumber data utama' },
  { label: 'Penelitian Tindakan (PTK)', fokus: 'Memecahkan masalah praktis sambil bertindak' },
  { label: 'Penelitian Evaluatif Kualitatif', fokus: 'Menilai pelaksanaan program secara mendalam' },
  { label: 'Studi Kepustakaan Kualitatif', fokus: 'Menganalisis teori & hasil penelitian dari sumber tertulis' },
];
const DESAIN_CAMPURAN: OpsiDesain[] = [
  { label: 'Sequential Explanatory', fokus: 'Kuantitatif dilanjutkan kualitatif' },
  { label: 'Sequential Exploratory', fokus: 'Kualitatif dilanjutkan kuantitatif' },
  { label: 'Sequential Transformative', fokus: 'Data berurutan berdasarkan perspektif tertentu' },
  { label: 'Concurrent Triangulation', fokus: 'Data kuanti & kuali dikumpulkan bersamaan' },
  { label: 'Concurrent Embedded', fokus: 'Satu metode utama, metode lain pendukung' },
  { label: 'Concurrent Transformative', fokus: 'Data bersamaan dengan kerangka teori tertentu' },
  { label: 'Convergent Parallel Design', fokus: 'Data kuanti & kuali dikumpulkan lalu digabung' },
  { label: 'Embedded Design', fokus: 'Satu jenis data dimasukkan ke metode utama' },
  { label: 'Explanatory Sequential Design', fokus: 'Hasil kuantitatif dijelaskan dengan kualitatif' },
  { label: 'Exploratory Sequential Design', fokus: 'Temuan kualitatif diuji dengan kuantitatif' },
  { label: 'Multiphase Design', fokus: 'Penelitian dalam beberapa tahap' },
  { label: 'Intervention Design', fokus: 'Metode campuran untuk menguji intervensi' },
  { label: 'Case Study Mixed Methods', fokus: 'Studi kasus dengan data kuanti & kuali' },
  { label: 'Experimental Mixed Methods', fokus: 'Eksperimen dipadukan dengan data kualitatif' },
  { label: 'Evaluation Mixed Methods', fokus: 'Evaluasi program dengan dua jenis data' },
  { label: 'Participatory Mixed Methods', fokus: 'Melibatkan partisipasi subjek' },
  { label: 'Transformative Mixed Methods', fokus: 'Menggunakan perspektif perubahan sosial' },
  { label: 'Instrument Development Design', fokus: 'Data kualitatif untuk menyusun instrumen kuantitatif' },
];
const DESAIN_PUSTAKA: OpsiDesain[] = [
  { label: 'Studi Kepustakaan Kualitatif', fokus: 'Menganalisis teori & hasil penelitian dari sumber tertulis' },
  { label: 'Analisis Isi Kualitatif', fokus: 'Mengkaji makna isi teks, media, atau dokumen' },
  { label: 'Hermeneutika', fokus: 'Menafsirkan makna teks secara mendalam' },
  { label: 'Analisis Wacana', fokus: 'Mengkaji bahasa, ideologi, dan kekuasaan' },
  { label: 'Semiotika', fokus: 'Mengkaji tanda, simbol, dan makna' },
  { label: 'Sejarah/Historis', fokus: 'Mengkaji peristiwa masa lalu dari sumber sejarah' },
  { label: 'Studi Dokumen', fokus: 'Mengkaji dokumen sebagai sumber data utama' },
];
const DESAIN_RND: OpsiDesain[] = [
  { label: 'Borg and Gall', fokus: 'Pengembangan & pengujian produk pendidikan' },
  { label: 'ADDIE', fokus: 'Analysis, Design, Development, Implementation, Evaluation' },
  { label: '4D (Thiagarajan)', fokus: 'Define, Design, Develop, Disseminate' },
  { label: 'Dick and Carey', fokus: 'Pengembangan sistem pembelajaran' },
  { label: 'ASSURE', fokus: 'Pembelajaran berbasis karakteristik peserta didik' },
  { label: 'Plomp', fokus: 'Pengembangan produk & pemecahan masalah pendidikan' },
  { label: 'Reeves', fokus: 'Pengembangan berbasis penelitian desain' },
  { label: 'Design-Based Research', fokus: 'Pengembangan solusi dalam kondisi nyata' },
];
const DESAIN_HUKUM: OpsiDesain[] = [
  { label: 'Pendekatan Perundang-undangan (Statute Approach)', fokus: 'Menelaah peraturan yang terkait isu hukum' },
  { label: 'Pendekatan Konseptual (Conceptual Approach)', fokus: 'Beranjak dari doktrin & pandangan ahli hukum' },
  { label: 'Pendekatan Kasus (Case Approach)', fokus: 'Menelaah putusan pengadilan yang terkait' },
  { label: 'Pendekatan Historis (Historical Approach)', fokus: 'Menelusuri latar belakang & perkembangan pengaturan' },
  { label: 'Pendekatan Perbandingan (Comparative Approach)', fokus: 'Membandingkan dengan hukum negara/sistem lain' },
];
const ALAT_KUANTITATIF = [
  { value: 'SPSS', label: 'SPSS' },
  { value: 'SmartPLS', label: 'SmartPLS (PLS-SEM)' },
  { value: 'AMOS', label: 'AMOS (CB-SEM)' },
  { value: 'LISREL', label: 'LISREL (CB-SEM)' },
  { value: 'EViews', label: 'EViews' },
  { value: 'Stata', label: 'Stata' },
  { value: 'R', label: 'R / RStudio' },
  { value: 'JASP', label: 'JASP' },
  { value: 'Minitab', label: 'Minitab' },
  { value: 'Lainnya', label: 'Lainnya…' },
];
const ALAT_KUALITATIF = [
  { value: 'Manual', label: 'Manual (koding manual)' },
  { value: 'NVivo', label: 'NVivo' },
  { value: 'ATLAS.ti', label: 'ATLAS.ti' },
  { value: 'MAXQDA', label: 'MAXQDA' },
  { value: 'Lainnya', label: 'Lainnya…' },
];

/* Ikon lucide (inline SVG) — paritas referensi, tanpa dependency tambahan */
const LUCIDE: Record<string, string> = {
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line>',
  help: '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>',
  clipboard:
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path>',
  presentation: '<path d="M2 3h20"></path><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path><path d="m7 21 5-5 5 5"></path>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
  book: '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>',
  flask:
    '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"></path><path d="M6.453 15h11.094"></path><path d="M8.5 2h7"></path>',
  quote:
    '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>',
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path>',
};

function Ico({ n, className = 'size-3.5' }: { n: keyof typeof LUCIDE | string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: LUCIDE[n] || '' }}
    />
  );
}

export default function StudioWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [proyek, setProyek] = useState<any>(null);
  const [active, setActive] = useState('bab1');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [needsTopup, setNeedsTopup] = useState(false);
  const [studi, setStudi] = useState('10');
  const [soal, setSoal] = useState('');
  const [soalLoading, setSoalLoading] = useState(false);
  const [refs, setRefs] = useState<any[]>([]);
  const [abstrakLoading, setAbstrakLoading] = useState(false);
  const [pptLoading, setPptLoading] = useState(false);
  const [nomor, setNomor] = useState('1.1');
  const [outline, setOutline] = useState<any>(null);
  // Modal "Bukti Kutipan" saat sitasi diklik — paritas mantrariset
  const [bukti, setBukti] = useState<any>(null);

  // Sesuaikan Skripsi
  const [sesLoading, setSesLoading] = useState(false);
  const [sesHasil, setSesHasil] = useState<any>(null);
  // Tinjau Hasil
  const [tinjauLoading, setTinjauLoading] = useState(false);
  const [tinjau, setTinjau] = useState<any>(null);
  // Perkaya sub-bab + pesan sukses
  const [perkayaLoading, setPerkayaLoading] = useState(false);
  const [pesan, setPesan] = useState('');
  // Disclaimer mobile: Lihat / Tutup
  const [discOpen, setDiscOpen] = useState(false);
  // Cek Sitasi
  const [sitasiLoading, setSitasiLoading] = useState(false);
  const [sitasi, setSitasi] = useState<any>(null);
  const [sitasiOpen, setSitasiOpen] = useState(false);
  // Unggah Artikel Sendiri
  const [showUpload, setShowUpload] = useState(false);
  const [upFile, setUpFile] = useState<File | null>(null);
  const [upLoading, setUpLoading] = useState(false);
  const [upMsg, setUpMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Opsi A: unggah tabulasi .xlsx/.csv → angka Bab IV memakai data asli pengguna
  const [tabFile, setTabFile] = useState<File | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabMsg, setTabMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Editor inline per paragraf (paritas referensi): klik → textarea, simpan saat blur
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Alur berantai paritas referensi: dialog Bagan Kerangka Berpikir (Bab II),
  // dialog metodologi (Bab III), lalu Lampiran gratis setelah Bab III
  const chainRef = useRef(false);
  const [dlgBagan, setDlgBagan] = useState(false);
  const [baganPilihan, setBaganPilihan] = useState<'ai' | 'kirim' | null>(null);
  const [baganTeks, setBaganTeks] = useState('');
  const [dlgMetode, setDlgMetode] = useState(false);
  const [mPop, setMPop] = useState('');
  const [mTak, setMTak] = useState(false);
  const [mKepercayaan, setMKepercayaan] = useState('95');
  const [mMargin, setMMargin] = useState('0.05');
  const [mProporsi, setMProporsi] = useState('0.5');
  const [mDesain, setMDesain] = useState('');
  const [mAlat, setMAlat] = useState('SPSS');
  const [mAlatLain, setMAlatLain] = useState('');
  const mulaiRef = useRef(false);

  const ROMAWI_HURUF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function fmtHeading(line: string): string {
    if (nomor !== 'A') return line;
    const m = line.match(/^(\d+)\.(\d+)\.?\s+(.*)$/);
    if (m) {
      const a = ROMAWI_HURUF[(parseInt(m[1], 10) - 1 + 26) % 26] || m[1];
      return `${a}. ${m[2]}. ${m[3]}`;
    }
    return line;
  }

  function cleanMd(s: string): string {
    return s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2').trim();
  }

  /* ---------------- Editor inline per paragraf (paritas referensi) ---------------- */
  function mulaiEdit(idx: number, nilai: string) {
    setErr('');
    setEditIdx(idx);
    setEditVal(nilai);
  }

  async function simpanEdit(idx: number, nilai: string) {
    const lama = String(proyek?.content?.[active] ?? '');
    const baris = lama.split('\n');
    if ((baris[idx] ?? '') === nilai) return; // tak ada perubahan → tak usah kirim
    const sebelum = baris[idx] ?? '';
    baris[idx] = nilai;
    const baru = baris.join('\n');
    setEditSaving(true);
    try {
      await apiPatch(`/api/projects/${id}/content`, { key: active, text: baru });
      setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), [active]: baru } }));
    } catch (e: any) {
      setErr(`Gagal menyimpan perubahan: ${e.message}`);
      // kembalikan teks editor agar pengguna tak kehilangan ketikan
      setEditIdx(idx);
      setEditVal(sebelum);
    } finally {
      setEditSaving(false);
    }
  }

  function renderDoc(body: string) {
    const lines = body.split('\n');
    const awal: any[] = [];
    const bagian: { raw: string; anak: any[] }[] = [];
    let target: any[] = awal;
    let i = 0;
    // Baris "BAB …" baru tampil → baris HURUF BESAR berikutnya ("PENDAHULUAN")
    // adalah NAMA BAB — ikut judul (tebal rata tengah), persis ekspor DOCX.
    let baruBab = false;
    // Tabel markdown: pipe eksternal opsional + sel kosong dipertahankan —
    // parser identik dengan ekspor DOCX (proyek "No | Nama (Tahun) | …" tampil sebagai tabel juga)
    const sel = (s: string) => s.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    const pemisah = (s: string) => {
      const p = sel(s);
      return p.length >= 2 && p.every((c) => /^:?-+:?$/.test(c));
    };
    // "<br>" dalam sel tabel → baris baru (paritas DOCX: ekspor mengubahnya jadi
    // line break, jadi penanda "<br>" tidak pernah tampil sebagai teks literal)
    const teksBr = (s: string) => (
      <>{String(s).split(/<br\s*\/?>/gi).map((seg, n) => (
        <span key={`brseg-${n}`}>{n > 0 ? <br /> : null}{seg}</span>
      ))}</>
    );
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || /^---+$/.test(t)) { i++; continue; }
      // Judul tabel/gambar ("Judul Tabel: …") — tampil sebagai NAMA objek di atasnya
      // (paritas caption DOCX; baris ini dipakai parser Word jadi "Tabel 2.1 …")
      if (/^Judul\s+(Tabel|Gambar)\s*:/i.test(t)) {
        baruBab = false;
        target.push(
          <p key={`judul-objek-${i}`} className="mt-4 mb-1 text-center text-xs font-semibold tracking-wide text-text-secondary">
            {cleanMd(t)}
          </p>
        );
        i++; continue;
      }
      if (t.includes('|') && i + 1 < lines.length && pemisah(lines[i + 1].trim())) {
        baruBab = false;
        const head = sel(t).map(cleanMd);
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].includes('|')
          && !/^(#{1,6}\s|BAB\s+[IVX]|DAFTAR |LAMPIRAN\b)/i.test(lines[i].trim())) {
          rows.push(sel(lines[i]).map(cleanMd));
          i++;
        }
        target.push(
          <table key={`tbl-${i}`} className="w-full text-xs border-collapse my-4">
            <thead><tr>{head.map((h, k) => <th key={k} className="border border-border-strong px-2 py-1 text-left">{teksBr(h)}</th>)}</tr></thead>
            <tbody>{rows.map((r, k) => <tr key={k}>{head.map((_, j) => <td key={j} className="border border-border-strong px-2 py-1">{teksBr(r[j] || '')}</td>)}</tr>)}</tbody>
          </table>
        );
        continue;
      }
      const dt = cleanMd(t);
      if (dt.length < 160 && /^(BAB\s+[IVX0-9]+(\s+.*)?|DAFTAR PUSTAKA|ABSTRAK|ABSTRACT|KATA PENGANTAR|DAFTAR ISI|DAFTAR TABEL|LEMBAR .*)$/i.test(dt)) {
        // Judul bab: "BAB I" ATAU "BAB II TINJAUAN PUSTAKA" → tebal rata tengah
        // (sebelumnya hanya "BAB X" murni yang match — judul satubar dianggap paragraf)
        target.push(<h3 key={i} className="text-center font-bold text-base mt-6 mb-3">{dt}</h3>);
        baruBab = /^BAB\s+[IVX0-9]+/i.test(dt);
      } else if (baruBab && !/^\d/.test(dt) && dt.length < 80 && dt === dt.toUpperCase() && /[A-Z]{3,}/.test(dt)) {
        // Nama bab dua baris ("BAB I" ⏎ "PENDAHULUAN") → judul kedua, tebal rata tengah
        target.push(<h3 key={`bab-nama-${i}`} className="text-center font-bold text-base mt-0 mb-3">{dt}</h3>);
        baruBab = false;
      } else if (/^\d+\.\d+\.?\s+\S/.test(dt)) {
        // Sub-bab baru (boleh "1.1 Judul" atau "1.1. Judul") → kelompok sendiri untuk kontrol Perkaya / Hapus
        baruBab = false;
        bagian.push({ raw: dt, anak: [] });
        target = bagian[bagian.length - 1].anak;
      } else if (editIdx === i) {
        // Editor inline (paritas referensi): textarea + petunjuk Markdown, simpan saat blur
        baruBab = false;
        target.push(
          <div key={`edit-${i}`} className="mb-3">
            <textarea
              value={editVal}
              autoFocus
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={() => { const idx = editIdx; const nilai = editVal; setEditIdx(null); simpanEdit(idx, nilai); }}
              ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; } }}
              className="w-full resize-none overflow-hidden rounded-md border border-brand-primary/40 bg-brand-primary/5 p-3 font-sans text-sm leading-relaxed text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              style={{ minHeight: '6rem' }}
            />
            <p className="mt-1 font-sans text-[11px] text-text-muted">
              Ketik langsung seperti di Word. Klik di luar kotak untuk menyimpan. (Markdown: **tebal**, tabel |…|, poin, ### sub-sub-bab.)
            </p>
          </div>
        );
      } else {
        // `idx` ditangkap per-iterasi: `i` adalah variabel loop yang nilainya berubah
        // setelah renderDoc selesai, sehingga penutup (closure) tak boleh memakai `i` langsung.
        baruBab = false;
        const idx = i;
        target.push(
          <p
            key={idx}
            onClick={(e) => { if ((e.target as HTMLElement).closest('a')) return; mulaiEdit(idx, lines[idx]); }}
            className="cursor-text -mx-1 mb-3 rounded-md px-1 text-justify indent-8 leading-relaxed transition-colors hover:bg-brand-primary/5"
          >
            {renderSitasi(cleanMd(t), `l${idx}-`)}
          </p>
        );
      }
      i++;
    }
    return (
      <>
        {awal}
        {bagian.map((b, bi) => (
          <section key={`sec-${bi}`} className="group/sec">
            <div className="mt-5 mb-2 flex items-start gap-2">
              <h4 className="flex-1 font-bold text-sm">{fmtHeading(b.raw)}</h4>
              <button
                type="button"
                onClick={() => perkayaSub(b.raw)}
                disabled={perkayaLoading || loading}
                title="Perdalam sub-bab ini — gratis sekali per bab, berikutnya 1 kredit. Isi yang sudah ada tidak diubah, hanya ditambah"
                className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-1 font-sans text-xs font-semibold text-brand-primary transition-opacity hover:bg-brand-primary/10 focus-visible:opacity-100 group-hover/sec:opacity-100 [@media(hover:hover)]:opacity-0 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /></svg>
                {perkayaLoading ? 'Memerdalam…' : 'Perkaya'}
              </button>
              <button
                type="button"
                onClick={() => hapusSub(b.raw)}
                title="Hapus sub-bab"
                className="mt-0.5 shrink-0 rounded p-1 text-text-muted transition-opacity hover:text-accent-red focus-visible:opacity-100 group-hover/sec:opacity-100 [@media(hover:hover)]:opacity-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
              </button>
            </div>
            {b.anak}
          </section>
        ))}
      </>
    );
  }
  const [showDisc, setShowDisc] = useState(false);

  // Tutup editor inline saat pindah tab/bab — indeks baris lama tak berlaku
  useEffect(() => {
    setEditIdx(null);
    setEditVal('');
  }, [active]);

  useEffect(() => {
    try {
      if (!localStorage.getItem(`sp-disc-${id}`)) setShowDisc(true);
    } catch { /* abaikan */ }
  }, [id]);

  function closeDisc() {
    setShowDisc(false);
    try { localStorage.setItem(`sp-disc-${id}`, '1'); } catch { /* abaikan */ }
  }

  async function generateAbstrak() {
    setAbstrakLoading(true); setErr('');
    try {
      const r = await apiPost(`/api/projects/${id}/generate-abstrak`, {});
      setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), abstrak: r.text } }));
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
    }
    setAbstrakLoading(false);
  }

  async function tambahSitasi() {
    if (!active || active === 'pustaka') return;
    setLoading(true); setErr('');
    try {
      await apiPost(`/api/projects/${id}/tambah-sitasi`, { bab: active });
      await load();
      setErr('');
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  function refId(r: any, i: number) {
    return `ref-${i}`;
  }

  // Label judul bab dari varian outline (paritas mantrariset) — fallback ke BABS
  function labelBab(bid: string): string {
    return outline?.[bid]?.bab || BABS.find((b) => b.id === bid)?.label || 'Bab';
  }

  function findRef(cite: string): number {
    const m = cite.match(/([A-Za-zÀ-Ž\-']+)[^,]*,\s?(\d{4})/);
    if (!m) return -1;
    const surname = m[1].toLowerCase();
    const year = m[2];
    return refs.findIndex((r: any) =>
      String(r.authors || '').toLowerCase().includes(surname) && String(r.year || '') === year
    );
  }

  function renderSitasi(body: string, prefix = '') {
    const parts = body.split(/(\([A-ZÀ-Ž][^()]{1,80}?,\s?\d{4}[a-z]?\))/g);
    return parts.map((seg, i) => {
      if (i % 2 === 1) {
        const ri = findRef(seg);
        // Klik sitasi → modal "Bukti Kutipan" (paritas mantrariset); belum ketemu → tab Pustaka
        return (
          <button
            key={`${prefix}${i}`}
            type="button"
            title={ri >= 0 ? 'Lihat bukti kutipan' : 'Verifikasi di Daftar Pustaka'}
            onClick={() => { if (ri >= 0) setBukti(refs[ri]); else setActive('pustaka'); }}
            className="text-brand-primary underline decoration-dotted font-semibold hover:underline"
          >
            {seg}
          </button>
        );
      }
      return <span key={`${prefix}${i}`}>{seg}</span>;
    });
  }

  async function prediksiSoal() {
    if (soalLoading) return;
    setSoalLoading(true);
    try {
      const { aiGenerate } = await import('@/lib/api');
      const data = await aiGenerate(
        `Sebagai dosen penguji sidang skripsi. Judul: ${proyek?.judul}. Metode: ${proyek?.metode}. Materi: ${(text || '').slice(0, 3000)}. Buatkan 7 prediksi pertanyaan sidang paling mungkin + kata kunci jawabannya. Markdown bernomor.`,
        'chat'
      );
      setSoal(data.result);
    } catch (e: any) { setErr(e.message); }
    setSoalLoading(false);
  }

  async function load() {
    let pr: any = null;
    try {
      const r = await apiGet(`/api/projects/${id}`);
      pr = r.item;
      setProyek(pr);
    } catch (e: any) { setErr(e.message); }
    try {
      const r = await apiGet(`/api/projects/${id}/references`);
      setRefs(r.items || []);
    } catch { /* abaikan */ }
    try {
      // Struktur baku per metode+jenis (paritas mantrariset — kualitatif ≠ kuantitatif)
      const q = pr
        ? `?metode=${encodeURIComponent(pr.metode || '')}&jenis=${encodeURIComponent(pr.jenis || '')}`
        : '';
      const r = await apiGet(`/api/projects/meta/outline${q}`);
      setOutline(r.outline || null);
    } catch { /* abaikan */ }
  }
  useEffect(() => { load(); }, [id]);

  // Paritas referensi: proyek baru dengan ?mulai=1 → Bab I langsung digenerate,
  // lalu rantai berhenti menunggu konfirmasi dialog Bagan (Bab II).
  useEffect(() => {
    if (!proyek || mulaiRef.current) return;
    mulaiRef.current = true;
    let mulai = false;
    try { mulai = new URLSearchParams(window.location.search).get('mulai') === '1'; } catch { /* abaikan */ }
    if (!mulai) return;
    if (proyek.content?.bab1 || loading) return;
    chainRef.current = true;
    generate(false, undefined, undefined, 'bab1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyek]);

  async function generate(force = false, instruksi?: string, ekstra?: Record<string, unknown>, babAwal?: string) {
    const bab = babAwal || active;
    if (bab === 'pustaka') return;
    // Jeda interaktif paritas referensi: dialog Bagan (Bab II) & metodologi (Bab III)
    if (!force && !ekstra && !proyek?.content?.[bab]) {
      if (bab === 'bab2') { setActive('bab2'); setDlgBagan(true); return; }
      if (bab === 'bab3') { setActive('bab3'); setDlgMetode(true); return; }
    }
    setLoading(true); setErr(''); setNeedsTopup(false); setPesan('');
    if (!force && (bab === 'bab1' || bab === 'bab2' || bab === 'bab3') && !proyek?.content?.[bab]) chainRef.current = true;
    try {
      const r = await apiPostStream(`/api/projects/${id}/generate-bab-stream${force ? '?ulang=1' : ''}`, { bab, studi: bab === 'bab2' ? studi : undefined, force, instruksi: instruksi || undefined, ...ekstra }, (t) => {
        setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), [bab]: t } }));
      });
      if (r.cached) setErr('');
      if (force && !r.cached) setPesan(`${labelBab(active)} selesai ditulis ulang.`);
      await load();
      window.dispatchEvent(new Event('sp:balance'));
      // Alur berantai (paritas referensi): Bab I → dialog Bagan (Bab II) →
      // dialog metodologi (Bab III) → Lampiran otomatis GRATIS
      if (chainRef.current && !force && !r.cached) {
        if (bab === 'bab1') { setLoading(false); setActive('bab2'); setDlgBagan(true); return; }
        if (bab === 'bab2') { setLoading(false); setActive('bab3'); setDlgMetode(true); return; }
        if (bab === 'bab3') {
          setPesan('Bab III selesai. Lampiran dibuat otomatis — GRATIS.');
          setActive('lampiran');
          chainRef.current = false;
          setLoading(false);
          generate(false, undefined, { lewatRantai: true }, 'lampiran');
          return;
        }
      }
      chainRef.current = false;
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      chainRef.current = false;
    }
    setLoading(false);
  }

  /* ---------------- Konfirmasi dialog Bagan Kerangka Berpikir (Bab II) ---------------- */
  function konfirmasiBagan(pilihan: 'ai' | 'kirim') {
    const ekstra: Record<string, unknown> = { bagan: pilihan };
    if (pilihan === 'kirim') {
      const teks = baganTeks.trim();
      if (teks.length < 10) { setErr('Tulis dulu deskripsi baganmu (min. 10 karakter).'); return; }
      ekstra.baganTeks = teks;
    }
    setErr('');
    setDlgBagan(false);
    setBaganPilihan(null);
    setBaganTeks('');
    generate(false, undefined, ekstra);
  }

  /* ---------------- Konfirmasi dialog metodologi (Bab III) ---------------- */
  function konfirmasiMetodologi(lewati: boolean) {
    const metode = String(proyek?.metode || '');
    const kual = /kualitatif/i.test(metode);
    const wajib = !kual && !/pustaka/i.test(metode);
    if (!lewati && wajib && !mTak && !/^\d+$/.test(mPop.trim())) {
      setErr('Jumlah populasi wajib diisi angka, atau centang "Populasi tidak diketahui".');
      return;
    }
    setErr('');
    setDlgMetode(false);
    if (lewati) { generate(false, undefined, { lewatRantai: true }); return; }
    generate(false, undefined, {
      populasi: /^\d+$/.test(mPop.trim()) ? Number(mPop.trim()) : undefined,
      takDiketahui: mTak,
      desain: mDesain || undefined,
      software: mAlat === 'Lainnya' ? mAlatLain.trim() || undefined : mAlat,
      kepercayaan: mKepercayaan,
      margin: mMargin,
      proporsi: mProporsi,
      lewatRantai: true,
    });
  }

  /* ---------------- Generate Ulang Bab Ini (tulis ulang + arahan, alur referensi) ---------------- */
  function tulisUlang() {
    if (loading || active === 'pustaka' || !text) return;
    const a = labelBab(active) || 'bab ini';
    const i = window.prompt(
      `Tulis ulang ${a} — apa yang perlu diperbaiki? Contoh: "fokuskan pada UMKM kuliner di Surabaya, jangan bahas regulasi" atau "perbanyak data statistik, kurangi teori". Kosongkan bila ingin ditulis ulang biasa tanpa arahan khusus.`,
      ''
    );
    if (i === null) return;
    const r = i.trim().slice(0, 1500);
    const ok = window.confirm(
      `Tulis ulang ${a}${r ? ' dengan arahanmu' : ' dari awal'}? ` +
      (r ? `Arahanmu: "${r.slice(0, 180)}${r.length > 180 ? '…' : ''}" ` : '') +
      `• Isi ${a} yang sekarang akan DITULIS ULANG, termasuk bagian yang sudah kamu sunting manual — suntinganmu akan hilang. ` +
      `• Dikenakan ${active === 'lampiran' ? 'GRATIS — Lampiran tidak memotong kredit' : '1 kredit'}. ` +
      (r
        ? `• Arahanmu diikuti sejauh tidak melanggar aturan penulisan (struktur, sitasi, panjang). `
        : `• Kalau kamu mengulang karena datanya salah, perbaiki dulu data di pengaturan proyek — kalau tidak, hasilnya akan sama saja. `) +
      ' Lanjutkan?'
    );
    if (!ok) return;
    generate(true, r);
  }

  /* ---------------- Perkaya sub-bab: GRATIS sekali per bab, sesudahnya 1 kredit ---------------- */
  async function perkayaSub(judul: string) {
    if (perkayaLoading || active === 'pustaka') return;
    setPerkayaLoading(true); setErr(''); setPesan(''); setNeedsTopup(false);
    try {
      const c = await apiPost(`/api/projects/${id}/perkaya/cek`, { bab: active });
      const info = c.ok
        ? c.gratis
          ? `GRATIS — ini pemakaian pertama untuk ${c.namaBab}. Berikutnya 1 kredit.`
          : `Biaya ${c.biaya} kredit (jatah gratis ${c.namaBab} sudah terpakai). Sisa kreditmu ${c.sisaKredit}.`
        : 'Gratis sekali untuk tiap bab; berikutnya 1 kredit.';
      if (c.ok && !c.gratis && c.sisaKredit < c.biaya) {
        setErr(`Kredit kurang. Butuh ${c.biaya}, sisa ${c.sisaKredit}.`);
        setNeedsTopup(true);
        return;
      }
      const ok = window.confirm(
        `Perdalam "${judul}"? Isi yang sudah ada TIDAK diubah — hanya ditambah (dimensi, indikator, pandangan ahli lain, contoh penerapan). Referensi baru ditarik bila diperlukan, dan yang benar-benar disitasi masuk Daftar Pustaka. ${info} Lanjutkan?`
      );
      if (!ok) return;
      const rr = await apiPost(`/api/projects/${id}/perkaya`, { bab: active, judul });
      setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), [active]: rr.content } }));
      setPesan(`Sub-bab "${judul}" diperdalam${rr.gratis ? ' — GRATIS' : ''}. Sisa kredit ${rr.sisaKredit}.`);
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
    }
    setPerkayaLoading(false);
  }

  /* ---------------- Hapus sub-bab (gratis, konfirmasi seperti referensi) ---------------- */
  async function hapusSub(judul: string) {
    if (active === 'pustaka') return;
    if (!window.confirm(`Hapus sub-bab "${judul}"? Isi bagian ini akan dihapus permanen.`)) return;
    setErr(''); setPesan('');
    try {
      const r = await apiPost(`/api/projects/${id}/sub-bab/hapus`, { bab: active, judul });
      setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), [active]: r.content } }));
      setPesan(`Sub-bab "${judul}" dihapus.`);
    } catch (e: any) { setErr(e.message); }
  }

  /* ---------------- Sesuaikan Skripsi (5 kredit) ---------------- */
  async function sesuaikan() {
    if (sesLoading) return;
    setSesLoading(true); setErr(''); setNeedsTopup(false); setSesHasil(null);
    try {
      const r = await apiPost(`/api/projects/${id}/sesuaikan`, {});
      setSesHasil(r);
      await load();
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      if (e?.data?.catatan?.length) setSesHasil({ diterapkan: [], catatan: e.data.catatan });
    }
    setSesLoading(false);
  }

  /* ---------------- Tinjau Hasil (5 kredit) ---------------- */
  async function tinjauHasil() {
    if (tinjauLoading) return;
    setTinjauLoading(true); setErr(''); setNeedsTopup(false);
    try {
      const r = await apiPost(`/api/projects/${id}/tinjau`, {});
      setTinjau(r.hasil);
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
    }
    setTinjauLoading(false);
  }

  /* ---------------- Cek Sitasi (GRATIS) ---------------- */
  async function cekSitasi() {
    if (sitasiLoading) return;
    setSitasiLoading(true); setErr('');
    try {
      const r = await apiPost(`/api/projects/${id}/cek-sitasi`, {});
      setSitasi(r);
      setSitasiOpen(true);
    } catch (e: any) { setErr(e.message); }
    setSitasiLoading(false);
  }

  /* ---------------- Unggah Artikel Sendiri (GRATIS) ---------------- */
  async function kirimArtikel() {
    if (!upFile || upLoading) return;
    setUpLoading(true); setUpMsg(null);
    try {
      const r = await apiUpload(`/api/projects/${id}/references/upload`, upFile);
      setRefs(r.refs || []);
      setUpMsg({ ok: true, text: `Tersimpan: ${r.ref?.title || upFile.name}${r.ref?.year ? ` (${r.ref.year})` : ''} — masuk Daftar Pustaka (${r.total}).` });
      setUpFile(null);
    } catch (e: any) {
      setUpMsg({ ok: false, text: e.message });
      if (isInsufficientCredits(e)) setNeedsTopup(true);
    }
    setUpLoading(false);
  }

  /* ---------------- Opsi A: tabulasi Bab IV (.xlsx/.csv) ---------------- */
  async function kirimTabulasi() {
    if (!tabFile || tabLoading) return;
    setTabLoading(true); setTabMsg(null);
    try {
      const r = await apiUpload(`/api/projects/${id}/tabulasi`, tabFile);
      setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), tabulasi: r.tabulasi } }));
      setTabMsg({ ok: true, text: `Tersimpan: ${r.chars} karakter · ${r.baris} baris${r.namaFile ? ` · ${r.namaFile}` : ''}. Angka Bab IV kini memakai data ini.` });
      setTabFile(null);
    } catch (e: any) {
      setTabMsg({ ok: false, text: e.message });
    }
    setTabLoading(false);
  }

  async function hapusTabulasi() {
    if (tabLoading) return;
    setTabLoading(true); setTabMsg(null);
    try {
      await apiDelete(`/api/projects/${id}/tabulasi`);
      setProyek((p: any) => {
        const c = { ...(p?.content || {}) };
        delete c.tabulasi;
        return { ...p, content: c };
      });
      setTabMsg({ ok: true, text: 'Data tabulasi dihapus — Bab IV kembali memakai simulasi agen.' });
    } catch (e: any) {
      setTabMsg({ ok: false, text: e.message });
    }
    setTabLoading(false);
  }

  function downloadRis() {
    apiGet(`/api/projects/${id}/references`).then((r: any) => {
      const ris = (r.items || []).map((x: any) => {
        const aus = String(x.authors || '').split(';').map((a: string) => `AU  - ${a.trim()}`).join('\n');
        return `TY  - JOUR\n${aus}\nPY  - ${x.year || ''}\nTI  - ${x.title || ''}\nDO  - ${x.doi || ''}\nUR  - ${x.url || ''}\nER  - `;
      }).join('\n\n');
      const blob = new Blob([ris], { type: 'application/x-research-info-systems' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'daftar-pustaka.ris';
      a.click();
      URL.revokeObjectURL(a.href);
    }).catch((e: any) => setErr(e.message));
  }

  async function downloadWord() {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token || '';
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/projects/${id}/export-docx`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
      if (!res.ok) throw new Error('Gagal ekspor Word');
      const disp = res.headers.get('Content-Disposition') || '';
      const nm = /filename="([^"]+)"/.exec(disp)?.[1];
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nm || 'skripsi.docx';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) { setErr(e.message); }
  }

  /* ---------------- PPT dari isi proyek (8 kredit) ---------------- */
  async function downloadPpt() {
    if (pptLoading) return;
    setPptLoading(true); setErr(''); setNeedsTopup(false);
    try {
      const c = proyek?.content || {};
      const materi = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'abstrak', 'lampiran']
        .map((k) => (c[k] ? `=== ${k.toUpperCase()} ===\n${String(c[k]).slice(0, 1500)}` : ''))
        .join('\n').slice(0, 8000);
      if (!materi.trim()) { setErr('Belum ada isi proyek untuk dijadikan slide.'); return; }
      await apiDownloadPptx(proyek?.tahap === 'proposal' ? 'sempro' : 'hasil', materi, String(proyek?.judul || 'Presentasi'));
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
    }
    setPptLoading(false);
  }

  const text = active === 'pustaka' ? '' : (proyek?.content?.[active] || '');
  const isPustaka = active === 'pustaka';
  const tabulasiAda = Boolean(proyek?.content?.tabulasi);
  const subsLampiran = outline?.lampiran?.subs?.length ? outline.lampiran.subs : SUB_LAMPIRAN_BAWAAN;
  // Progress rail (paritas referensi): "N dari 5 Bab · NN% selesai"
  const nBabSelesai = BABS.filter((b) => b.id !== 'lampiran' && proyek?.content?.[b.id]).length;
  const pctSelesai = Math.round((nBabSelesai / 5) * 100);

  const btnUtil = 'border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover disabled:opacity-50';
  const btnChip =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap border border-border-strong bg-bg-surface px-3 py-1.5 rounded-lg text-xs font-semibold text-text-primary hover:bg-bg-surface-hover disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0';

  return (
    <div className="flex h-full bg-bg-base">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border-subtle bg-bg-surface lg:flex lg:sticky lg:top-0 lg:h-full">
        <div className="shrink-0 border-b border-border-subtle p-4">
          <p className="line-clamp-2 text-sm font-bold text-text-primary">{proyek?.judul || 'Memuat...'}</p>
          <span className="mt-1.5 inline-block rounded bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">Skripsi</span>
        </div>
        <div className="shrink-0 px-3 pt-3">
          <div className="flex items-baseline justify-between text-[11px] text-text-secondary">
            <span>{nBabSelesai} dari 5 Bab</span>
            <span>{pctSelesai}% selesai</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-surface-hover">
            <div className="h-full rounded-full bg-brand-primary transition-all" style={{ width: `${pctSelesai}%` }} />
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          {BABS.map((b) => (
            <button
              key={b.id}
              onClick={() => setActive(b.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors ${active === b.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-secondary hover:bg-bg-surface-hover'}`}
            >
              <span className="truncate">{labelBab(b.id)}</span>
              {proyek?.content?.[b.id] && <span aria-hidden>✓</span>}
            </button>
          ))}
          <div className="my-2 border-t border-border-subtle" />
          <button onClick={() => setActive('pustaka')} className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors ${isPustaka ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-secondary hover:bg-bg-surface-hover'}`}>
            <span className="flex items-center gap-2 truncate">Daftar Pustaka</span>
            <span>({refs.length})</span>
          </button>
          <Link href="/dashboard/lab-revisi" className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-surface-hover">
            <Ico n="flask" className="size-4 shrink-0" />
            Lab Revisi
          </Link>
          <div className="px-3 py-2">
            <button onClick={tambahSitasi} disabled={loading || !text} className="flex w-full items-center gap-2 rounded-md py-0.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary disabled:opacity-60">
              <Ico n="quote" className="size-4 shrink-0" />
              Tambah Sitasi
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">GRATIS</span>
            </button>
          </div>
          <button
            onClick={() => { setShowUpload(true); }}
            title="Tambahkan artikel PDF milikmu sendiri sebagai referensi (maksimal 10)"
            className="flex w-full items-start gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-surface-hover"
          >
            <Ico n="upload" className="mt-0.5 size-4 shrink-0" />
            <span>
              Unggah Artikel Sendiri
              <span className="mt-0.5 block text-xs font-normal text-text-muted">PDF dari pembimbing atau jurnal berlangganan — maks 10.</span>
            </span>
          </button>
          <button
            onClick={prediksiSoal}
            disabled={soalLoading || !text}
            className="flex w-full items-start gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-surface-hover disabled:opacity-60"
          >
            <Ico n="help" className="mt-0.5 size-4 shrink-0" />
            <span>
              Prediksi Soal Sidang
              <span className="mt-0.5 block text-xs font-normal text-text-muted">Daftar pertanyaan &amp; jawaban dalam bentuk teks. Ingin berlatih bicara dengan penguji AI? Buka menu Simulasi Sidang.</span>
            </span>
          </button>
          <button
            onClick={tinjauHasil}
            disabled={tinjauLoading}
            title="Catatan revisi per bab: kelebihan, kekurangan & pertanyaan penguji (5 kredit)"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-surface-hover disabled:opacity-60"
          >
            <Ico n="clipboard" className="size-4 shrink-0" />
            {tinjauLoading ? 'Meninjau…' : 'Tinjau Hasil'}
          </button>
          <button
            onClick={generateAbstrak}
            disabled={abstrakLoading}
            title="Abstrak Indonesia + Inggris (1 kredit)"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-surface-hover disabled:opacity-60"
          >
            {abstrakLoading ? 'Menyusun…' : 'Abstrak ID+EN'}
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto">
        {/* Rail chip horizontal (mobile) — paritas referensi */}
        <div className="sticky top-0 z-10 border-b border-border-subtle bg-bg-base lg:hidden">
          {/* Baris progres (mobile) — paritas referensi: "1/5 Bab — bar — 20%" */}
          <div className="flex items-center gap-2 px-3 pt-2">
            <span className="shrink-0 text-[11px] font-semibold text-text-secondary">{nBabSelesai}/5 Bab</span>
            <div
              className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-bg-surface-hover"
              role="progressbar"
              aria-valuenow={pctSelesai}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progres penulisan ${pctSelesai} persen`}
            >
              <div className="h-full rounded-full bg-brand-primary transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pctSelesai}%` }} />
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-text-muted">{pctSelesai}%</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {BABS.map((b, i) => {
              const ada = !!proyek?.content?.[b.id];
              const aktif = active === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActive(b.id)}
                  className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ${aktif ? 'bg-brand-primary text-white' : ada ? 'bg-brand-primary/15 text-brand-primary' : 'bg-bg-surface text-text-secondary'}`}
                >
                  BAB {i + 1}{ada ? ' ✓' : ''}
                </button>
              );
            })}
            <button
              onClick={() => setActive('pustaka')}
              className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ${isPustaka ? 'bg-brand-primary text-white' : 'bg-bg-surface text-text-secondary'}`}
            >
              <Ico n="book" />
              Pustaka ({refs.length})
            </button>
            <Link href="/dashboard/lab-revisi" className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold bg-bg-surface text-text-secondary">
              <Ico n="flask" />
              Revisi
            </Link>
          </div>
        </div>

        {/* Toolbar sticky — paritas referensi: tombol cepat (mobile) + grup utama (grid) */}
        <div className="border-b border-border-subtle bg-bg-base lg:sticky lg:top-0 lg:z-10">
          <div className="flex flex-col gap-2.5 px-3 py-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-1.5 lg:hidden">
              <button onClick={() => setShowUpload((v) => !v)} className={btnChip}>
                <Ico n="upload" /> Unggah Artikel
              </button>
              <button onClick={prediksiSoal} disabled={soalLoading || !text} className={btnChip} title="Daftar pertanyaan & jawaban dalam bentuk teks. Ingin berlatih bicara dengan penguji AI? Buka menu Simulasi Sidang.">
                <Ico n="help" /> {soalLoading ? 'Menyusun...' : 'Prediksi Soal'}
              </button>
              <button onClick={tinjauHasil} disabled={tinjauLoading} className={btnChip} title="Catatan revisi per bab: kelebihan, kekurangan & pertanyaan penguji (5 kredit)">
                <Ico n="clipboard" /> {tinjauLoading ? 'Meninjau...' : 'Tinjau'}
              </button>
              <button onClick={downloadPpt} disabled={pptLoading} className={btnChip} title="Buat slide presentasi (.pptx) dari isi proyek ini">
                <Ico n="presentation" /> {pptLoading ? 'Membuat...' : 'PPT'}
              </button>
              <button onClick={cekSitasi} disabled={sitasiLoading} className={btnChip} title="Deteksi sitasi palsu/yatim — GRATIS, tanpa kredit">
                <Ico n="shield" /> {sitasiLoading ? 'Memeriksa...' : 'Cek Sitasi'}
              </button>
            </div>
            <p className="hidden truncate text-sm font-semibold text-text-secondary xl:block">{proyek?.judul}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:ml-auto lg:flex lg:flex-wrap lg:items-center">
              {text && (
                <button onClick={downloadWord} className={`${btnChip} col-span-2`} title="Unduh naskah (.docx)"><Ico n="download" /> {proyek?.tahap === 'proposal' ? 'Unduh Proposal' : 'Unduh Word'}</button>
              )}
              <button onClick={downloadRis} className={btnChip} title="Unduh Daftar Pustaka (.ris) — siap impor ke Mendeley/Zotero"><Ico n="download" /> RIS</button>
              <Link href="/dashboard/plagiasi" className={`${btnChip} inline-flex`} title="Cek Plagiasi"><Ico n="shield" /> Cek Plagiasi</Link>
              <select value={nomor} onChange={(e) => setNomor(e.target.value)} className="rounded-lg border border-border-strong bg-bg-surface p-2 text-xs font-semibold text-text-primary" title="Format penomoran sub-bab">
                <option value="1.1">Nomor 1.1 / 1.1.1</option>
                <option value="A">Nomor A. / 1. / a.</option>
              </select>
              {!isPustaka && active === 'bab2' && (
                <select value={studi} onChange={(e) => setStudi(e.target.value)} className="rounded-lg border border-border-strong bg-bg-surface p-2 text-xs font-semibold text-text-primary" title='Berapa studi yang dibahas di "Penelitian Terdahulu". Berlaku saat sub-bab itu ditulis ulang.'>
                  <option value="10">Studi terdahulu: 10 (bawaan)</option>
                  {['15', '20', '25', '30', '35', '40', '45', '50'].map((n) => <option key={n} value={n}>Studi terdahulu: {n} (1 paragraf/studi)</option>)}
                </select>
              )}
              <button onClick={generateAbstrak} disabled={abstrakLoading} className={btnChip} title="Abstrak Indonesia + Inggris (1 kredit)">
                {abstrakLoading ? '...' : 'Abstrak ID+EN'}
              </button>
              <button onClick={sesuaikan} disabled={sesLoading || !proyek?.content?.bab1} className={btnChip} title="Rapikan tujuan, hipotesis, kerangka konsep & Bab III agar sesuai rumusan masalah terbaru">
                <Ico n="sparkles" /> {sesLoading ? 'Menyesuaikan...' : 'Sesuaikan Skripsi'}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-4 p-4 lg:p-8">
          {err && <p className="text-sm text-accent-red">{err}</p>}
          {pesan && <p className="text-sm text-emerald-600 dark:text-emerald-400">{pesan}</p>}
        {needsTopup && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm text-text-primary flex items-center justify-between gap-3">
            <span>Kredit habis. Top-up untuk lanjut generate.</span>
            <Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap">Pilih Paket →</Link>
          </div>
        )}
        {/* Disclaimer — teks & toggle Lihat/Tutup persis paritas referensi */}
        <div className="mx-auto mb-0 flex max-w-3xl items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200 sm:px-4 sm:text-xs">
          <div
            id="disclaimer-studio"
            className={discOpen
              ? 'min-w-0 flex-1 sm:flex sm:items-start sm:gap-2'
              : 'min-w-0 flex-1 sm:flex sm:items-start sm:gap-2 truncate sm:overflow-visible sm:whitespace-normal'}
          >
            <span className="mr-1 font-bold sm:mr-0 sm:shrink-0">⚠️ Disclaimer:</span>
            <span>
              Hasil ini adalah DRAFT AWAL yang dibuat AI. Anda wajib mendalami, mengkritisi, memverifikasi fakta/data/referensi, dan merevisi secara menyeluruh. Tanggung jawab atas karya akhir sepenuhnya berada pada Anda — sejalan dengan Permendiknas No. 17 Tahun 2010 tentang Pencegahan dan Penanggulangan Plagiat di Perguruan Tinggi.{' '}
              <Link href="/dashboard/tutorial" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Selengkapnya</Link>
            </span>
          </div>
          <button
            type="button"
            aria-expanded={discOpen}
            aria-controls="disclaimer-studio"
            onClick={() => setDiscOpen((v) => !v)}
            className="-my-2 -mr-2 flex shrink-0 items-center gap-0.5 rounded px-2 py-2 font-semibold sm:hidden"
          >
            {discOpen ? 'Tutup' : 'Lihat'}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-3.5 transition-transform motion-reduce:transition-none ${discOpen ? 'rotate-180' : ''}`} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>

        {/* Hint sitasi — paritas referensi */}
        {text && !isPustaka && (
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-md border border-brand-primary/30 bg-brand-primary/5 px-3 py-2 text-[11px] leading-relaxed text-text-secondary sm:px-4 sm:text-xs">
            Klik sitasi (Penulis, Tahun) yang bergaris biru untuk melihat kalimat pendukung yang dikutip beserta nomor halamannya.
          </div>
        )}

        {/* Hasil Sesuaikan Skripsi */}
        {sesHasil && (
          <div className="bg-bg-surface border border-brand-primary/30 rounded-xl p-4 text-sm text-text-primary space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-brand-primary">
                {sesHasil.diterapkan?.length
                  ? `Sesuaikan Skripsi: ${sesHasil.diterapkan.length} bagian diperbarui di naskah.`
                  : 'Sesuaikan Skripsi: belum ada bagian yang bisa ditimpa.'}
              </p>
              <button onClick={() => setSesHasil(null)} className="text-xs text-text-muted hover:text-text-primary">Tutup</button>
            </div>
            {!!sesHasil.diterapkan?.length && (
              <ul className="list-disc pl-5 text-xs text-text-secondary space-y-0.5">
                {sesHasil.diterapkan.map((d: any) => <li key={d.key + d.judul}>{d.judul}</li>)}
              </ul>
            )}
            {!!sesHasil.catatan?.length && (
              <div className="bg-amber-50 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-400/40 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold mb-1">Penyelarasan Bab III yang perlu kamu cek:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {sesHasil.catatan.map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {soal && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm text-text-primary whitespace-pre-wrap">
            <h3 className="font-bold text-base mb-3 text-brand-primary">Prediksi Soal Sidang</h3>
            {soal}
          </div>
        )}
        {proyek?.content?.abstrak && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm text-text-primary whitespace-pre-wrap">
            <h3 className="font-bold text-base mb-3 text-brand-primary">Abstrak &amp; Abstract</h3>
            {proyek.content.abstrak}
          </div>
        )}

        {/* Tab Pustaka */}
        {isPustaka && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-bold text-base text-text-primary">Daftar Pustaka ({refs.length})</h3>
              <button onClick={downloadRis} className={btnUtil} title="Unduh referensi (.ris) — tinggal impor ke Mendeley/Zotero">Unduh RIS</button>
            </div>
            <p className="text-xs text-text-muted mb-3">Klik sitasi biru di naskah untuk melompat ke entri ini.</p>
            <button onClick={() => { setShowUpload(true); }} className="mb-4 w-full border border-dashed border-brand-primary/50 bg-brand-primary/5 rounded-lg px-4 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10">
              + Unggah Artikel Sendiri
            </button>
            {refs.length === 0 && <p className="text-sm text-text-muted">Belum ada referensi. Unggah artikel sendiri atau generate bab dulu.</p>}
            {refs.map((r: any, i: number) => (
              <div key={i} id={refId(r, i)} className="text-xs border-t border-border-subtle py-2 scroll-mt-24">
                <span className="font-bold text-text-primary">{r.authors} ({r.year}). </span>
                <span className="text-text-secondary">{r.title}. </span>
                {r.jurnal && <span className="text-text-muted italic">{r.jurnal}. </span>}
                {r.sumber === 'unggahan' && <span className="text-brand-primary font-semibold">[diunggah: {r.file}] </span>}
                {r.doi && <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer" className="text-brand-primary">DOI</a>}
                {!r.doi && r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-brand-primary">{r.url}</a>}
              </div>
            ))}
          </div>
        )}

        {/* Tab Lampiran (Bab VI) */}
        {active === 'lampiran' && !text && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-base text-text-primary">Lampiran</h3>
            <ul className="text-sm text-text-secondary space-y-1 list-disc pl-5">
              {subsLampiran.map((s: string) => <li key={s}>{s}</li>)}
            </ul>
            <p className="text-xs text-text-muted">Isinya diturunkan dari kajian pustaka dan metode artikelmu.</p>
            {!proyek?.content?.bab3 && (
              <p className="text-xs text-text-muted">Bab III belum lengkap. Lampiran tetap bisa dibuat sekarang, tetapi isinya paling tepat bila instrumen di Bab III sudah ada.</p>
            )}
            <button onClick={() => generate()} disabled={loading} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
              {loading ? 'Membuat…' : 'Generate Lampiran'}
            </button>
          </div>
        )}

        {/* Kartu "Referensi Terverifikasi" DIHAPUS — tidak ada di mantrariset.
            Klik sitasi di naskah → modal "Bukti Kutipan" (lihat render di bawah). */}

        {outline?.bab2?.subs?.some((s: string) => /hipotesis/i.test(s)) && active === 'bab2' && text && !/hipotesis/i.test(text) && (
          <div className="bg-amber-50 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-400/40 rounded-lg p-4 text-xs text-amber-900 dark:text-amber-200">
            <strong>Penelitianmu belum punya Hipotesis.</strong> Sub-bab Hipotesis sudah ada di kerangka tetapi belum ditulis. Generate bab ini supaya lengkap — penguji hampir selalu menanyakannya pada penelitian kuantitatif.
          </div>
        )}

        {!isPustaka && text && (
          <div id="dapus" className="bg-white dark:bg-bg-surface text-slate-900 dark:text-text-primary border border-border-subtle rounded-md p-4 sm:p-8 text-sm scroll-mt-24 shadow-sm" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>{renderDoc(text)}</div>
        )}

        {/* Opsi A — unggah tabulasi (.xlsx/.csv): angka Bab IV dari data asli */}
        {active === 'bab4' && !isPustaka && (
          <div className="mt-10 border border-border-subtle rounded-lg bg-bg-surface p-4 text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-text-primary">Data Tabulasi Bab IV <span className="font-normal text-text-muted">(.xlsx / .csv — opsional)</span></h3>
              {tabulasiAda && (
                <span className="text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Terpasang</span>
              )}
            </div>
            {tabulasiAda ? (
              <div className="space-y-2">
                <p className="text-text-secondary">Angka Bab IV diambil <b>persis</b> dari data ini (hasil uji, koefisien, hipotesis) — tanpa mengarang angka lain.</p>
                <pre className="max-h-32 overflow-auto bg-bg-base border border-border-subtle rounded p-2 text-[11px] text-text-muted whitespace-pre-wrap">{String(proyek?.content?.tabulasi || '').slice(0, 1200)}</pre>
                <div className="flex items-center gap-2 flex-wrap">
                  <input id="tab-ganti" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const f = e.target.files?.[0] || null; if (f) { setTabFile(f); setTabMsg(null); } }} className="hidden" />
                  <button onClick={() => document.getElementById('tab-ganti')?.click()} disabled={tabLoading} className="rounded-md border border-border-strong px-3 py-1.5 font-semibold text-text-primary disabled:opacity-50">Ganti file</button>
                  <button onClick={hapusTabulasi} disabled={tabLoading} className="rounded-md border border-border-strong px-3 py-1.5 font-semibold text-accent-red disabled:opacity-50">{tabLoading ? 'Memproses…' : 'Hapus'}</button>
                  {tabFile && (
                    <button onClick={kirimTabulasi} disabled={tabLoading} className="rounded-md bg-brand-primary text-white px-3 py-1.5 font-bold disabled:opacity-50">{tabLoading ? 'Menyimpan…' : `Simpan ${tabFile.name}`}</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-text-secondary">Punya hasil olah data (SPSS/Excel)? Unggah supaya Bab IV memakai angka aslimu. Belum ada? Agen menyusun tabulasi & hasil olahan simulasi sendiri (seluruh uji lulus, semua hipotesis signifikan).</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { setTabFile(e.target.files?.[0] || null); setTabMsg(null); }} className="block w-full sm:w-auto text-[11px] text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:opacity-90" />
                  <button onClick={kirimTabulasi} disabled={!tabFile || tabLoading} className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50">{tabLoading ? 'Membaca…' : 'Pasang untuk Bab IV'}</button>
                </div>
              </div>
            )}
            {tabMsg && <p className={`text-[11px] ${tabMsg.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent-red'}`}>{tabMsg.text}</p>}
          </div>
        )}

        {/* Footer generate — paritas referensi: "Bab belum dibuat." + Mulai Generate, atau Generate Ulang Bab Ini */}
        {!isPustaka && (text || active !== 'lampiran') && (
          <div className="mt-10 flex flex-col items-center gap-2 border-t border-border-subtle pt-6 text-center">
            {!text ? (
              <>
                <p className="text-sm text-text-secondary">Bab belum dibuat.</p>
                {active === 'bab4' && (
                  <p className="max-w-xl text-xs text-text-muted">
                    Punya tabulasi data (.xlsx/.csv)? Unggah lewat panel <span className="font-semibold">Data Tabulasi Bab IV</span> di atas —
                    Bab IV akan memakai angka aslimu. Belum ada data? Agen menyusun tabulasi & hasil olahannya sendiri: seluruh uji
                    dinyatakan lulus dan semua hipotesis signifikan.
                  </p>
                )}
                <button onClick={() => generate()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /></svg>
                  {loading ? 'Menggenerate...' : 'Mulai Generate'}
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-text-secondary">Datanya salah atau hasilnya kurang tepat? Bab ini bisa ditulis ulang dari awal.</p>
                {active === 'bab4' && (
                  <p className="max-w-xl text-xs text-text-muted">
                    Punya tabulasi data (.xlsx/.csv)? Unggah di panel <span className="font-semibold">Data Tabulasi Bab IV</span> di atas
                    sebelum Generate Ulang agar angka Bab IV memakai data aslimu; tanpa data, agen menyusun tabulasi & hasil olahan
                    simulasi (seluruh uji lulus, semua hipotesis signifikan).
                  </p>
                )}
                <button onClick={tulisUlang} disabled={loading} className={btnUtil}>
                  {loading ? 'Menggenerate...' : active === 'lampiran' ? 'Generate Ulang Lampiran' : 'Generate Ulang Bab Ini'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Unggah Artikel Sendiri — panel biru di bawah naskah (seperti referensi) */}
        {showUpload && (
          <div className="-mx-4 lg:-mx-8 border-t border-brand-primary/30 bg-brand-primary/5 px-4 py-3 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-2">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-bold text-base text-brand-primary">Unggah Artikel Sendiri</h3>
                <button onClick={() => { setShowUpload(false); setUpMsg(null); }} className="ml-auto text-xs font-semibold text-text-secondary hover:underline">Tutup</button>
              </div>
              <p className="text-xs text-text-secondary">PDF dari pembimbing atau jurnal berlangganan — maks 10. Metadatanya (penulis, tahun, judul, DOI) dicocokkan ke Crossref lalu masuk Daftar Pustaka proyekmu.</p>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => { setUpFile(e.target.files?.[0] || null); setUpMsg(null); }}
                className="block w-full text-xs text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:opacity-90"
              />
              <button onClick={kirimArtikel} disabled={!upFile || upLoading} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
                {upLoading ? 'Membaca & mencocokkan…' : 'Tambahkan ke Daftar Pustaka'}
              </button>
              {upMsg && (
                <p className={`text-xs ${upMsg.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent-red'}`}>{upMsg.text}</p>
              )}
              {upMsg?.ok && (
                <p className="text-[11px] text-text-muted">Sumber baru tersimpan. Klik <b>Tambah Sitasi</b> untuk menyisipkan sitasinya ke naskah.</p>
              )}
            </div>
          </div>
        )}

        {/* Modal: Bukti Kutipan — paritas mantrariset (klik sitasi di naskah) */}
        {bukti && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setBukti(null)}>
            <div className="w-full max-w-lg rounded-xl bg-bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-base text-text-primary">Bukti Kutipan</h3>
                <button onClick={() => setBukti(null)} className="rounded p-1 text-xs font-semibold text-text-muted hover:bg-bg-surface-hover">Tutup</button>
              </div>
              <p className="text-sm font-bold text-text-primary">{bukti.authors} ({bukti.year})</p>
              <p className="mt-1 text-sm text-text-secondary">
                {bukti.title}.{' '}
                {bukti.jurnal && <span className="italic">{bukti.jurnal}.</span>}
              </p>
              {bukti.sumber === 'unggahan' && (
                <p className="mt-2 text-xs text-brand-primary font-semibold">Artikel yang kamu unggah sendiri ({bukti.file})</p>
              )}
              {bukti.doi && (
                <a href={`https://doi.org/${bukti.doi}`} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-sm text-brand-primary underline">
                  doi.org/{bukti.doi}
                </a>
              )}
              {!bukti.doi && !bukti.url && (
                <div className="mt-3 rounded-lg border border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-400/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  Referensi ini belum memiliki tautan DOI. Periksa keasliannya lewat{' '}
                  <a
                    href={`https://scholar.google.com/scholar?q=${encodeURIComponent(`${bukti.title || ''} ${bukti.authors || ''}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline"
                  >
                    Google Scholar
                  </a>
                  .
                </div>
              )}
              {!bukti.doi && bukti.url && (
                <a href={bukti.url} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-sm text-brand-primary underline">
                  {bukti.url}
                </a>
              )}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    const i = refs.indexOf(bukti);
                    setBukti(null);
                    setActive('pustaka');
                    if (i >= 0) setTimeout(() => document.getElementById(refId(bukti, i))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
                  }}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                >
                  Buka di tab Pustaka
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Tinjau Hasil */}
        {tinjau && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setTinjau(null)}>
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-lg text-text-primary">Tinjau Hasil</h3>
                <button onClick={() => setTinjau(null)} className="rounded p-1 text-text-muted hover:bg-bg-surface-hover">✕</button>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 font-semibold text-emerald-700 dark:text-emerald-300">Kelebihan</p>
                  <ul className="list-disc space-y-1 pl-5 text-text-primary">{tinjau.kelebihan.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-amber-700 dark:text-amber-300">Kekurangan</p>
                  <ul className="list-disc space-y-1 pl-5 text-text-primary">{tinjau.kekurangan.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-brand-primary">Pertanyaan Penelitian (kemungkinan diajukan penguji)</p>
                  <ul className="list-disc space-y-1 pl-5 text-text-primary">{tinjau.pertanyaan.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                </div>
                <p className="mt-4 text-[11px] text-text-muted">Tinjauan AI berdasarkan draf saat ini — untuk persiapan bimbingan &amp; sidang.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Cek Sitasi */}
        {sitasiOpen && sitasi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSitasiOpen(false)}>
            <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-bg-surface p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-base text-text-primary">Cek Sitasi</h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-bold text-brand-primary">GRATIS</span>
                  <button onClick={() => setSitasiOpen(false)} className="rounded p-1 text-text-muted hover:bg-bg-surface-hover">✕</button>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-bg-surface-hover p-2">
                  <div className="text-lg font-bold text-text-primary">{sitasi.total}</div>
                  <div className="text-[11px] text-text-secondary">total sitasi</div>
                </div>
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{sitasi.nyata}</div>
                  <div className="text-[11px] text-text-secondary">nyata ✓</div>
                </div>
                <div className="rounded-lg bg-accent-red/10 p-2">
                  <div className="text-lg font-bold text-accent-red">{sitasi.perluDitinjau}</div>
                  <div className="text-[11px] text-text-secondary">perlu ditinjau</div>
                </div>
              </div>

              {sitasi.catatan && <p className="mb-3 text-xs text-text-muted">{sitasi.catatan}</p>}

              {sitasi.semuaCocok && !sitasi.catatan ? (
                <p className="flex items-start gap-2 text-sm text-text-primary">
                  <span className="text-emerald-600">✓</span> Semua sitasi cocok dengan referensi nyata di daftar pustakamu. Aman.
                </p>
              ) : sitasi.perluDitinjau > 0 ? (
                <>
                  <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                    <span className="shrink-0">⚠️</span>
                    <span>
                      <b>Sitasi &quot;yatim&quot;</b> = tidak ada di daftar referensi nyata proyek. Kemungkinan dikarang AI, atau teori klasik tanpa entri Daftar Pustaka. Tinjau: ganti manual atau hapus.
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {sitasi.temuan.filter((t: any) => t.status === 'yatim').map((t: any, i: number) => (
                      <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${t.saran ? 'border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-400/10' : 'border-accent-red/30 bg-accent-red/5'}`}>
                        <p className="font-semibold text-text-primary">{t.raw}</p>
                        <p className="text-xs text-text-secondary">
                          {t.saran
                            ? <>Ada di Crossref tapi belum ada di Daftar Pustakamu — mis. {t.saran.title} ({t.saran.year})</>
                            : 'Tidak ditemukan di Crossref maupun daftar pustakamu — cek manual (bisa sumber institusi/teori klasik yang tak punya entri).'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {sitasi.nyata > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-text-secondary">Lihat {sitasi.nyata} sitasi nyata</summary>
                  <ul className="mt-2 space-y-1.5">
                    {sitasi.temuan.filter((t: any) => t.status === 'nyata').map((t: any, i: number) => (
                      <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${t.dukungan === 'lemah' ? 'border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-400/10' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-text-primary">{t.raw}</span>
                          <span className="shrink-0 text-xs">{t.dukungan === 'lemah' ? '🟡' : '✓'}</span>
                        </div>
                        <p className="text-xs text-text-secondary">{t.rujukan?.title} ({t.rujukan?.year})</p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Dialog: Bagan Kerangka Berpikir (Bab II) — paritas referensi */}
        {dlgBagan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDlgBagan(false)}>
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-bold text-lg text-text-primary">Bagan Kerangka Berpikir</h3>
                <button onClick={() => setDlgBagan(false)} className="rounded p-1 text-text-muted hover:bg-bg-surface-hover">✕</button>
              </div>
              <p className="mb-4 text-sm text-text-secondary">
                Bab II memuat bagan Kerangka Berpikir. Biarkan AI menyusunkannya dari judulmu, atau gambar sendiri kalau kerangkamu punya bentuk khusus.
              </p>
              {!baganPilihan ? (
                <div className="space-y-3">
                  <button onClick={() => konfirmasiBagan('ai')} className="w-full rounded-lg border border-brand-primary bg-brand-primary/5 p-4 text-left transition-colors hover:bg-brand-primary/10">
                    <p className="text-sm font-bold text-brand-primary">Biarkan AI menyusunkan</p>
                    <p className="mt-1 text-xs text-text-secondary">Bagan dibuat otomatis dari judul &amp; variabel penelitianmu. Masih bisa diubah kapan saja lewat tombol <b>Ubah bagan</b> di Bab II.</p>
                  </button>
                  <button onClick={() => setBaganPilihan('kirim')} className="w-full rounded-lg border border-border-strong p-4 text-left transition-colors hover:bg-bg-surface-hover">
                    <p className="text-sm font-bold text-text-primary">Gambar sendiri bagannya</p>
                    <p className="mt-1 text-xs text-text-secondary">Tulis deskripsi kotak &amp; panah baganmu - mis. {"\u201cBudaya Kerja Digital \u2192 Motivasi Kerja \u2192 Prestasi Kerja, dengan Work Overload sebagai variabel antara\u201d"}.</p>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-text-primary" htmlFor="bagan-teks">Deskripsi bagan (kotak &amp; panah)</label>
                  <textarea
                    id="bagan-teks"
                    rows={6}
                    value={baganTeks}
                    onChange={(e) => setBaganTeks(e.target.value)}
                    placeholder="Tulis urutan kotak dan panahnya — AI akan menggambar sesuai deskripsimu."
                    className="w-full rounded-lg border border-border-strong bg-bg-surface p-3 text-sm text-text-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setBaganPilihan(null); setBaganTeks(''); }} className="border border-border-strong rounded-lg px-4 py-2 text-sm font-bold text-text-primary">Kembali</button>
                    <button onClick={() => konfirmasiBagan('kirim')} className="bg-brand-primary text-white rounded-lg px-5 py-2 text-sm font-bold">Kirim &amp; Generate</button>
                  </div>
                </div>
              )}
              {err && <p className="mt-2 text-sm text-accent-red">{err}</p>}
            </div>
          </div>
        )}

        {/* Dialog: Metodologi Penelitian (Bab III) — paritas referensi */}
        {dlgMetode && (() => {
          const metode = String(proyek?.metode || '');
          const kual = /kualitatif/i.test(metode);
          const pustakaOnly = /pustaka/i.test(metode);
          const campuran = /mixed|campuran/i.test(metode);
          const wajib = !kual && !pustakaOnly;
          const judulJumlah = pustakaOnly ? 'Jumlah Sumber Utama' : kual ? 'Jumlah Informan' : 'Jumlah Populasi';
          const tanyaJumlah = pustakaOnly
            ? 'Berapa jumlah sumber utama (buku & artikel) yang akan dianalisis? Angka ini menjadi dasar pembahasan di Bab III.'
            : kual
              ? 'Berapa jumlah informan/partisipan penelitianmu? Angka ini menjadi dasar Subjek Penelitian di Bab III.'
              : 'Berapa total populasi penelitianmu? Angka ini menjadi dasar populasi & perhitungan sampel di Bab III (≥100: rumus Slovin; <100: sampling jenuh tanpa rumus).';
          const desain = campuran ? DESAIN_CAMPURAN : kual ? DESAIN_KUALITATIF : pustakaOnly ? DESAIN_PUSTAKA : DESAIN_KUANTITATIF;
          const alat = kual ? ALAT_KUALITATIF : ALAT_KUANTITATIF;
          const lemeshow = wajib;
          const disabled = wajib && !mTak && !/^\d+$/.test(mPop.trim());
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDlgMetode(false)}>
              <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-bold text-lg text-text-primary">{judulJumlah}</h3>
                </div>
                <p className="mb-4 text-sm text-text-secondary">{tanyaJumlah}</p>
                <input
                  type="number"
                  min={1}
                  value={mPop}
                  onChange={(e) => setMPop(e.target.value)}
                  placeholder={kual ? 'mis. 12' : pustakaOnly ? 'mis. 25' : 'mis. 285'}
                  disabled={mTak}
                  autoFocus
                  className={`h-11 w-full rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary disabled:bg-bg-surface-hover disabled:text-text-muted ${lemeshow ? 'mb-2' : 'mb-4'}`}
                />
                {lemeshow && (
                  <div className="mb-4 rounded-lg border border-border-strong bg-bg-surface-hover p-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-text-primary">
                      <input type="checkbox" checked={mTak} onChange={(e) => setMTak(e.target.checked)} />
                      Populasi tidak diketahui — hitung sampel dengan rumus Lemeshow
                    </label>
                    {mTak && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <label className="space-y-1">
                          <span className="text-text-secondary">Kepercayaan</span>
                          <select value={mKepercayaan} onChange={(e) => setMKepercayaan(e.target.value)} className="h-9 w-full rounded border border-border-strong bg-bg-surface px-2 text-text-primary">
                            <option value="90">90%</option>
                            <option value="95">95%</option>
                            <option value="99">99%</option>
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-text-secondary">Margin error</span>
                          <select value={mMargin} onChange={(e) => setMMargin(e.target.value)} className="h-9 w-full rounded border border-border-strong bg-bg-surface px-2 text-text-primary">
                            <option value="0.10">10%</option>
                            <option value="0.05">5%</option>
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-text-secondary">Proporsi</span>
                          <select value={mProporsi} onChange={(e) => setMProporsi(e.target.value)} className="h-9 w-full rounded border border-border-strong bg-bg-surface px-2 text-text-primary">
                            <option value="0.5">P 0,5</option>
                            <option value="0.3">P 0,3</option>
                            <option value="0.2">P 0,2</option>
                            <option value="0.1">P 0,1</option>
                          </select>
                        </label>
                      </div>
                    )}
                    <p className="mt-2 text-[11px] text-text-muted">95% + 10% + P 0,5 → 97 responden · 95% + 5% + P 0,5 → 385 responden. Perhitungan ditulis lengkap di Bab III.</p>
                  </div>
                )}
                <div className="mb-4 space-y-1.5">
                  <label className="text-sm font-semibold text-text-primary" htmlFor="desain-pen">Jenis / desain penelitian</label>
                  <select id="desain-pen" value={mDesain} onChange={(e) => setMDesain(e.target.value)} className="h-11 w-full rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary">
                    <option value="">✨ Sarankan AI (otomatis, sesuai judul)</option>
                    {desain.map((o) => (
                      <option key={o.label} value={o.label}>{o.label} — {o.fokus}</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-muted">
                    {mDesain
                      ? 'Dipakai sebagai fokus metodologismu di Bab III.'
                      : 'Biarkan "Sarankan AI" agar AI memilih yang paling sesuai, atau pilih sendiri.'}
                  </p>
                </div>
                <div className="mb-5 space-y-1.5">
                  <label className="text-sm font-semibold text-text-primary" htmlFor="alat-olah">{kual ? 'Alat bantu analisis' : 'Alat olah data'}</label>
                  <select id="alat-olah" value={mAlat} onChange={(e) => setMAlat(e.target.value)} className="h-11 w-full rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary">
                    {alat.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {mAlat === 'Lainnya' && (
                    <input type="text" value={mAlatLain} onChange={(e) => setMAlatLain(e.target.value)} placeholder="Tulis nama perangkat lunak (mis. GeoGebra, Excel)" className="mt-2 h-11 w-full rounded-lg border border-border-strong bg-bg-surface px-3 text-sm text-text-primary" />
                  )}
                  <p className="text-xs text-text-muted">Bagian Teknik Analisis Data menyesuaikan alat ini.</p>
                </div>
                {err && <p className="mb-2 text-sm text-accent-red">{err}</p>}
                <div className="flex flex-wrap justify-end gap-2">
                  <button onClick={() => konfirmasiMetodologi(true)} className="border border-border-strong rounded-lg px-4 py-2.5 text-sm font-bold text-text-primary">Lewati</button>
                  <button onClick={() => konfirmasiMetodologi(false)} disabled={disabled} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    <Ico n="sparkles" /> Generate Bab III Metodologi
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {showDisc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl max-w-md w-full p-6 text-center space-y-3">
              <h2 className="font-bold text-text-primary">⚠️ Perhatian</h2>
              <p className="text-sm text-text-secondary">Hasil ini adalah <strong>DRAF AWAL</strong> AI. Wajib didalami, dikritisi, diverifikasi fakta/data/referensinya, dan direvisi menyeluruh — tanggung jawab karya akhir ada pada Anda (Permendiknas No. 17/2010). <Link href="/dashboard/tutorial" className="text-brand-primary underline">Selengkapnya</Link></p>
              <button onClick={closeDisc} className="bg-brand-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold">Saya mengerti</button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
