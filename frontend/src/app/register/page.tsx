'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { apiPost } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ref, setRef] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('ref');
      if (q) setRef(q.toUpperCase());
    } catch { /* abaikan */ }
  }, []);

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) { setLoading(false); return setErr(error.message); }
    if (ref.trim()) {
      try { await apiPost('/api/affiliate/attribute', { code: ref.trim() }); } catch { /* kode salah, lanjut */ }
    }
    setLoading(false);
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <form onSubmit={onRegister} className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Daftar gratis</h1>
        <div>
          <label htmlFor="reg-name" className="text-sm font-semibold text-text-primary">Nama</label>
          <input id="reg-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="mt-1 w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>
        <div>
          <label htmlFor="reg-email" className="text-sm font-semibold text-text-primary">Email</label>
          <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" className="mt-1 w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>
        <div>
          <label htmlFor="reg-password" className="text-sm font-semibold text-text-primary">Password (min 8)</label>
          <input id="reg-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>
        <div>
          <label htmlFor="reg-ref" className="text-sm font-semibold text-text-primary">Kode referral <span className="font-normal text-text-muted">(opsional)</span></label>
          <input id="reg-ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="SP-XXXXXXXX" className="mt-1 w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        <button disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50">
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
        <p className="text-center text-sm text-text-secondary">Sudah punya akun? <Link href="/login" className="text-brand-primary font-semibold">Masuk</Link></p>
      </form>
    </main>
  );
}
