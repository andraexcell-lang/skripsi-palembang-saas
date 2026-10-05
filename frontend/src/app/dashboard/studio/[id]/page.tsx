'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiPostStream, apiUpload, apiDownloadPptx, isInsufficientCredits } from '@/lib/api';

const BABS = [
  { id: 'bab1', label: 'Bab I: Pendahuluan', gen: 'Bab I: Pendahuluan' },
  { id: 'bab2', label: 'Bab II: Tinjauan Pustaka', gen: 'Bab II: Tinjauan Pustaka' },
  { id: 'bab3', label: 'Bab III: Metodologi', gen: 'Bab III: Metodologi' },
  { id: 'bab4', label: 'Bab IV: Hasil & Pembahasan', gen: 'Bab IV: Hasil & Pembahasan' },
  { id: 'bab5', label: 'Bab V: Penutup', gen: 'Bab V: Penutup' },
  { id: 'lampiran', label: 'Bab VI: Lampiran', gen: 'Lampiran' },
];

const SUB_LAMPIRAN_BAWAAN = ['6.1 Kisi-Kisi Instrumen Penelitian', '6.2 Pernyataan Responden'];

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

  // Sesuaikan Skripsi
  const [sesLoading, setSesLoading] = useState(false);
  const [sesHasil, setSesHasil] = useState<any>(null);
  // Tinjau Hasil
  const [tinjauLoading, setTinjauLoading] = useState(false);
  const [tinjau, setTinjau] = useState<any>(null);
  // Cek Sitasi
  const [sitasiLoading, setSitasiLoading] = useState(false);
  const [sitasi, setSitasi] = useState<any>(null);
  const [sitasiOpen, setSitasiOpen] = useState(false);
  // Unggah Artikel Sendiri
  const [showUpload, setShowUpload] = useState(false);
  const [upFile, setUpFile] = useState<File | null>(null);
  const [upLoading, setUpLoading] = useState(false);
  const [upMsg, setUpMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const ROMAWI_HURUF = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function fmtHeading(line: string): string {
    if (nomor !== 'A') return line;
    const m = line.match(/^(\d+)\.(\d+)\s+(.*)$/);
    if (m) {
      const a = ROMAWI_HURUF[(parseInt(m[1], 10) - 1 + 26) % 26] || m[1];
      return `${a}. ${m[2]}. ${m[3]}`;
    }
    return line;
  }

  function cleanMd(s: string): string {
    return s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2').trim();
  }

  function renderDoc(body: string) {
    const lines = body.split('\n');
    const out: any[] = [];
    let i = 0;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || /^---+$/.test(t)) { i++; continue; }
      if (/^\|.+\|$/.test(t) && i + 1 < lines.length && /^\|[\s:\-|]+\|$/.test(lines[i + 1].trim())) {
        const head = t.split('|').map((c) => c.trim()).filter(Boolean);
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
          rows.push(lines[i].trim().split('|').map((c) => c.trim()).filter(Boolean));
          i++;
        }
        out.push(
          <table key={`tbl-${i}`} className="w-full text-xs border-collapse my-4">
            <thead><tr>{head.map((h, k) => <th key={k} className="border border-border-strong px-2 py-1 text-left">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} className="border border-border-strong px-2 py-1">{c}</td>)}</tr>)}</tbody>
          </table>
        );
        continue;
      }
      if (/^(BAB [IVX]+|DAFTAR PUSTAKA|ABSTRAK|ABSTRACT|KATA PENGANTAR|DAFTAR ISI|DAFTAR TABEL|LEMBAR .*)$/i.test(cleanMd(t))) {
        out.push(<h3 key={i} className="text-center font-bold text-base mt-6 mb-3">{cleanMd(t)}</h3>);
      } else if (/^\d+\.\d+\s+\S/.test(cleanMd(t))) {
        out.push(<h4 key={i} className="font-bold text-sm mt-5 mb-2">{fmtHeading(cleanMd(t))}</h4>);
      } else {
        out.push(<p key={i} className="text-justify indent-8 mb-3 leading-relaxed">{renderSitasi(cleanMd(t), `l${i}-`)}</p>);
      }
      i++;
    }
    return out;
  }
  const [showDisc, setShowDisc] = useState(false);

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
        return (
          <a key={`${prefix}${i}`} href={ri >= 0 ? `#${refId(refs[ri], ri)}` : '#dapus'} title={ri >= 0 ? 'Lihat bukti kutipan' : 'Verifikasi di Daftar Pustaka'} className="text-brand-primary underline decoration-dotted font-semibold">
            {seg}
          </a>
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
    try {
      const r = await apiGet(`/api/projects/${id}`);
      setProyek(r.item);
    } catch (e: any) { setErr(e.message); }
    try {
      const r = await apiGet(`/api/projects/${id}/references`);
      setRefs(r.items || []);
    } catch { /* abaikan */ }
    try {
      const r = await apiGet('/api/projects/meta/outline');
      setOutline(r.outline || null);
    } catch { /* abaikan */ }
  }
  useEffect(() => { load(); }, [id]);

  async function generate(force = false) {
    if (active === 'pustaka') return;
    setLoading(true); setErr(''); setNeedsTopup(false);
    try {
      const r = await apiPostStream(`/api/projects/${id}/generate-bab-stream${force ? '?ulang=1' : ''}`, { bab: active, studi: active === 'bab2' ? studi : undefined, force }, (t) => {
        setProyek((p: any) => ({ ...p, content: { ...(p?.content || {}), [active]: t } }));
      });
      if (r.cached) setErr('');
      await load();
    } catch (e: any) {
      setErr(e.message);
      if (isInsufficientCredits(e)) setNeedsTopup(true);
    }
    setLoading(false);
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

  function downloadRis() {
    apiGet(`/api/projects/${id}/references`).then((r: any) => {
      const ris = (r.items || []).map((x: any) => {
        const aus = String(x.authors || '').split(';').map((a: string) => `AU  - ${a.trim()}`).join('\n');
        return `TY  - JOUR\n${aus}\nPY  - ${x.year || ''}\nTI  - ${x.title || ''}\nDO  - ${x.doi || ''}\nUR  - ${x.url || ''}\nER  - `;
      }).join('\n\n');
      const blob = new Blob([ris], { type: 'application/x-research-info-systems' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'referensi.ris';
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
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'skripsi.docx';
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
  const metaBab = BABS.find((b) => b.id === active);
  const isPustaka = active === 'pustaka';
  const subsLampiran = outline?.lampiran?.subs?.length ? outline.lampiran.subs : SUB_LAMPIRAN_BAWAAN;

  const btnUtil = 'border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover disabled:opacity-50';

  return (
    <div className="flex h-full bg-bg-base">
      <div className="w-56 border-r border-border-subtle p-4 hidden lg:flex flex-col gap-1 overflow-y-auto">
        {BABS.map((b) => (
          <button key={b.id} onClick={() => setActive(b.id)} className={`text-left px-3 py-2 rounded-lg text-sm ${active === b.id ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`}>
            {b.label} {proyek?.content?.[b.id] ? '✓' : ''}
          </button>
        ))}
        <button onClick={() => setActive('pustaka')} className={`text-left px-3 py-2 rounded-lg text-sm ${isPustaka ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'}`}>
          Pustaka ({refs.length})
        </button>
        <Link href="/dashboard/lab-revisi" className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover">
          Revisi
        </Link>
      </div>

      <div className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
        <h1 className="text-xl font-bold text-text-primary">{proyek?.judul || 'Memuat...'}</h1>
        <p className="text-xs text-text-secondary">{proyek?.jenis} · {proyek?.metode} · 10 kredit/bab</p>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        {needsTopup && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm text-text-primary flex items-center justify-between gap-3">
            <span>Kredit habis. Top-up untuk lanjut generate.</span>
            <Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap">Pilih Paket →</Link>
          </div>
        )}
        <div className="bg-amber-50 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-400/40 rounded-lg p-3 text-[11px] text-amber-900 dark:text-amber-200">
          ⚠️ Hasil ini adalah <strong>DRAF AWAL</strong> AI. Wajib didalami, dikritisi, diverifikasi fakta/data/referensinya, dan direvisi menyeluruh — tanggung jawab karya akhir ada pada Anda (Permendiknas No. 17/2010 tentang Pencegahan Plagiat).
        </div>

        {active === 'bab2' && (
          <div className="flex items-center gap-2 text-sm">
            <label className="text-text-secondary text-xs font-bold">Studi terdahulu:</label>
            <select value={studi} onChange={(e) => setStudi(e.target.value)} className="bg-bg-surface border border-border-strong rounded-lg p-2 text-sm text-text-primary" title='Berapa studi yang dibahas di "Penelitian Terdahulu". Berlaku saat sub-bab itu ditulis ulang.'>
              <option value="10">Studi terdahulu: 10 (bawaan)</option>
              {['15', '20', '25', '30', '35', '40', '45', '50'].map((n) => <option key={n} value={n}>Studi terdahulu: {n} (1 paragraf/studi)</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-3 items-center flex-wrap">
          <select value={nomor} onChange={(e) => setNomor(e.target.value)} className="bg-bg-surface border border-border-strong rounded-lg p-2.5 text-sm text-text-primary" title="Format penomoran sub-bab">
            <option value="1.1">Nomor 1.1 / 1.1.1</option>
            <option value="A">Nomor A. / 1. / a.</option>
          </select>
        </div>

        <div className="flex gap-3 flex-wrap">
          {!isPustaka && (
            <button onClick={() => generate(!!text)} disabled={loading} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
              {loading ? 'Menggenerate...' : text ? `Generate Ulang ${metaBab?.gen}` : `Generate ${metaBab?.gen}`}
            </button>
          )}
          {text && (
            <button onClick={downloadWord} className="border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover">
              Unduh Word
            </button>
          )}
          <button onClick={downloadRis} className={btnUtil} title="Unduh Daftar Pustaka (.ris) — siap impor ke Mendeley/Zotero">
            Unduh RIS
          </button>
          <button onClick={() => { setShowUpload((v) => !v); }} className={btnUtil} title="Tambahkan artikel PDF milikmu sendiri sebagai referensi (maksimal 10)">
            Unggah Artikel
          </button>
          {!isPustaka && (
            <>
              <button onClick={prediksiSoal} disabled={soalLoading || !text} className={btnUtil} title="Daftar pertanyaan & jawaban dalam bentuk teks. Ingin berlatih bicara dengan penguji AI? Buka menu Simulasi Sidang.">
                {soalLoading ? 'Menyusun...' : 'Prediksi Soal'}
              </button>
              <button onClick={tambahSitasi} disabled={loading || !text} className={btnUtil} title="GRATIS">
                Tambah Sitasi <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">GRATIS</span>
              </button>
            </>
          )}
          <button onClick={generateAbstrak} disabled={abstrakLoading} className={btnUtil} title="Abstrak Indonesia + Inggris (1 kredit)">
            {abstrakLoading ? '...' : 'Abstrak ID+EN'}
          </button>
          <button onClick={cekSitasi} disabled={sitasiLoading} className={btnUtil} title="Deteksi sitasi palsu/yatim — GRATIS, tanpa kredit">
            {sitasiLoading ? 'Memeriksa...' : 'Cek Sitasi'}
          </button>
          <button onClick={tinjauHasil} disabled={tinjauLoading} className={btnUtil} title="Catatan revisi per bab: kelebihan, kekurangan & pertanyaan penguji (5 kredit)">
            {tinjauLoading ? 'Meninjau...' : 'Tinjau Hasil'}
          </button>
          <button onClick={downloadPpt} disabled={pptLoading} className={btnUtil} title="Buat slide presentasi (.pptx) dari isi proyek ini">
            {pptLoading ? 'Membuat...' : 'PPT'}
          </button>
          <Link href="/dashboard/plagiasi" className={`${btnUtil} inline-block`} title="Cek Plagiasi">
            Cek Plagiasi
          </Link>
          <button onClick={sesuaikan} disabled={sesLoading || !proyek?.content?.bab1} className={btnUtil} title="Rapikan tujuan, hipotesis, kerangka konsep & Bab III agar sesuai rumusan masalah terbaru">
            {sesLoading ? 'Menyesuaikan...' : 'Sesuaikan Skripsi'}
          </button>
        </div>

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

        {refs.length > 0 && !isPustaka && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm">
            <h3 className="font-bold text-base mb-3 text-text-primary">Referensi Terverifikasi</h3>
            <p className="text-xs text-text-muted mb-3">Klik sitasi biru di naskah untuk melompat ke entri ini. Buka tab <button onClick={() => setActive('pustaka')} className="text-brand-primary underline">Pustaka ({refs.length})</button> untuk daftar lengkapnya.</p>
            {refs.slice(0, 8).map((r: any, i: number) => (
              <div key={i} id={refId(r, i)} className="text-xs border-t border-border-subtle py-2 scroll-mt-24">
                <span className="font-bold text-text-primary">{r.authors} ({r.year}). </span>
                <span className="text-text-secondary">{r.title}. </span>
                {r.doi && <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer" className="text-brand-primary">DOI</a>}
              </div>
            ))}
          </div>
        )}

        {proyek?.metode === 'Kuantitatif' && active === 'bab2' && text && !/hipotesis/i.test(text) && (
          <div className="bg-amber-50 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-400/40 rounded-lg p-4 text-xs text-amber-900 dark:text-amber-200">
            <strong>Penelitianmu belum punya Hipotesis.</strong> Sub-bab Hipotesis sudah ada di kerangka tetapi belum ditulis. Generate bab ini supaya lengkap — penguji hampir selalu menanyakannya pada penelitian kuantitatif.
          </div>
        )}

        {!isPustaka && (text
          ? <div id="dapus" className="bg-white dark:bg-bg-surface text-slate-900 dark:text-text-primary border border-border-subtle rounded-xl p-4 lg:p-8 text-sm scroll-mt-24 shadow-sm" style={{ fontFamily: "'Times New Roman', Georgia, serif" }}>{renderDoc(text)}</div>
          : active !== 'lampiran' && <p className="text-sm text-text-muted">Belum ada isi untuk bab ini. Klik generate (10 kredit).</p>
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
  );
}
