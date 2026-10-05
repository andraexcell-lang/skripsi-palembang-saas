'use client';
import { useEffect, useState } from 'react';
import { aiGenerate, apiGet, apiPost } from '@/lib/api';

export default function AIWriterPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [id, setId] = useState('');
  const [title, setTitle] = useState('Dokumen Baru');
  const [materi, setMateri] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [savedAt, setSavedAt] = useState('');

  async function loadList() {
    try {
      const r = await apiGet('/api/docs');
      setDocs(r.items);
    } catch { /* abaikan */ }
  }
  useEffect(() => { loadList(); }, []);

  async function openDoc(did: string) {
    const r = await apiGet(`/api/docs/${did}`);
    setId(r.item.id); setTitle(r.item.title); setMateri(r.item.content || '');
  }

  async function newDoc() {
    const r = await apiPost('/api/docs', { title: 'Dokumen Baru' });
    setId(r.item.id); setTitle(r.item.title); setMateri('');
    loadList();
  }

  async function save(silent = true) {
    if (!id) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (t) headers.Authorization = `Bearer ${t}`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/docs/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ title, content: materi }),
      });
      if (!res.ok) throw new Error('gagal simpan');
      setSavedAt(new Date().toLocaleTimeString('id-ID'));
      if (!silent) setMsg('Tersimpan.');
      loadList();
    } catch (e: any) { if (!silent) setMsg(e.message); }
  }

  useEffect(() => {
    if (!id) return;
    const h = setTimeout(() => save(true), 3000);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materi, title]);

  async function lanjutkan() {
    if (!materi.trim() || loading) return;
    setLoading(true); setMsg('');
    try {
      const data = await aiGenerate(`Lanjutkan tulisan akademik berikut secara logis dan formal (tanpa sitasi fiktif):\n\n${materi.slice(-3000)}`, 'revisi');
      setMateri(materi + '\n\n' + data.result);
      await save(true);
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }

  async function tambahSitasi() {
    const sel = window.getSelection()?.toString().trim();
    if (!sel) return setMsg('Blok dulu sebuah kalimat, lalu klik Tambah Sitasi.');
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API}/api/files/referensi?q=${encodeURIComponent(sel.slice(0, 150))}`);
      const j = await res.json();
      const r = (j.items || [])[0];
      if (!r) return setMsg('Tidak ditemukan artikel pendukung.');
      const cite = ` (${r.authors.split(';')[0].split(',')[0].trim().split(' ').slice(-1)[0]} et al., ${r.year})`;
      setMateri(materi.replace(sel, sel + cite));
      setMsg(`Sitasi ditambahkan: ${r.title.slice(0, 60)}...`);
    } catch (e: any) { setMsg(e.message); }
    setLoading(false);
  }

  async function hapus() {
    if (!id || !confirm('Hapus dokumen ini?')) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token || '';
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/docs/${id}`, { method: 'DELETE', headers: t ? { Authorization: `Bearer ${t}` } : {} });
    } catch { /* abaikan */ }
    setId(''); setTitle('Dokumen Baru'); setMateri('');
    loadList();
  }

  return (
    <div className="flex h-full bg-bg-base">
      <div className="w-56 border-r border-border-subtle p-4 hidden md:block overflow-y-auto">
        <button onClick={newDoc} className="w-full bg-brand-primary text-white py-2 rounded-lg text-sm font-bold mb-3">+ Dokumen Baru</button>
        {docs.map((d: any) => (
          <button key={d.id} onClick={() => openDoc(d.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${id === d.id ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-text-secondary hover:bg-bg-surface-hover'}`}>
            {d.title}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-3 overflow-y-auto">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul dokumen" className="w-full bg-transparent text-xl font-bold text-text-primary focus:outline-none" />
        <div className="text-xs text-text-muted">{savedAt ? `Tersimpan otomatis ${savedAt}` : id ? 'Mengetik otomatis tersimpan...' : 'Buat/buka dokumen dulu.'}</div>
        <textarea value={materi} onChange={(e) => setMateri(e.target.value)} rows={18} placeholder="Tulis atau tempel teks. Blok kalimat → Tambah Sitasi." className="w-full bg-bg-surface border border-border-subtle rounded-xl p-4 text-sm text-text-primary min-h-[300px]" />
        {msg && <p className="text-xs text-text-secondary">{msg}</p>}
        <div className="flex gap-2">
          <button onClick={lanjutkan} disabled={loading || !materi.trim()} className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">{loading ? '...' : 'Lanjutkan dengan AI (1 kredit)'}</button>
          <button onClick={tambahSitasi} disabled={loading} className="border border-border-strong px-4 py-2 rounded-lg text-sm font-bold">Tambah Sitasi</button>
          <button onClick={() => save(false)} className="border border-border-strong px-4 py-2 rounded-lg text-sm font-bold">Simpan</button>
          {id && <button onClick={hapus} className="text-accent-red px-3 py-2 rounded-lg text-sm">Hapus</button>}
        </div>
      </div>
    </div>
  );
}
