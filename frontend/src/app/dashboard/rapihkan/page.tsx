"use client";

import { useState } from "react";
import Link from "next/link";
import { isInsufficientCredits } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function RapihkanSkripsiPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [stat, setStat] = useState("");
  const [needsTopup, setNeedsTopup] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true); setMsg(""); setStat(""); setNeedsTopup(false);
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
      fd.append('file', f);
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/files/rapihkan`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 402) setNeedsTopup(true);
        throw new Error(j.error || 'Gagal merapikan');
      }
      const st = res.headers.get('X-Rapi-Stat');
      if (st) {
        try {
          const s = JSON.parse(st);
          setStat(`${s.paragraf} paragraf · ${s.heading1} heading 1 · ${s.heading2} heading 2 → A4, margin 4-4-3-3, TNR 12, spasi 1.5, justify, nomor halaman, Daftar Isi`);
        } catch {}
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'rapi-skripsi.docx';
      a.click();
      URL.revokeObjectURL(a.href);
      setMsg('Beres! File rapi terunduh (1 kredit). Isi naskah tidak diubah.');
    } catch (error: any) {
      if (isInsufficientCredits(error)) setNeedsTopup(true);
      setMsg("Error: " + error.message);
    } finally {
      setLoading(false);
    }
    e.target.value = '';
  }

  return (
    <div className="flex flex-col h-full bg-bg-base relative">

      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <h1 className="text-xl font-bold text-text-primary">Rapihkan Skripsi</h1>
      </header>

      <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-6 overflow-y-auto">
        <p className="text-text-secondary text-sm">Unggah .docx dari mana pun · margin 4-4-3-3, spasi 1.5, TNR 12, heading, Daftar Isi, nomor halaman · isi naskah tidak diubah · 1 kredit</p>

        <label className="block bg-bg-surface border-2 border-dashed border-border-strong rounded-xl p-10 text-center cursor-pointer hover:border-brand-primary">
          <input type="file" accept=".docx" onChange={onFile} className="hidden" disabled={loading} />
          <div className="font-bold text-text-primary">{loading ? 'Merapikan...' : 'Pilih berkas .docx'}</div>
          <div className="text-xs text-text-muted mt-1">Word (.docx) dari mana pun — maks 15 MB. Berkas tidak disimpan.</div>
        </label>

        {needsTopup && (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm flex justify-between items-center">
            <span>Kredit habis.</span>
            <Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Pilih Paket →</Link>
          </div>
        )}
        {stat && <p className="text-sm text-green-600 font-semibold">{stat}</p>}
        {msg && <p className="text-sm text-text-secondary">{msg}</p>}
      </div>

    </div>
  );
}
