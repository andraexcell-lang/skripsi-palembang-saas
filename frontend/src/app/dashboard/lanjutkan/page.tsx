"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LanjutkanSkripsiPage() {
  const [judul, setJudul] = useState("");
  const [jenis, setJenis] = useState("skripsi");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || judul.trim().length < 10 || loading) return;
    setLoading(true); setMsg("");
    try {
      const { data } = await supabase.auth.getSession();
      let token = data.session?.access_token || '';
      if (!token) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || '';
          if (k.endsWith('-auth-token')) {
            try { token = JSON.parse(localStorage.getItem(k) || '').access_token || ''; if (token) break; } catch {}
          }
        }
      }
      const fd = new FormData();
      fd.append('file', file);
      fd.append('judul', judul);
      fd.append('jenis', jenis);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/projects/from-file`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Gagal membaca file');
      setMsg(`Bab terdeteksi selesai: ${j.detected?.length ? j.detected.join(', ') : 'tidak ada — mulai dari nol'}. Membuka Studio...`);
      setTimeout(() => router.push(`/dashboard/studio/${j.item.id}`), 1200);
    } catch (e: any) { setMsg("Error: " + e.message); }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <h1 className="font-bold text-text-primary text-sm">Lanjutkan Skripsi</h1>
      </header>
      <form onSubmit={submit} className="p-6 max-w-3xl mx-auto w-full space-y-5 overflow-y-auto pb-24">
        <div className="bg-bg-base border border-brand-primary/30 rounded-xl p-4 text-xs text-text-secondary">
          Sistem membaca filemu: bab yang <strong className="text-text-primary">sudah selesai</strong> dipakai apa adanya dan tercentang di Studio, sisanya kamu generate. Minimal Bab I harus selesai di filemu.
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-3">
          <label className="font-bold text-text-primary text-sm block">Judul penelitian</label>
          <input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Ketik judul skripsi/tesis/disertasi" className="w-full bg-bg-base border border-border-strong rounded-lg px-4 py-3 text-sm text-text-primary" />
          <label className="font-bold text-text-primary text-sm block">Jenis</label>
          <div className="grid grid-cols-3 gap-3">
            {[['skripsi', 'Skripsi (S1)'], ['tesis', 'Tesis (S2)'], ['disertasi', 'Disertasi (S3)']].map(([v, l]) => (
              <div key={v} onClick={() => setJenis(v)} className={`border rounded-lg p-3 cursor-pointer text-sm ${jenis === v ? 'border-2 border-brand-primary bg-brand-primary/10 font-bold text-brand-primary' : 'border-border-strong text-text-secondary'}`}>{l}</div>
            ))}
          </div>
          <label className="font-bold text-text-primary text-sm block">File skripsi (.docx/.pdf, maks 15 MB)</label>
          <input type="file" accept=".docx,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-text-secondary" />
        </div>
        {msg && <p className="text-sm text-text-secondary">{msg}</p>}
        <button disabled={loading || !file || judul.trim().length < 10} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
          {loading ? 'Membaca skripsi...' : 'Baca Skripsi → Buka Studio'}
        </button>
        <p className="text-center text-sm text-text-secondary">Atau mulai dari nol di <Link href="/dashboard/proyek/buat" className="text-brand-primary font-semibold">Buat Proyek</Link></p>
      </form>
    </div>
  );
}
