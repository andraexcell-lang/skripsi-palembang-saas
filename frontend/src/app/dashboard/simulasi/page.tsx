'use client';

import { aiGenerate, apiPost, isInsufficientCredits } from "@/lib/api";

import { useState } from "react";
import Link from "next/link";

type Msg = { role: 'penguji' | 'mahasiswa' | 'sistem'; text: string };

const SUARA: Record<string, { pitch: number; rate: number }> = {
  'Dr. Sarah Wijaya': { pitch: 1.1, rate: 0.95 },
  'Dr. Bima Pratama': { pitch: 0.9, rate: 1.0 },
  'Surya Wibawa': { pitch: 0.7, rate: 1.05 },
  'Rendra Mahardika': { pitch: 0.85, rate: 0.9 },
};

function speak(text: string, penguji: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 400));
    u.lang = 'id-ID';
    const key = Object.keys(SUARA).find((k) => penguji.includes(k));
    if (key) { u.pitch = SUARA[key].pitch; u.rate = SUARA[key].rate; }
    const idVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('id'));
    if (idVoice) u.voice = idVoice;
    window.speechSynthesis.speak(u);
  } catch { /* abaikan */ }
}

export default function SimulasiSidangPage() {
  const [nama, setNama] = useState("Indah Permata Sari");
  const [materi, setMateri] = useState("");
  const [jenis, setJenis] = useState("sempro");
  const [penguji, setPenguji] = useState("Dr. Sarah Wijaya (Dosen metodologi, teliti & sistematis)");
  const [gaya, setGaya] = useState("Kritis");
  const [durasi, setDurasi] = useState("15");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<Msg[]>([]);
  const [jawaban, setJawaban] = useState("");
  const [sesi, setSesi] = useState(false);
  const [suara, setSuara] = useState(true);
  const [err, setErr] = useState("");
  const [needsTopup, setNeedsTopup] = useState(false);

  const isFormValid = materi.trim().length > 0 && nama.trim().length > 0;

  async function mulai() {
    if (!isFormValid || loading) return;
    setLoading(true); setErr(""); setNeedsTopup(false); setChat([]);
    try {
      await apiPost('/api/credits/consume', { feature: durasi === '30' ? 'sidang_30' : 'sidang_15', ref: 'sidang:mulai' });
      const prompt = `Berperanlah sebagai ${penguji} dengan gaya menguji ${gaya}. Mahasiswa (${jenis === 'sempro' ? 'Seminar Proposal' : 'Seminar Hasil'}) bernama ${nama}. Materi:\n\n${materi}\n\nBeri sambutan 1 kalimat + PERTANYAAN PERTAMA saja (1 pertanyaan tajam). Tanpa pertanyaan lain.`;
      const data = await aiGenerate(prompt, durasi === '30' ? 'sidang_30' : 'sidang_15');
      setChat([{ role: 'penguji', text: data.result }]);
      setSesi(true);
      if (suara) speak(data.result, penguji);
    } catch (e: any) {
      if (isInsufficientCredits(e)) setNeedsTopup(true);
      setErr(e.message);
    }
    setLoading(false);
  }

  async function jawab() {
    if (!jawaban.trim() || loading) return;
    const riwayat = [...chat, { role: 'mahasiswa' as const, text: jawaban }];
    setChat(riwayat);
    setJawaban("");
    setLoading(true);
    try {
      const prompt = `Konteks sidang (${jenis}, penguji ${penguji}, gaya ${gaya}). Materi:\n${materi}\n\nRiwayat:\n${riwayat.map((m) => `${m.role}: ${m.text}`).join('\n')}\n\nTugas: beri tanggapan singkat (maks 3 kalimat, tunjuk kelemahan jawaban bila ada), lalu ajukan PERTANYAAN BERIKUTNYA (1 saja). Bila jawaban sudah 3x dan kuat, tutup dengan nilai + saran.`;
      const data = await aiGenerate(prompt, 'bab');
      const next = [...riwayat, { role: 'penguji' as const, text: data.result }];
      setChat(next);
      if (suara) speak(data.result, penguji);
    } catch (e: any) {
      setChat([...riwayat, { role: 'sistem' as const, text: 'Error: ' + e.message }]);
    }
    setLoading(false);
  }

  async function akhiri() {
    setLoading(true);
    try {
      const prompt = `Sidang selesai. Materi:\n${materi}\nRiwayat:\n${chat.map((m) => `${m.role}: ${m.text}`).join('\n')}\n\nBeri RAPOR: nilai 0-100, kekuatan (2), kelemahan (2), 3 saran perbaikan. Markdown ringkas.`;
      const data = await aiGenerate(prompt, 'bab');
      setChat([...chat, { role: 'penguji', text: data.result }]);
      if (suara) speak('Sidang selesai. Berikut rapor penilaian Anda.', penguji);
    } catch (e: any) {
      setChat([...chat, { role: 'sistem', text: 'Error: ' + e.message }]);
    }
    setLoading(false);
    setSesi(false);
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { /* abaikan */ }
  }

  return (
    <div className="flex flex-col h-full bg-bg-base relative">
      <header className="h-16 flex items-center px-8 border-b border-border-subtle bg-bg-surface sticky top-0 z-20">
        <div className="font-bold text-brand-primary">Simulasi Sidang</div>
        <label className="ml-auto text-xs text-text-secondary flex items-center gap-2">
          <input type="checkbox" checked={suara} onChange={(e) => setSuara(e.target.checked)} className="accent-brand-primary" /> Suara penguji
        </label>
      </header>
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto pb-48">
        <p className="text-text-secondary text-sm">Latihan sidang lisan: penguji bertanya satu per satu dengan suara, mengejar jawaban lemah, lalu memberi rapor. {durasi === '30' ? '25 kredit' : '15 kredit'}/sesi.</p>
        {!sesi && chat.length === 0 && (
          <div className="space-y-4 bg-bg-surface border border-border-subtle rounded-xl p-6">
            <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama panggilan" className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <textarea rows={4} value={materi} onChange={(e) => setMateri(e.target.value)} placeholder="Paste ringkasan proposal/hasil..." className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <div className="grid grid-cols-2 gap-3">
              <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary"><option value="sempro">Seminar Proposal</option><option value="semhas">Seminar Hasil</option></select>
              <select value={durasi} onChange={(e) => setDurasi(e.target.value)} className="bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary"><option value="15">15 menit · 15 kredit</option><option value="30">30 menit · 25 kredit</option></select>
            </div>
            <select value={penguji} onChange={(e) => setPenguji(e.target.value)} className="w-full bg-bg-base border border-border-strong rounded-lg p-3 text-sm text-text-primary">
              <option value="Dr. Sarah Wijaya (Dosen metodologi, teliti & sistematis)">Dr. Sarah Wijaya (Metodologi)</option>
              <option value="Dr. Bima Pratama (Dosen praktisi, logika & relevansi)">Dr. Bima Pratama (Praktisi)</option>
              <option value="Jenderal Purn. Surya Wibawa (Gaya militer, tegas)">Jenderal Surya Wibawa (Militer)</option>
              <option value="Prof. Rendra Mahardika (Orator, menjebak)">Prof. Rendra Mahardika (Orator)</option>
            </select>
            <div className="grid grid-cols-3 gap-3">
              {['Ramah', 'Kritis', 'Killer'].map((g) => (
                <div key={g} onClick={() => setGaya(g)} className={`border rounded-xl p-3 cursor-pointer text-center text-sm font-bold ${gaya === g ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-border-strong text-text-secondary'}`}>{g}</div>
              ))}
            </div>
            {err && <p className="text-sm text-accent-red">{err}</p>}
            {needsTopup && <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-sm flex justify-between items-center"><span>Kredit habis.</span><Link href="/dashboard/billing" className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold">Pilih Paket →</Link></div>}
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`rounded-xl p-4 text-sm whitespace-pre-wrap ${m.role === 'penguji' ? 'bg-bg-surface border border-brand-primary/30 text-text-primary' : m.role === 'mahasiswa' ? 'bg-brand-primary/10 border border-brand-primary/20 text-text-primary ml-8' : 'text-accent-red'}`}>
            <div className="text-[10px] font-bold uppercase mb-1 opacity-70">{m.role === 'penguji' ? penguji : m.role}</div>
            {m.text}
          </div>
        ))}
        {sesi && (
          <div className="flex gap-2">
            <input value={jawaban} onChange={(e) => setJawaban(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && jawab()} placeholder="Ketik jawabanmu..." className="flex-1 bg-bg-surface border border-border-strong rounded-lg p-3 text-sm text-text-primary" />
            <button onClick={jawab} disabled={loading || !jawaban.trim()} className="bg-brand-primary text-white px-5 rounded-lg text-sm font-bold disabled:opacity-50">Kirim</button>
            <button onClick={akhiri} disabled={loading} className="border border-border-strong px-4 rounded-lg text-sm">Akhiri & Rapor</button>
          </div>
        )}
      </div>
      {!sesi && chat.length === 0 && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-bg-base border-t border-border-subtle p-6 z-50">
          <div className="max-w-4xl mx-auto">
            <button onClick={mulai} disabled={!isFormValid || loading} className="w-full py-4 rounded-xl text-lg font-bold bg-brand-primary text-white disabled:opacity-50">{loading ? 'Memanggil penguji...' : 'Mulai Simulasi Sidang'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
