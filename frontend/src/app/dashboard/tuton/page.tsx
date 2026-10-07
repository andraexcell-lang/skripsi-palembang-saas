'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { aiGenerate, apiDownloadBjt, isInsufficientCredits } from '@/lib/api';

type Item = { id: string; jenis: 'Tugas' | 'Diskusi'; soal: string; jawaban: string };

// 3 langkah card persis paritas §3.26 (screenshot 23-affiliate.png = halaman Tuton)
const LANGKAH: [string, string, string][] = [
  ['Langkah 1', 'Tempel lembar soal', 'Tugas atau Diskusi, apa adanya dari e-learning.'],
  ['Langkah 2', 'Tulis jawaban', '3 kredit per Tugas, 1 per Diskusi.'],
  ['Langkah 3', 'Unduh BJT', 'Berkas Word bersampul resmi, satu per item.'],
];

const KEY = 'sp-tuton';

export default function TutonPage() {
  const [mkNama, setMkNama] = useState('');
  const [mkKode, setMkKode] = useState('');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [upbjj, setUpbjj] = useState('');
  const [masaUjian, setMasaUjian] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [workspace, setWorkspace] = useState(false);
  const [soalBaru, setSoalBaru] = useState('');
  const [jenisBaru, setJenisBaru] = useState<'Tugas' | 'Diskusi'>('Tugas');
  const [err, setErr] = useState('');
  const [needsTopup, setNeedsTopup] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [unduh, setUnduh] = useState(false);

  // Persistensi lokal — satu mata kuliah satu proyek
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setMkNama(s.mkNama || ''); setMkKode(s.mkKode || '');
        setNama(s.nama || ''); setNim(s.nim || ''); setUpbjj(s.upbjj || ''); setMasaUjian(s.masaUjian || '');
        setItems(Array.isArray(s.items) ? s.items : []); setWorkspace(!!s.workspace);
      }
    } catch { /* abaikan */ }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ mkNama, mkKode, nama, nim, upbjj, masaUjian, items, workspace }));
    } catch { /* abaikan */ }
  }, [mkNama, mkKode, nama, nim, upbjj, masaUjian, items, workspace]);

  function buatWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!mkNama.trim() || !nama.trim() || !nim.trim()) {
      setErr('Nama mata kuliah, nama lengkap, dan NIM wajib diisi.');
      return;
    }
    setWorkspace(true);
  }

  function tambahSoal(e: React.FormEvent) {
    e.preventDefault();
    if (!soalBaru.trim()) return;
    setItems((s) => [...s, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, jenis: jenisBaru, soal: soalBaru.trim(), jawaban: '' }]);
    setSoalBaru('');
  }

  async function tulisJawaban(it: Item) {
    setErr(''); setNeedsTopup(false); setBusyId(it.id);
    const prompt = it.jenis === 'Tugas'
      ? `Berperanlah sebagai mahasiswa Universitas Terbuka yang mengerjakan Tugas tutorial mata kuliah ${mkNama}. Tulis jawaban lengkap dan terstruktur (pendahuluan singkat, pembahasan, simpulan) dengan gaya akademik rapi, siap dikumpulkan, tanpa salam/pembuka basa-basi.\n\nSoal:\n${it.soal}`
      : `Berperanlah sebagai mahasiswa Universitas Terbuka yang membalas Diskusi forum mata kuliah ${mkNama}. Tulis jawaban diskusi 250-400 kata, terstruktur (pembuka, poin-poin pembahasan, penutup reflektif), gaya akademik tapi mengalir.\n\nSoal:\n${it.soal}`;
    try {
      const r = await aiGenerate(prompt, it.jenis === 'Tugas' ? 'tuton_tugas' : 'tuton_diskusi');
      const teks = r.result ?? r.text ?? '';
      setItems((s) => s.map((x) => (x.id === it.id ? { ...x, jawaban: String(teks) } : x)));
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      setErr(e.message);
    }
    setBusyId('');
  }

  async function unduhBjt() {
    setErr(''); setNeedsTopup(false);
    const siap = items.filter((i) => i.jawaban.trim());
    if (siap.length === 0) { setErr('Belum ada jawaban yang bisa diunduh — tulis jawaban dulu.'); return; }
    setUnduh(true);
    try {
      await apiDownloadBjt({ mataKuliah: mkNama, kode: mkKode, nama, nim, upbjj, masaUjian, items: siap });
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      setErr(e.message);
    }
    setUnduh(false);
  }

  const inputCls = 'w-full bg-bg-surface border border-border-strong rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none';

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6 overflow-y-auto pb-24">
        <div className="flex items-center gap-3">
          <span className="text-brand-primary">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Tuton UT</h1>
            <p className="text-text-secondary text-sm">Tugas & Diskusi Tutorial Online Universitas Terbuka</p>
          </div>
        </div>

        {/* 3 langkah */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LANGKAH.map(([langkah, judul, desc]) => (
            <div key={langkah} className="bg-bg-surface border border-border-subtle rounded-xl p-5">
              <div className="text-sm font-bold text-brand-primary mb-1">{langkah}</div>
              <h3 className="font-bold text-text-primary">{judul}</h3>
              <p className="text-sm text-text-secondary mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl border border-brand-primary/30 bg-brand-primary/10 p-4 text-sm text-text-primary">
          <svg className="shrink-0 mt-0.5 text-brand-primary" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <p>
            Halaman ini untuk <strong>Tugas &amp; Diskusi tutorial online</strong> Universitas Terbuka — satu mata kuliah satu proyek. Sedang menulis <em>skripsi</em>?{' '}
            <Link href="/dashboard/proyek" className="font-bold text-brand-primary hover:underline">Buat proyek skripsi di sini.</Link>
          </p>
        </div>

        <form onSubmit={buatWorkspace} className="space-y-6">
          {/* Mata kuliah */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-text-primary">Mata kuliah</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text-primary mb-2" htmlFor="tuton-mk">Nama mata kuliah *</label>
                <input id="tuton-mk" required value={mkNama} onChange={(e) => setMkNama(e.target.value)} placeholder="mis. Perilaku Organisasi" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2" htmlFor="tuton-kode">Kode mata kuliah</label>
                <input id="tuton-kode" value={mkKode} onChange={(e) => setMkKode(e.target.value)} placeholder="mis. EKMA4158" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Identitas sampul BJT */}
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-bold text-text-primary">Identitas di sampul BJT</h2>
              <p className="text-sm text-text-secondary">Tercetak di halaman depan Buku Jawaban Tugas. Bisa diubah nanti.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2" htmlFor="tuton-nama">Nama lengkap *</label>
                <input id="tuton-nama" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="mis. Rina Wijaya" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2" htmlFor="tuton-nim">NIM *</label>
                <input id="tuton-nim" required value={nim} onChange={(e) => setNim(e.target.value)} placeholder="mis. 0304567891" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2" htmlFor="tuton-upbjj">UPBJJ</label>
                <input id="tuton-upbjj" value={upbjj} onChange={(e) => setUpbjj(e.target.value)} placeholder="mis. 21 / Jakarta" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2" htmlFor="tuton-masa">Masa ujian</label>
                <input id="tuton-masa" value={masaUjian} onChange={(e) => setMasaUjian(e.target.value)} placeholder="mis. 2026.2" className={inputCls} />
              </div>
            </div>
          </div>

          {!workspace && (
            <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm px-5 py-3 rounded-lg transition-colors">Buat &amp; tempel soal →</button>
          )}
        </form>

        {err && <p className="text-sm text-accent-red">{err}</p>}
        {needsTopup && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 text-sm flex justify-between items-center">
            <span>Kredit habis.</span>
            <Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Pilih Paket →</Link>
          </div>
        )}

        {/* Workspace: tempel soal + tulis jawaban + unduh */}
        {workspace && (
          <div className="space-y-6">
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
              <h2 className="font-bold text-text-primary">Tempel lembar soal</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <textarea rows={4} value={soalBaru} onChange={(e) => setSoalBaru(e.target.value)} placeholder={'Tempel soal Tugas/Diskusi apa adanya dari e-learning...\nContoh: Jelaskan konsep budaya organisasi dan berikan contoh penerapannya!'} className={inputCls + ' flex-1'} />
                <div className="flex sm:flex-col gap-3 sm:w-44 shrink-0">
                  <select value={jenisBaru} onChange={(e) => setJenisBaru(e.target.value as 'Tugas' | 'Diskusi')} className={inputCls} aria-label="Jenis soal">
                    <option value="Tugas">Tugas (3 kredit)</option>
                    <option value="Diskusi">Diskusi (1 kredit)</option>
                  </select>
                  <button onClick={tambahSoal} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm px-4 py-3 rounded-lg transition-colors whitespace-nowrap">Simpan soal</button>
                </div>
              </div>
              {items.length > 0 && (
                <button onClick={unduhBjt} disabled={unduh} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm px-5 py-3 rounded-lg transition-colors disabled:opacity-50">
                  {unduh ? 'Menyiapkan BJT…' : `Unduh BJT (${items.filter((i) => i.jawaban.trim()).length} jawaban)`}
                </button>
              )}
            </div>

            {items.map((it, i) => (
              <div key={it.id} className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-text-primary">
                    <span className={`mr-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${it.jenis === 'Tugas' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-bg-surface-hover text-text-secondary'}`}>{it.jenis}</span>
                    Butir {i + 1}
                  </div>
                  <button onClick={() => setItems((s) => s.filter((x) => x.id !== it.id))} className="text-xs text-text-muted hover:text-accent-red">Hapus</button>
                </div>
                <p className="text-sm text-text-secondary whitespace-pre-wrap bg-bg-base border border-border-subtle rounded-lg p-3">{it.soal}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => tulisJawaban(it)} disabled={busyId === it.id} className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {busyId === it.id ? 'Menulis…' : `Tulis jawaban (${it.jenis === 'Tugas' ? 3 : 1} kredit)`}
                  </button>
                  {it.jawaban && <span className="text-xs text-text-muted">Bisa disunting sebelum diunduh.</span>}
                </div>
                <textarea rows={8} value={it.jawaban} onChange={(e) => setItems((s) => s.map((x) => (x.id === it.id ? { ...x, jawaban: e.target.value } : x)))} placeholder="Jawaban muncul di sini (bisa ditulis manual juga)…" className={inputCls} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
