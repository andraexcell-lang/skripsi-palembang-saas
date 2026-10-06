'use client';
import { useEffect, useRef, useState } from 'react';
import { aiGenerate, isInsufficientCredits } from '@/lib/api';

// 10 slash-command persis referensi (urutan & teks identik mantrariset):
// chip & dropdown hanya MENGISI input (referensi tidak navigasi)
const QUICK = [
  { cmd: '/judul', desc: 'Buatkan 10 judul dari tema & metode' },
  { cmd: '/skripsi', desc: 'Mulai skripsi dari judul yang sudah kamu punya' },
  { cmd: '/tesis', desc: 'Mulai tesis dari judul yang sudah kamu punya' },
  { cmd: '/disertasi', desc: 'Mulai disertasi dari judul yang sudah kamu punya' },
  { cmd: '/sinta', desc: 'Mulai artikel jurnal Sinta dari judulmu' },
  { cmd: '/scopus', desc: 'Mulai artikel jurnal Scopus (Bahasa Inggris)' },
  { cmd: '/parafrase', desc: 'Parafrase teks langsung di chat (1 kredit)' },
  { cmd: '/ppt', desc: 'Unggah skripsi/proposal → jadi PPT, diunduh dari chat' },
  { cmd: '/cari artikel', desc: 'Cari artikel jurnal: tahun, indeks, asal' },
  { cmd: '/kelayakan judul', desc: 'Nilai kelayakan judulmu: skor, kekuatan, celah — gratis' },
];

type M = { role: 'user' | 'ai'; text: string };

export default function AsistenPage() {
  const [chat, setChat] = useState<M[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsTopup, setNeedsTopup] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // dropdown perintah: terbila saat diawali "/" tanpa spasi (referensi),
  // tertutup otomatis setelah memilih ("/judul " punya spasi)
  const perintahTerbuka = input.startsWith('/') && !input.includes(' ');
  const daftarPerintah = perintahTerbuka ? QUICK.filter((p) => p.cmd.startsWith(input.toLowerCase())) : [];

  // textarea auto-grow (maks h-48 paritas referensi)
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 192) + 'px';
  }, [input]);

  // ikut ke bawah saat ada pesan baru
  useEffect(() => {
    const s = scrollRef.current;
    if (s) s.scrollTop = s.scrollHeight;
  }, [chat, loading]);

  // pra-isi dari pencarian ?q= (bar pencarian mengarah ke sini)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setInput(q);
  }, []);

  function pilihPerintah(cmd: string) {
    setInput(cmd + ' ');
    taRef.current?.focus();
  }

  function percakapanBaru() {
    setChat([]);
    setInput('');
    setNeedsTopup(false);
    taRef.current?.focus();
  }

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
        `Kamu AI asisten skripsi "Skripsi Palembang". Jawab ringkas, akademik, Indonesia. Bila diminta judul, beri 10 judul bernomor. Perintah cepat bila pesan diawali slash: /judul <tema> → tanyakan metode penelitian lalu berikan 10 judul bernomor; /skripsi, /tesis, /disertasi → pandu membuat proyek baru sesuai jenjang dari judul yang sudah dimiliki; /sinta, /scopus → pandu membuat artikel jurnal sesuai indeksnya; /parafrase → parafrase teks yang dikirim user; /ppt → pandu mengunggah skripsi/proposal menjadi PPT; /cari artikel → pandu mencari artikel jurnal; /kelayakan judul → nilai kelayakan judul dengan skor, kekuatan, dan celah (gratis). Bila topik besar tanpa perintah, arahkan ke /judul atau /skripsi.\n\nRiwayat:\n${ctx}\n\nPesan: ${q}`,
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
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-subtle bg-bg-base">
        <div className="font-bold text-brand-primary">AI Skripsi Palembang</div>
        {chat.length > 0 && (
          <button
            onClick={percakapanBaru}
            className="text-xs font-bold text-brand-primary border border-border-subtle rounded-lg px-3 py-1.5 hover:border-brand-primary transition-colors"
          >
            Percakapan baru
          </button>
        )}
      </header>
      <div ref={scrollRef} className="flex-1 flex flex-col items-center p-8 max-w-3xl mx-auto w-full overflow-y-auto">
        {chat.length === 0 && (
          <>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Apa yang ingin kamu kerjakan?</h1>
            <p className="text-text-secondary text-sm">Saya bisa menyusun judul, lalu memandu sampai proyeknya siap ditulis.</p>
          </>
        )}
        <div className="w-full space-y-3 my-4">
          {chat.map((m, i) => (
            <div key={i} className={`rounded-xl p-4 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-brand-primary/10 ml-8' : 'bg-bg-surface border border-border-subtle'}`}>{m.text}</div>
          ))}
          {loading && <p className="text-sm text-text-muted">Mengetik...</p>}
        </div>
        {needsTopup && (
          <div className="w-full bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 text-sm flex justify-between items-center mb-3">
            <span>Kredit habis.</span>
            <a href="/dashboard/billing" className="bg-brand-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold">Pilih Paket →</a>
          </div>
        )}
        {/* kotak input (paritas: hint di dalam kotak, dropdown perintah di bawah) */}
        <div className="relative w-full">
          <div className="border border-border-subtle bg-bg-surface rounded-xl px-3 py-2 focus-within:border-brand-primary transition-colors">
            <div className="flex items-end gap-2">
              <textarea
                ref={taRef}
                value={input}
                rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    kirim();
                  }
                }}
                placeholder="Tulis pesan, atau ketik / untuk perintah"
                className="relative max-h-48 min-h-[28px] w-full resize-none bg-transparent py-1 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <button
                onClick={kirim}
                disabled={loading || !input.trim()}
                aria-label="Kirim"
                className="bg-brand-primary text-white w-11 h-9 rounded-xl shrink-0 disabled:opacity-50 transition-opacity"
              >
                ↑
              </button>
            </div>
            <p className="pt-1.5 pb-0.5 text-xs text-text-muted">Enter untuk kirim · Shift+Enter baris baru · / untuk perintah</p>
          </div>
          {daftarPerintah.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-10 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-border-subtle bg-bg-surface shadow-xl">
              {daftarPerintah.map((p) => (
                <button
                  key={p.cmd}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pilihPerintah(p.cmd)}
                  className="flex items-baseline gap-2 w-full px-4 py-2.5 text-left text-[13px] hover:bg-bg-surface-hover transition-colors"
                >
                  <span className="text-brand-primary font-bold shrink-0">{p.cmd}</span>
                  <span className="text-text-secondary truncate">{p.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {chat.length === 0 && (
          <div className="mx-auto mt-6 grid max-w-2xl w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {QUICK.map((p) => (
              <button
                key={p.cmd}
                onClick={() => pilihPerintah(p.cmd)}
                className="flex items-baseline gap-2 rounded-xl border border-border-strong px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-bg-surface-hover"
              >
                <span className="text-brand-primary font-bold shrink-0">{p.cmd}</span>
                <span className="text-text-secondary truncate">{p.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
