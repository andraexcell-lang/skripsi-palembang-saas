'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { apiGet, apiPost } from '@/lib/api';

export default function PengaturanPage() {
  const [nama, setNama] = useState('');
  const [univ, setUniv] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [keyName, setKeyName] = useState('Plugin Word');

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || '');
    setNama(String(user.user_metadata?.full_name || ''));
    try {
      const b = await apiGet('/api/credits/balance');
      void b;
    } catch { /* abaikan */ }
    try {
      const k = await apiGet('/api/keys');
      setKeys(k.items);
    } catch { /* tabel keys belum dimigrasi */ }
  }
  useEffect(() => { load(); }, []);

  async function saveProfil(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    const { error } = await supabase.auth.updateUser({ data: { full_name: nama } });
    if (error) return setMsg(error.message);
    setMsg('Profil tersimpan di auth. Universitas/jurusan tersimpan lokal sesi ini.');
    try { localStorage.setItem('sp-profil', JSON.stringify({ univ, jurusan })); } catch { /* abaikan */ }
  }

  async function savePw(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    if (pw1.length < 8) return setMsg('Password baru minimal 8 karakter');
    if (pw1 !== pw2) return setMsg('Ulangi password tidak sama');
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setMsg(error ? error.message : 'Password berhasil diganti');
    setPw1(''); setPw2('');
  }

  async function createKey(e: React.FormEvent) {
    e.preventDefault(); setMsg(''); setNewKey('');
    try {
      const r = await apiPost('/api/keys', { name: keyName });
      setNewKey(r.key);
      const k = await apiGet('/api/keys');
      setKeys(k.items);
    } catch (e: any) { setMsg(e.message); }
  }

  async function delKey(id: string) {
    const { data } = await supabase.auth.getSession();
    const t = data.session?.access_token || '';
    const headers: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/keys/${id}`, { method: 'DELETE', headers });
    setKeys(keys.filter((k) => k.id !== id));
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-6 overflow-y-auto pb-24">
        <h1 className="text-2xl font-bold text-text-primary">Pengaturan</h1>
        {msg && <p className="text-sm bg-bg-surface border border-border-subtle rounded-lg p-3">{msg}</p>}
        <form onSubmit={saveProfil} className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-text-primary">Profil</h2>
          <input value={email} disabled placeholder="Email" className="w-full bg-bg-surface-hover border border-border-strong rounded-lg p-3 text-sm text-text-muted" />
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          <div className="grid grid-cols-2 gap-4">
            <input value={univ} onChange={(e) => setUniv(e.target.value)} placeholder="Universitas" className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <input value={jurusan} onChange={(e) => setJurusan(e.target.value)} placeholder="Jurusan" className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          </div>
          <button className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold">Simpan Perubahan</button>
        </form>
        <form onSubmit={savePw} className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-text-primary">Ganti Password</h2>
          <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="Password baru (min 8)" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Ulangi password baru" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
          <button className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold">Simpan Password</button>
        </form>
        <form onSubmit={createKey} className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-text-primary">Kunci API (Plugin Word)</h2>
          <div className="flex gap-3">
            <input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Nama kunci" className="flex-1 bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <button className="bg-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold">+ Buat kunci</button>
          </div>
          {newKey && <p className="text-xs text-text-primary bg-bg-base border border-border-strong rounded-lg p-3 break-all">Simpan sekarang (hanya tampil sekali): {newKey}</p>}
          {keys.map((k: any) => (
            <div key={k.id} className="text-xs text-text-secondary flex justify-between border-t border-border-subtle py-2">
              <span>{k.name} · {k.key_prefix}…</span>
              <button type="button" onClick={() => delKey(k.id)} className="text-accent-red font-bold">Hapus</button>
            </div>
          ))}
          {keys.length === 0 && <p className="text-sm text-text-muted">Belum ada kunci aktif.</p>}
        </form>
      </div>
    </div>
  );
}
