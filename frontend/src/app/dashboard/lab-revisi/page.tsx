"use client";

import { aiGenerate, apiGet, apiUpload } from "@/lib/api";
import Link from "next/link";
import EmptyState, { IcLab } from "@/components/EmptyState";

import { useEffect, useState } from "react";

export default function LabRevisiPage() {
  const [tab, setTab] = useState("luar");
  const [materi, setMateri] = useState("");
  const [instruksi, setInstruksi] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string>("");
  const [proyek, setProyek] = useState<any[]>([]);
  const [pid, setPid] = useState("");
  const [babKey, setBabKey] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    apiGet('/api/projects').then((r) => {
      setProyek(r.items || []);
      if (r.items?.[0]) setPid(r.items[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const p = proyek.find((x) => x.id === pid);
    const keys = Object.keys(p?.content || {});
    if (keys.length && !keys.includes(babKey)) setBabKey(keys[0]);
    if (!keys.length) setBabKey("");
  }, [pid, proyek]);

  const isFormValid = materi.trim().length > 0 && instruksi.trim().length > 0;

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy('upload');
    try {
      const r = await apiUpload('/api/files/extract', f);
      setMateri(((materi ? materi + "\n\n" : "") + (r.text || "")).slice(0, 10000));
    } catch (error: any) {
      setHasil("Error: " + error.message);
    }
    setBusy('');
    e.target.value = '';
  }

  const handleRevisi = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setHasil("");

    const prompt = `Berperanlah sebagai editor akademik profesional. Saya memiliki draf tulisan berikut:\n\n${materi}\n\nTolong revisi tulisan tersebut berdasarkan instruksi berikut: "${instruksi}".\n\nBerikan hasil revisinya dalam format Markdown yang rapi.`;

    try {
      const data = await aiGenerate(prompt, "revisi");
      setHasil(data.result);
    } catch (error: any) {
      setHasil("Error: " + error.message + (/kredit kurang/i.test(error.message || "") ? " Buka Billing untuk top-up." : ""));
    } finally {
      setLoading(false);
    }
  };

  async function revisiWeb() {
    const p = proyek.find((x) => x.id === pid);
    if (!p || !babKey || !instruksi.trim() || loading) return;
    setLoading(true); setHasil("");
    try {
      const prompt = `Revisi bagian "${babKey}" berikut sesuai instruksi: "${instruksi}". Pertahankan fakta, sitasi, dan struktur. Kembalikan teks revisi utuh.\n\n${String(p.content[babKey]).slice(0, 8000)}`;
      const data = await aiGenerate(prompt, "revisi");
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const { supabase } = await import('@/lib/supabase');
      const { data: sess } = await supabase.auth.getSession();
      let token = sess.session?.access_token || '';
      if (!token) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || '';
          if (k.endsWith('-auth-token')) {
            try { token = JSON.parse(localStorage.getItem(k) || '').access_token || ''; if (token) break; } catch {}
          }
        }
      }
      await fetch(`${API}/api/projects/${pid}/content`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ key: babKey, text: data.result }),
      });
      setProyek(proyek.map((x) => x.id === pid ? { ...x, content: { ...x.content, [babKey]: data.result } } : x));
      setHasil(data.result + "\n\n(Tersimpan otomatis ke proyek.)");
    } catch (error: any) {
      setHasil("Error: " + error.message + (/kredit kurang/i.test(error.message || "") ? " Buka Billing untuk top-up." : ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-base relative">

      {/* Top Header */}
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2 cursor-pointer ml-auto">
             <Link href="/dashboard/kredit" className="text-xs font-semibold text-accent-red border border-accent-red/20 bg-accent-red/10 px-3 py-1 rounded-full flex items-center gap-1 mr-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                Lihat kredit
             </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Lab Revisi</h1>
          <p className="text-text-secondary text-sm">
            Pilih proyek & sub-bab, lalu tulis instruksi revisi. AI akan merevisi otomatis dan tersimpan ke proyek. Atau revisi file dari luar (1 kredit).
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-bg-surface border border-border-subtle rounded-lg w-max mb-6">
           <button
             onClick={() => setTab("web")}
             className={`px-5 py-2.5 rounded-l-lg text-sm font-bold ${tab === 'web' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
           >
             Proyek Web
           </button>
           <button
             onClick={() => setTab("luar")}
             className={`px-5 py-2.5 rounded-r-lg text-sm font-bold ${tab === 'luar' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
           >
             File dari Luar
           </button>
        </div>

        {tab === "web" && (
          proyek.length === 0 ? (
            <div className="bg-bg-surface border border-border-subtle rounded-xl">
              <EmptyState ikon={<IcLab />} teks="Belum ada proyek yang bisa direvisi…" aksi="Ke Studio" href="/dashboard/proyek" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-text-primary text-sm mb-2">Proyek</label>
                  <select value={pid} onChange={(e) => setPid(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                    {proyek.map((x: any) => <option key={x.id} value={x.id}>{x.judul.slice(0, 60)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-text-primary text-sm mb-2">Bagian</label>
                  <select value={babKey} onChange={(e) => setBabKey(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
                    {Object.keys((proyek.find((x) => x.id === pid)?.content) || {}).map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
                <label className="block font-bold text-text-primary text-sm mb-2">Instruksi Revisi</label>
                <input type="text" value={instruksi} onChange={(e) => setInstruksi(e.target.value)} placeholder="Contoh: buat lebih akademis + tambah sitasi." className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary mb-4" />
                <div className="flex justify-end">
                  <button onClick={revisiWeb} disabled={!pid || !babKey || !instruksi.trim() || loading} className="px-6 py-2.5 rounded-lg text-sm font-bold bg-brand-primary text-white disabled:opacity-50">
                    {loading ? 'Merevisi...' : 'Revisi & Simpan (1 kredit)'}
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {tab === "luar" && (
          <div className="space-y-6">
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
              <label className="block font-bold text-text-primary text-sm mb-2">Teks yang Ingin Direvisi</label>
              <textarea
                rows={5}
                value={materi}
                onChange={(e) => setMateri(e.target.value)}
                placeholder="Paste paragraf atau bab yang ingin Anda perbaiki di sini..."
                className="w-full bg-bg-base border border-border-strong rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none text-sm mb-3"
              ></textarea>
              <label className="block text-xs font-bold text-text-primary mb-4">
                Atau upload file (PDF/DOCX/TXT, maks 15 MB)
                <input type="file" accept=".pdf,.docx,.txt" onChange={uploadFile} className="block mt-1 text-xs text-text-secondary" />
                {busy === 'upload' && <span className="text-text-muted"> Membaca file...</span>}
              </label>

              <label className="block font-bold text-text-primary text-sm mb-2">Instruksi Revisi (Dari Dosen/Anda)</label>
              <input
                type="text"
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value)}
                placeholder="Contoh: Tolong buat bahasanya lebih akademis dan tambahkan sitasi jurnal 5 tahun terakhir."
                className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none mb-4"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleRevisi}
                  disabled={!isFormValid || loading}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-lg ${isFormValid && !loading ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/50 opacity-80 cursor-not-allowed'}`}
                >
                  {loading ? 'Merevisi...' : 'Revisi Sekarang (1 kredit)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hasil Area */}
        {hasil && (
          <div className="bg-bg-surface-hover border border-brand-primary/20 rounded-xl p-6 text-sm text-text-primary shadow-sm whitespace-pre-wrap leading-relaxed">
            <h3 className="font-bold text-lg mb-4 text-brand-primary border-b border-border-subtle pb-2">Hasil Revisi AI:</h3>
            {hasil}
          </div>
        )}

      </div>

    </div>
  );
}
