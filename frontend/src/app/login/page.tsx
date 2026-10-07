'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-base p-4">
      <form onSubmit={onLogin} className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Selamat datang kembali</h1>
        <p className="text-sm text-text-secondary">Masuk untuk melanjutkan skripsimu.</p>
        <div>
          <label htmlFor="login-email" className="text-sm font-semibold text-text-primary">Email</label>
          <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" className="mt-1 w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-semibold text-text-primary">Password</label>
          <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
        </div>
        {err && <p className="text-sm text-accent-red">{err}</p>}
        <button disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50">
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
        <p className="text-center text-sm text-text-secondary">Belum punya akun? <Link href="/register" className="text-brand-primary font-semibold">Daftar gratis</Link></p>
      </form>
    </main>
  );
}
