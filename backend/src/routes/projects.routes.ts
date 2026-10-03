import { Router } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { consumeCredits } from '../services/credits.service';
import { generateContent } from '../services/ai.service';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;

const BAB_LIST = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5'];

// OpenAlex gratis (tanpa key): abstrak + bahasa + venue. Dipakai /referensi.
export async function openalexTop(query: string, rows = 10, since?: number | null, lang?: string | null): Promise<{ doi: string; title: string; authors: string; year: string; url: string; venue: string; abstract: string }[]> {
  try {
    const q = encodeURIComponent(String(query).slice(0, 200));
    let filter = '';
    if (since) filter += `,from_publication_date:${since}-01-01`;
    if (lang === 'id' || lang === 'en') filter += `,language:${lang}`;
    const res = await fetch(`https://api.openalex.org/works?search=${q}&per-page=${rows}${filter ? `&filter=${filter.slice(1)}` : ''}&select=id,doi,title,publication_year,authorships,primary_location,abstract_inverted_index,language&mailto=admin@skripsiplg.my.id`);
    if (!res.ok) return [];
    const j: any = await res.json();
    return (j.results || []).map((it: any) => {
      const inv = it.abstract_inverted_index || {};
      const words: [string, number][] = [];
      for (const [w, pos] of Object.entries(inv)) for (const p of (pos as number[])) words.push([w, p]);
      words.sort((a, b) => a[1] - b[1]);
      return {
        doi: String(it.doi || '').replace('https://doi.org/', ''),
        title: it.title || '',
        authors: (it.authorships || []).map((a: any) => a.author?.display_name || '').filter(Boolean).join('; ').slice(0, 200),
        year: String(it.publication_year || ''),
        url: it.doi || it.id || '',
        venue: it.primary_location?.source?.display_name || '',
        abstract: words.map((w) => w[0]).join(' ').slice(0, 1200),
      };
    }).filter((r: any) => r.title);
  } catch { return []; }
}

// Pencarian referensi nyata ber-DOI via Crossref (gratis, tanpa key): referensi nyata ber-DOI untuk sitasi.
export async function crossrefTop(query: string, rows = 6, minYear?: number | null): Promise<{ doi: string; title: string; authors: string; year: string; url: string }[]> {
  try {
    const q = encodeURIComponent(String(query).slice(0, 200));
    const filt = minYear ? `&filter=from-pub-date:${minYear}-01-01` : '';
    const res = await fetch(`https://api.crossref.org/works?query.bibliographic=${q}&rows=${rows}${filt}&select=DOI,title,author,published,URL&mailto=admin@skripsiplg.my.id`);
    if (!res.ok) return [];
    const j: any = await res.json();
    return (j.message?.items || []).map((it: any) => ({
      doi: it.DOI || '',
      title: (it.title || [''])[0],
      authors: (it.author || []).map((a: any) => `${a.family || ''}${a.given ? ', ' + a.given : ''}`).join('; ').slice(0, 200),
      year: String(it.published?.['date-parts']?.[0]?.[0] || ''),
      url: it.URL || (it.DOI ? `https://doi.org/${it.DOI}` : ''),
    })).filter((r: any) => r.title && r.doi);
  } catch { return []; }
}

function refBlock(refs: { doi: string; title: string; authors: string; year: string; url: string }[]) {
  if (!refs.length) return ' (tidak ada referensi eksternal tersedia — gunakan teori standar bila perlu).';
  return '\nDAFTAR REFERENSI WAJIB (gunakan untuk bodynote + Daftar Pustaka, format APA 7th, URL bisa diklik):\n' +
    refs.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). ${r.title}. https://doi.org/${r.doi}`).join('\n');
}

const SITASI = `Wajib: (1) tulis dalam bahasa yang diminta, (2) bodynote sesuai gaya sitasi yang diminta di setiap sub-bab yang memakai teori/temuan, (3) akhiri dengan sub-bagian "Daftar Pustaka Bab Ini" berisi referensi di atas dalam format gaya sitasi yang diminta lengkap dengan link DOI yang bisa diklik. Jangan mengarang DOI/judul di luar daftar.`;

