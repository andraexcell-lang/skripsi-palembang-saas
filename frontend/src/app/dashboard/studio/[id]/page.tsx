'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiPostStream, isInsufficientCredits } from '@/lib/api';

const BABS = [
  { id: 'bab1', label: 'Bab I: Pendahuluan' },
  { id: 'bab2', label: 'Bab II: Tinjauan Pustaka' },
  { id: 'bab3', label: 'Bab III: Metodologi' },
  { id: 'bab4', label: 'Bab IV: Hasil & Pembahasan' },
  { id: 'bab5', label: 'Bab V: Penutup' },
];

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
    if (!active) return;
    setLoading(true); setErr('');
    try {
      const r = await apiPost(`/api/projects/${id}/tambah-sitasi`, { bab: active });
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

  function renderSitasi(body: string) {
    const parts = body.split(/(\([A-ZÀ-Ž][^()]{1,80}?,\s?\d{4}[a-z]?\))/g);
    return parts.map((seg, i) => {
      if (i % 2 === 1) {
        const ri = findRef(seg);
        return (
          <a key={i} href={ri >= 0 ? `#${refId(refs[ri], ri)}` : '#dapus'} title={ri >= 0 ? `${refs[ri].title} — klik untuk verifikasi` : 'Verifikasi di Daftar Pustaka'} className="text-brand-primary underline decoration-dotted font-semibold">
            {seg}
          </a>
        );
      }
      return <span key={i}>{seg}</span>;
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
  }
  useEffect(() => { load(); }, [id]);

  async function generate() {
    setLoading(true); setErr(''); setNeedsTopup(false);
    try {
      const r = await apiPostStream(`/api/projects/${id}/generate-bab-stream`, { bab: active, studi: active === 'bab2' ? studi : undefined }, (t) => {
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

  function downloadWord() {
    const label = BABS.find((b) => b.id === active)?.label || active;
    const ident = proyek?.identitas || {};
    const logoImg = ident.logo ? `<img src="${ident.logo}" width="90"/><br/>` : '';
    const cover = (ident.nama || ident.kampus || proyek?.judul)
      ? `<div style="text-align:center">${logoImg}<h2>${String(proyek?.judul || '').replace(/</g, '&lt;')}</h2><br/><p>${String(ident.nama || '').replace(/</g, '&lt;')}</p><p>NIM: ${String(ident.nim || '').replace(/</g, '&lt;')}</p><p>${String(ident.kampus || '').replace(/</g, '&lt;')} — ${String(ident.jurusan || '').replace(/</g, '&lt;')} — ${String(ident.fakultas || '').replace(/</g, '&lt;')}</p><br style="mso-special-character:line-break;page-break-before:always"/></div>`
      : '';
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${label}</title></head><body>${cover}<h1>${label}</h1>${String(text).split('\n').map((p) => `<p>${p.replace(/</g, '&lt;')}</p>`).join('')}</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${active}-${String(id).slice(0, 8)}.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const text = proyek?.content?.[active] || '';
  return (
    <div className="flex h-full bg-bg-base">
      <div className="w-56 border-r border-border-subtle p-4 hidden lg:flex flex-col gap-1">
        {BABS.map((b) => (
          <button key={b.id} onClick={() => setActive(b.id)} className={`text-left px-3 py-2 rounded-lg text-sm ${active === b.id ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-text-secondary'}`}>
            {b.label} {proyek?.content?.[b.id] ? '✓' : ''}
          </button>
        ))}
      </div>
      <div className="flex-1 p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
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
            <select value={studi} onChange={(e) => setStudi(e.target.value)} className="bg-bg-surface border border-border-strong rounded-lg p-2 text-sm text-text-primary">
              {['10', '15', '20', '25', '30'].map((n) => <option key={n} value={n}>{n} (1 paragraf/studi)</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-3 flex-wrap">
          <button onClick={generate} disabled={loading} className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
            {loading ? 'Menggenerate...' : `Generate ${BABS.find((b) => b.id === active)?.label}`}
          </button>
          {text && (
            <button onClick={downloadWord} className="border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover">
              Unduh Word
            </button>
          )}
          <button onClick={downloadRis} className="border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover" title="Format Mendeley/Zotero">
            Unduh RIS
          </button>
          <button onClick={prediksiSoal} disabled={soalLoading || !text} className="border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover disabled:opacity-50" title="1 kredit">
            {soalLoading ? 'Menyusun...' : 'Prediksi Soal'}
          </button>
          <button onClick={tambahSitasi} disabled={loading || !text} className="border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover disabled:opacity-50" title="Gratis">
            Tambah Sitasi
          </button>
          <button onClick={generateAbstrak} disabled={abstrakLoading} className="border border-border-strong bg-bg-surface px-5 py-2.5 rounded-lg text-sm font-bold text-text-primary hover:bg-bg-surface-hover disabled:opacity-50" title="1 kredit">
            {abstrakLoading ? '...' : 'Abstrak ID+EN'}
          </button>
        </div>
        {soal && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm text-text-primary whitespace-pre-wrap">
            <h3 className="font-bold text-base mb-3 text-brand-primary">Prediksi Soal Sidang</h3>
            {soal}
          </div>
        )}
        {proyek?.content?.abstrak && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm text-text-primary whitespace-pre-wrap">
            <h3 className="font-bold text-base mb-3 text-brand-primary">Abstrak & Abstract</h3>
            {proyek.content.abstrak}
          </div>
        )}
        {refs.length > 0 && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm">
            <h3 className="font-bold text-base mb-3 text-text-primary">Referensi Terverifikasi</h3>
            <p className="text-xs text-text-muted mb-3">Klik sitasi biru di naskah untuk melompat ke entri ini.</p>
            {refs.map((r: any, i: number) => (
              <div key={i} id={refId(r, i)} className="text-xs border-t border-border-subtle py-2 scroll-mt-24">
                <span className="font-bold text-text-primary">{r.authors} ({r.year}). </span>
                <span className="text-text-secondary">{r.title}. </span>
                {r.doi && <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer" className="text-brand-primary">DOI</a>}
              </div>
            ))}
          </div>
        )}
        {text ? <div id="dapus" className="bg-bg-surface border border-border-subtle rounded-xl p-6 text-sm text-text-primary whitespace-pre-wrap scroll-mt-24">{renderSitasi(text)}</div>
          : <p className="text-sm text-text-muted">Belum ada isi untuk bab ini. Klik generate (10 kredit).</p>}
      </div>
    </div>
  );
}
