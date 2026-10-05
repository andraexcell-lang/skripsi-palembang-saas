'use client';
import { useState } from 'react';
import Link from 'next/link';
import { aiGenerate, isInsufficientCredits } from '@/lib/api';

const QUICK = [
  { label: '/judul', href: '/dashboard/brainstorming', desc: 'Buatkan 10 judul dari tema & metode' },
  { label: '/skripsi', href: '/dashboard/proyek/buat', desc: 'Mulai skripsi dari judul' },
  { label: '/parafrase', href: '/dashboard/parafrase', desc: 'Parafrase teks (1 kredit)' },
  { label: '/kelayakan judul', href: '/dashboard/kelayakan', desc: 'Nilai kelayakan judul — gratis' },
];

type M = { role: 'user' | 'ai'; text: string };

export default function AsistenPage() {
  const [chat, setChat] = useState<M[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsTopup, setNeedsTopup] = useState(false);

  async function kirim() {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setNeedsTopup(false);
    const next: M[] = [...chat, { role: 'user', text: q }];
    setChat(next);
    setLoading(true);
    try {
      const ctx = next.slice(-6).map((m) => `${m.role}: ${m.text}`).join('\n');
      const data = await aiGenerate(
        `Kamu AI asisten skripsi "Skripsi Palembang". Jawab ringkas, akademik, Indonesia. Bila diminta judul, beri maksimal 5 bernomor. Bila topik besar, arahkan ke /judul, /skripsi, atau /parafrase.\n\nRiwayat:\n${ctx}\n\nPesan: ${q}`,
        'chat'
      );
      setChat([...next, { role: 'ai', text: data.result }]);
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      setChat([...next, { role: 'ai', text: 'Error: ' + e.message }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-base">
        <div className="font-bold text-brand-primary">AI Skripsi Palembang</div>
      </header>
      <div className="flex-1 flex flex-col items-center p-8 max-w-3xl mx-auto w-full overflow-y-auto">
        {chat.length === 0 && (
          <>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Apa yang ingin kamu kerjakan?</h1>
            <p className="text-text-secondary text-sm mb-8">Chat 1 kredit/pesan. Saya bisa menyusun judul lalu memandu sampai proyek siap.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-4">
              {QUICK.map((p) => (
                <Link key={p.label} href={p.href} className="flex items-center border border-border-subtle bg-bg-surface hover:border-brand-primary rounded-xl px-4 py-3">
                  <span className="text-brand-primary font-bold text-sm mr-2">{p.label}</span>
                  <span className="text-text-secondary text-sm truncate">{p.desc}</span>
                </Link>
              ))}
            </div>
          </>
        )}
        <div className="w-full space-y-3 mb-4">
          {chat.map((m, i) => (
            <div key={i} className={`rounded-xl p-4 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-brand-primary/10 ml-8' : 'bg-bg-surface border border-border-subtle'}`}>{m.text}</div>
          ))}
          {loading && <p className="text-sm text-text-muted">Mengetik...</p>}
        </div>
        {needsTopup && (
          <div className="w-full bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 text-sm flex justify-between items-center mb-3">
            <span>Kredit habis.</span>
            <Link href="/dashboard/billing" className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold">Pilih Paket →</Link>
          </div>
        )}
        <div className="w-full flex gap-2 sticky bottom-0 bg-bg-base py-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && kirim()} placeholder="Tulis pesan..." className="flex-1 bg-bg-surface border border-border-subtle rounded-xl py-3 px-4 text-sm text-text-primary" />
          <button onClick={kirim} disabled={loading || !input.trim()} className="bg-brand-primary text-white w-11 rounded-xl disabled:opacity-50">↑</button>
        </div>
        <p className="text-xs text-text-muted">Enter untuk kirim · 1 kredit per balasan AI</p>
      </div>
    </div>
  );
}
