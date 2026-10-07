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

// Panel Riwayat percakapan (paritas referensi §3.23):
// panel 320px kanan atas, header "Riwayat percakapan" + ×,
// empty state "Belum ada percakapan tersimpan…", simpan di localStorage
type Sesi = { id: string; waktu: number; messages: M[] };
const KEY_RIWAYAT = 'sp-riwayat-asisten';
const MAKS_SESI = 50;

function judulSesi(s: Sesi) {
  const pertama = s.messages.find((m) => m.role === 'user');
  return (pertama?.text || 'Percakapan baru').slice(0, 60);
}

export default function AsistenPage() {
  const [chat, setChat] = useState<M[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsTopup, setNeedsTopup] = useState(false);
  const [riwayat, setRiwayat] = useState<Sesi[]>([]);
  const [aktifId, setAktifId] = useState<string | null>(null);
  const [panelBuka, setPanelBuka] = useState(false);
  const [riwayatSiap, setRiwayatSiap] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // ref sinkron: dipakai simpanSesi agar pesan user & balasan AI dalam
  // satu kirim() masuk ke sesi yang sama (state aktifId terlambat 1 render)
  const aktifIdRef = useRef<string | null>(null);

  // muat riwayat dari localStorage (hanya di klien, setelah mount)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_RIWAYAT);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) setRiwayat(data);
      }
    } catch {
      /* rusak → abaikan */
    }
    setRiwayatSiap(true);
  }, []);

  // simpan perubahan riwayat (dimulai setelah muat agar tak menimpa data lama)
  useEffect(() => {
    if (!riwayatSiap) return;
    try {
      localStorage.setItem(KEY_RIWAYAT, JSON.stringify(riwayat));
    } catch {
      /* penuh → abaikan */
    }
  }, [riwayat, riwayatSiap]);

  // upsert sesi aktif dari percakapan berjalan
  function simpanSesi(messages: M[]) {
    if (messages.length === 0) return;
    const id = aktifIdRef.current || `sesi-${Date.now()}`;
    if (!aktifIdRef.current) {
      aktifIdRef.current = id;
      setAktifId(id);
    }
    setRiwayat((prev) => [{ id, waktu: Date.now(), messages }, ...prev.filter((s) => s.id !== id)].slice(0, MAKS_SESI));
  }

  // buka sesi lama dari panel
  function bukaSesi(s: Sesi) {
    setChat(s.messages);
    aktifIdRef.current = s.id;
    setAktifId(s.id);
    setNeedsTopup(false);
    setPanelBuka(false);
  }

  // hapus satu sesi dari riwayat (paritas: daftar + buka + hapus)
  function hapusSesi(id: string) {
    setRiwayat((prev) => prev.filter((s) => s.id !== id));
    if (aktifIdRef.current === id) {
      aktifIdRef.current = null;
      setAktifId(null);
    }
  }

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
    aktifIdRef.current = null;
    setAktifId(null);
    taRef.current?.focus();
  }

  async function kirim() {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setNeedsTopup(false);
    const next: M[] = [...chat, { role: 'user', text: q }];
    setChat(next);
    simpanSesi(next);
    setLoading(true);
    try {
      const ctx = next.slice(-6).map((m) => `${m.role}: ${m.text}`).join('\n');
      const data = await aiGenerate(
        `Kamu AI asisten skripsi "Skripsi Palembang". Jawab ringkas, akademik, Indonesia. Bila diminta judul, beri 10 judul bernomor. Perintah cepat bila pesan diawali slash: /judul <tema> → tanyakan metode penelitian lalu berikan 10 judul bernomor; /skripsi, /tesis, /disertasi → pandu membuat proyek baru sesuai jenjang dari judul yang sudah dimiliki; /sinta, /scopus → pandu membuat artikel jurnal sesuai indeksnya; /parafrase → parafrase teks yang dikirim user; /ppt → pandu mengunggah skripsi/proposal menjadi PPT; /cari artikel → pandu mencari artikel jurnal; /kelayakan judul → nilai kelayakan judul dengan skor, kekuatan, dan celah (gratis). Bila topik besar tanpa perintah, arahkan ke /judul atau /skripsi.\n\nRiwayat:\n${ctx}\n\nPesan: ${q}`,
        'chat'
      );
      const balasan: M[] = [...next, { role: 'ai', text: data.result }];
      setChat(balasan);
      simpanSesi(balasan);
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      const galat: M[] = [...next, { role: 'ai', text: 'Error: ' + e.message }];
      setChat(galat);
      simpanSesi(galat);
    }
    setLoading(false);
  }

  return (
    <div className="relative flex flex-col h-full bg-bg-base">
      <header className="h-16 flex items-center justify-between px-8 border-b border-border-subtle bg-bg-base">
        <div className="font-bold text-brand-primary">AI Skripsi Palembang</div>
        <div className="flex items-center gap-2">
          {chat.length > 0 && (
            <button
              onClick={percakapanBaru}
              className="text-xs font-bold text-brand-primary border border-border-subtle rounded-lg px-3 py-1.5 hover:border-brand-primary transition-colors"
            >
              Percakapan baru
            </button>
          )}
          <button
            onClick={() => setPanelBuka((v) => !v)}
            aria-expanded={panelBuka}
            aria-haspopup="dialog"
            className={`w-[94px] h-8 text-xs font-bold rounded-lg border transition-colors ${
              panelBuka
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'text-brand-primary border-border-subtle hover:border-brand-primary'
            }`}
          >
            Riwayat
          </button>
        </div>
      </header>
      {/* Panel Riwayat percakapan (paritas: 320px, kanan atas) */}
      {panelBuka && (
        <div
          role="dialog"
          aria-label="Riwayat percakapan"
          className="absolute right-4 top-16 z-20 w-80 overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-xl"
        >
          <div className="flex h-11 items-center justify-between border-b border-border-subtle px-4">
            <h2 className="text-sm font-bold text-text-primary">Riwayat percakapan</h2>
            <button
              onClick={() => setPanelBuka(false)}
              aria-label="Tutup"
              className="w-6 h-6 leading-none text-lg text-text-muted hover:text-text-primary"
            >
              ×
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {riwayat.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">Belum ada percakapan tersimpan…</p>
            ) : (
              riwayat.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center border-b border-border-subtle transition-colors last:border-b-0 hover:bg-bg-surface-hover ${
                    s.id === aktifId ? 'bg-brand-primary/5' : ''
                  }`}
                >
                  <button onClick={() => bukaSesi(s)} className="min-w-0 flex-1 px-4 py-3 text-left">
                    <p className="truncate text-sm text-text-primary">{judulSesi(s)}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {s.messages.length} pesan ·{' '}
                      {new Date(s.waktu).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                  <button
                    onClick={() => hapusSesi(s.id)}
                    aria-label="Hapus riwayat"
                    className="mr-3 shrink-0 rounded px-2 py-1 text-xs font-bold text-text-muted transition-colors hover:bg-accent-red/10 hover:text-danger"
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
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
