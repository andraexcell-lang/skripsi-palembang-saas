import { Router } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { consumeCredits } from '../services/credits.service';
import { generateContent } from '../services/ai.service';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;

const BAB_LIST = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5'];

function babPrompt(bab: string, p: any) {
  const base = `Judul: ${p.judul}\nJenis: ${p.jenis}\nMetode: ${p.metode}\n`;
  const map: Record<string, string> = {
    bab1: `Susun BAB I PENDAHULUAN (latar belakang, rumusan masalah, tujuan, manfaat, batasan) untuk skripsi berikut.\n${base}Tulis akademik formal Indonesia, siap tempel ke Word.`,
    bab2: `Susun BAB II TINJAUAN PUSTAKA (teori utama, penelitian terdahulu, kerangka berpikir, hipotesis bila kuantitatif).\n${base}Sertakan bodynote gaya APA (Nama, Tahun) di tiap sub-bab.`,
    bab3: `Susun BAB III METODE PENELITIAN (pendekatan, populasi/sampel, variabel & indikator, teknik pengumpulan data, uji/analisis).\n${base}Ikuti kaidah metodologi standar Indonesia.`,
    bab4: `Susun BAB IV HASIL DAN PEMBAHASAN (deskripsi data, hasil analisis, pembahasan dikaitkan teori Bab II).\n${base}Gunakan tabel Markdown bila perlu.`,
    bab5: `Susun BAB V PENUTUP (kesimpulan menjawab rumusan masalah + saran praktis/metodologis).\n${base}Ringkas dan tegas.`,
  };
  return map[bab] || map.bab1;
}

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('projects').select('*').eq('user_id', req.userId!).order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ items: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { judul, jenis = 'skripsi', metode = 'Kualitatif', tahap = 'full', identitas = {} } = req.body || {};
    if (!judul || String(judul).trim().length < 10) return res.status(400).json({ error: 'Judul minimal 10 karakter' });
    const { data, error } = await db().from('projects').insert({ user_id: req.userId!, judul, jenis, metode, tahap, identitas }).select().single();
    if (error) throw new Error(error.message);
    res.json({ item: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('projects').select('*').eq('id', String(req.params.id)).eq('user_id', req.userId!).single();
    if (error) throw new Error('Proyek tidak ditemukan');
    res.json({ item: data });
  } catch (e: any) { res.status(404).json({ error: e.message }); }
});

router.post('/:id/generate-bab', requireAuth, async (req: AuthRequest, res) => {  try {
    const id = String(req.params.id);
    const { bab } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: `bab harus salah satu: ${BAB_LIST.join(', ')}` });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    try {
      await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const text = await generateContent(babPrompt(bab, p));
    const content = { ...(p.content || {}), [bab]: text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ bab, text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/generate-artikel', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const scopus = p.jenis === 'artikel_scopus';
    try {
      await consumeCredits(req.userId!, 'artikel', `proyek:${id}:artikel`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const lang = scopus ? 'English (akademik, siap submit Scopus Q1-Q4)' : 'Indonesia (akademik, siap submit Sinta)';
    const text = await generateContent(
      `Susun artikel jurnal lengkap berbahasa ${lang} dengan struktur: Judul, Abstrak + kata kunci, Pendahuluan, Metode, Hasil & Pembahasan, Kesimpulan, Daftar Pustaka (APA, 10+ referensi dengan bodynote). Judul: ${p.judul}. Metode: ${p.metode}. Tulis siap submit.`
    );
    await db().from('projects').update({ content: { ...(p.content || {}), artikel: text }, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
