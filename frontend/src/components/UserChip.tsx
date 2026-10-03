'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function UserChip() {
  const [name, setName] = useState('...');
  const [initial, setInitial] = useState('?');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = String(data.user?.user_metadata?.full_name || data.user?.email || '?');
      setName(n);
      setInitial(n.charAt(0).toUpperCase());
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    try { localStorage.clear(); } catch { /* abaikan */ }
    router.push('/login');
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">{initial}</div>
        <span className="text-sm font-medium text-text-primary truncate max-w-[140px]">{name}</span>
      </div>
      <button onClick={logout} className="text-left flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        Keluar
      </button>
    </div>
  );
}