function babPrompt(bab: string, p: any, refs: { doi: string; title: string; authors: string; year: string; url: string }[]) {
  const style = p.citation_style || 'APA 7th';
  const lang = p.language || 'Indonesia';
  const base = `Judul: ${p.judul}\nJenis: ${p.jenis}\nMetode: ${p.metode}\nBahasa penulisan: ${lang}\nGaya sitasi: ${style}\n${p.initial_data ? `Data awal penelitian: ${String(p.initial_data).slice(0, 1000)}\n` : ''}`;
  const ref = refBlock(refs);
  const scopeNote = p.ref_scope && p.ref_scope !== 'umum' ? `Prioritaskan referensi ${p.ref_scope}.\n` : '';
  const outlineNote = p.custom_outline ? `Ikuti struktur bab kustom berikut (jangan pakai struktur standar):\n${String(p.custom_outline).slice(0, 2000)}\n` : '';
  const fenomena = p.fetch_fenomena && bab === 'bab1'
    ? `Sertakan tabel fenomena di latar belakang (angka/fakta + sumber + tahun). Bila topik sangat lokal tanpa data daring, tulis apa adanya tanpa mengarang.\n` : '';
  const wajib = Array.isArray(p.custom_sources) && p.custom_sources.length
    ? `SUMBER WAJIB (arahan pembimbing — harus disitasi bila relevan, masuk Daftar Pustaka):\n${p.custom_sources.map((s: any, i: number) => `${i + 1}. ${s.name}: ${String(s.text || '').slice(0, 800)}`).join('\n')}\n` : '';
  const map: Record<string, string> = {
    bab1: `Susun BAB I PENDAHULUAN (latar belakang, rumusan masalah, tujuan, manfaat, batasan) untuk skripsi berikut.\n${base}${ref}\n${wajib}${fenomena}Tulis akademik formal Indonesia, siap tempel ke Word.\n${scopeNote}${outlineNote}${SITASI}`,
    bab2: `Susun BAB II TINJAUAN PUSTAKA (teori utama, penelitian terdahulu, kerangka berpikir, hipotesis bila kuantitatif).\n${base}${ref}\n${scopeNote}${outlineNote}${SITASI}`,
    bab3: `Susun BAB III METODE PENELITIAN (pendekatan, populasi/sampel, variabel & indikator, teknik pengumpulan data, uji/analisis).\n${base}${ref}\nIkuti kaidah metodologi standar Indonesia.\n${scopeNote}${outlineNote}${SITASI}`,
    bab4: `Susun BAB IV HASIL DAN PEMBAHASAN (deskripsi data, hasil analisis, pembahasan dikaitkan teori Bab II).\n${base}${ref}\nGunakan tabel Markdown bila perlu.\n${scopeNote}${outlineNote}${SITASI}`,
    bab5: `Susun BAB V PENUTUP (kesimpulan menjawab rumusan masalah + saran praktis/metodologis).\n${base}${ref}\nRingkas dan tegas.\n${scopeNote}${outlineNote}${SITASI}`,
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
    const { judul, jenis = 'skripsi', metode = 'Kualitatif', tahap = 'full', identitas = {},
      citation_style = 'APA 7th', language = 'Indonesia', min_year = null,
      ref_origin = 'semua', ref_scope = 'umum', initial_data = '',
      custom_outline = '', fetch_fenomena = true, custom_sources = [] } = req.body || {};
    if (!judul || String(judul).trim().length < 10) return res.status(400).json({ error: 'Judul minimal 10 karakter' });
    const { data, error } = await db().from('projects').insert({ user_id: req.userId!, judul, jenis, metode, tahap, identitas,
      citation_style, language, min_year, ref_origin, ref_scope, initial_data, custom_outline, fetch_fenomena,
      custom_sources: Array.isArray(custom_sources) ? custom_sources.slice(0, 10) : [] }).select().single();
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
    const refs = await crossrefTop(p.judul, 6, p.min_year);
    let text: string;
    try {
      text = await generateContent(babPrompt(bab, p, refs));
    } catch (e: any) {
      const { addCredits } = await import('../services/credits.service');
      await addCredits(req.userId!, 10, `refund:${id}:${bab}-gagal`).catch(() => {});
      throw e;
    }
    const content = { ...(p.content || {}), [bab]: text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ bab, text, refs });
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
    const refs = await crossrefTop(p.judul, 10);
    const text = await generateContent(
      `Susun artikel jurnal lengkap berbahasa ${lang} dengan struktur: Judul, Abstrak + kata kunci, Pendahuluan, Metode, Hasil & Pembahasan, Kesimpulan, Daftar Pustaka (APA, gunakan referensi nyata di bawah + bodynote di tiap bagian). Judul: ${p.judul}. Metode: ${p.metode}.${refBlock(refs)}\nJangan mengarang DOI/judul di luar daftar. Tulis siap submit.`
    );
    await db().from('projects').update({ content: { ...(p.content || {}), artikel: text }, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text, refs });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
