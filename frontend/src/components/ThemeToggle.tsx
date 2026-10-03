'use client';
import { useEffect, useState } from 'react';

const KEY = 'sp-tema';

export default function ThemeToggle() {
  const [mode, setMode] = useState<'terang' | 'gelap'>('terang');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      const dark = saved === 'gelap' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setMode(dark ? 'gelap' : 'terang');
      document.documentElement.classList.toggle('dark', dark);
    } catch { /* abaikan */ }
  }, []);

  function pick(m: 'terang' | 'gelap') {
    setMode(m);
    try {
      localStorage.setItem(KEY, m);
      document.documentElement.classList.toggle('dark', m === 'gelap');
    } catch { /* abaikan */ }
  }

  return (
    <div className="flex items-center bg-bg-base rounded-lg p-1 border border-border-subtle">
      <button onClick={() => pick('terang')} className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-medium ${mode === 'terang' ? 'bg-bg-surface-hover text-text-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}>
        ☀ Terang
      </button>
      <button onClick={() => pick('gelap')} className={`flex-1 flex justify-center py-1.5 rounded-md text-xs font-medium ${mode === 'gelap' ? 'bg-bg-surface-hover text-text-primary shadow-sm border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}>
        🌙 Gelap
      </button>
    </div>
  );
}
