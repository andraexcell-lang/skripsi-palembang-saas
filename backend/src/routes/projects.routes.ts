import { Router } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { requireAuthOrKey } from '../middleware/apiKey';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { consumeCredits } from '../services/credits.service';
import { generateContent, generateContentStream } from '../services/ai.service';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;

const BAB_LIST = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5'];

export const OUTLINE: Record<string, { bab: string; subs: string[] }> = {
  bab1: { bab: 'Bab I Pendahuluan', subs: ['1.1 Latar Belakang', '1.2 Identifikasi Masalah', '1.3 Rumusan Masalah', '1.4 Tujuan Penelitian', '1.5 Manfaat Penelitian', '1.6 Batasan Masalah', '1.7 Sistematika Penulisan'] },
  bab2: { bab: 'Bab II Tinjauan Pustaka', subs: ['2.1 Landasan Teori', '2.2 Kerangka Teori', '2.3 Hubungan Antar Variabel', '2.4 Penelitian Terdahulu', '2.5 Kerangka Berpikir', '2.6 Hipotesis'] },
  bab3: { bab: 'Bab III Metodologi', subs: ['3.1 Jenis & Desain Penelitian', '3.2 Populasi & Sampel', '3.3 Definisi Operasional', '3.4 Teknik Pengumpulan Data', '3.5 Teknik Analisis Data', '3.6 Jadwal Penelitian'] },
  bab4: { bab: 'Bab IV Hasil Penelitian dan Pembahasan', subs: ['4.1 Gambaran Umum Objek Penelitian', '4.2 Hasil Penelitian', '4.3 Pembahasan', '4.4 Implikasi'] },
  bab5: { bab: 'Bab V Penutup', subs: ['5.1 Simpulan', '5.2 Saran'] },
  lampiran: { bab: 'Lampiran', subs: ['6.1 Kisi-Kisi Penelitian', '6.2 Pernyataan Kuesioner'] },
};

// OpenAlex gratis (tanpa key): abstrak + bahasa + venue. Dipakai /referensi.
export async function openalexTop(query: string, rows = 10, since?: number | null, lang?: string | null, page = 1): Promise<{ items: { doi: string; title: string; authors: string; year: string; url: string; venue: string; abstract: string }[]; total: number }> {
  try {
    const q = encodeURIComponent(String(query).slice(0, 200));
    let filter = '';
    if (since) filter += `,from_publication_date:${since}-01-01`;
    if (lang === 'id' || lang === 'en') filter += `,language:${lang}`;
    const res = await fetch(`https://api.openalex.org/works?search=${q}&per-page=${rows}${filter ? `&filter=${filter.slice(1)}` : ''}&page=${page}&select=id,doi,title,publication_year,authorships,primary_location,abstract_inverted_index,language&mailto=admin@skripsiplg.my.id`);
    if (!res.ok) return { items: [], total: 0 };
    const j: any = await res.json();
    const items = (j.results || []).map((it: any) => {
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
    return { items, total: j.meta?.count || 0 };
  } catch { return { items: [], total: 0 }; }
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

router.get('/', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('projects').select('*').eq('user_id', req.userId!).order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ items: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { judul, jenis = 'skripsi', metode = 'Kualitatif', tahap = 'full', identitas = {},
      citation_style = 'APA 7th', language = 'Indonesia', min_year = null,
      ref_origin = 'semua', ref_scope = 'umum', initial_data = '',
      custom_outline = '', fetch_fenomena = true, custom_sources = [], logo = '' } = req.body || {};
    if (!judul || String(judul).trim().length < 10) return res.status(400).json({ error: 'Judul minimal 10 karakter' });
    const ident = { ...(identitas || {}) };
    if (logo) ident.logo = String(logo).slice(0, 500000);
    const { data, error } = await db().from('projects').insert({ user_id: req.userId!, judul, jenis, metode, tahap, identitas: ident,
      citation_style, language, min_year, ref_origin, ref_scope, initial_data, custom_outline, fetch_fenomena,
      custom_sources: Array.isArray(custom_sources) ? custom_sources.slice(0, 10) : [] }).select().single();
    if (error) throw new Error(error.message);
    res.json({ item: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('projects').select('*').eq('id', String(req.params.id)).eq('user_id', req.userId!).single();
    if (error) throw new Error('Proyek tidak ditemukan');
    res.json({ item: data });
  } catch (e: any) { res.status(404).json({ error: e.message }); }
});

router.post('/:id/generate-bab', requireAuthOrKey, async (req: AuthRequest, res) => {  try {
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

// Streaming SSE per BAB penuh (untuk Studio web).
router.post('/:id/generate-bab-stream', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab, studi } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: `bab harus salah satu: ${BAB_LIST.join(', ')}` });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const extraStudi = bab === 'bab2' && studi ? ` Bahas ${Math.min(Math.max(parseInt(studi, 10) || 10, 5), 50)} studi terdahulu, 1 paragraf per studi.` : '';
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (ev: string, data: any) => res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
    if ((p.content || {})[bab]) {
      send('cached', true);
      for (const w of String(p.content[bab]).split(/(\s+)/)) send('chunk', { t: w });
      send('done', { cost: 0, cached: true });
      return res.end();
    }
    try {
      const r = await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`);
      send('cost', { cost: r.cost });
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') { send('error', { error: e.message }); return res.end(); }
      throw e;
    }
    const refs = await crossrefTop(p.judul, 6, p.min_year);
    let full = '';
    try {
      for await (const t of generateContentStream(babPrompt(bab, p, refs) + extraStudi)) {
        full += t;
        send('chunk', { t });
      }
    } catch (e: any) {
      const { addCredits } = await import('../services/credits.service');
      await addCredits(req.userId!, 10, `refund:${id}:${bab}-stream-gagal`).catch(() => {});
      send('error', { error: e.message || 'Gagal generate' });
      return res.end();
    }
    const content = { ...(p.content || {}), [bab]: full };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    send('done', { cost: 10 });
    res.end();
  } catch (e: any) {
    try { res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`); res.end(); } catch { /* abaikan */ }
  }
});

router.post('/:id/generate-artikel', requireAuthOrKey, async (req: AuthRequest, res) => {  try {
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

router.get('/meta/outline', async (_req, res) => res.json({ outline: OUTLINE }));

// Referensi proyek (untuk Unduh RIS): Crossref by judul, tanpa AI, tanpa kredit
router.get('/:id/references', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { data: p, error } = await db().from('projects').select('judul,min_year').eq('id', String(req.params.id)).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    res.json({ items: await crossrefTop(p.judul, 20, p.min_year) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Simpan/ubah isi konten (dipakai Lab Revisi tab Proyek Web)
router.patch('/:id/content', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { key, text } = req.body || {};
    if (!key || typeof text !== 'string') return res.status(400).json({ error: 'key dan text wajib' });
    const { data: p, error } = await db().from('projects').select('content').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const content = { ...(p.content || {}), [key]: text.slice(0, 60000) };
    const { error: e2 } = await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    if (e2) throw new Error(e2.message);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Halaman depan: kata pengantar AI + data identitas (gratis, tanpa potong kredit)
router.post('/:id/front-matter', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const ident = p.identitas || {};
    const kata = await generateContent(
      `Susun KATA PENGANTAR skripsi 250-350 kata, formal Indonesia. Judul: ${p.judul}. Penulis: ${ident.nama || '-'}, NIM ${ident.nim || '-'}, ${ident.jurusan || ''} ${ident.kampus || ''}. Ucapkan syukur, terima kasih pembimbing, sadari kekurangan, harap manfaat. Tanpa markdown tebal berlebihan.`
    );
    res.json({
      judul: p.judul, nama: ident.nama || '', nim: ident.nim || '',
      kampus: ident.kampus || '', jurusan: ident.jurusan || '', fakultas: ident.fakultas || '',
      kata,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Generate per SUB-BAB. Bayar sekali per bab: sub-bab berikutnya di bab yang sama gratis.
router.post('/:id/generate-subbab', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab, sub } = req.body || {};
    if (!OUTLINE[bab]) return res.status(400).json({ error: 'bab tidak dikenal' });
    if (!sub || String(sub).trim().length < 2) return res.status(400).json({ error: 'sub wajib diisi' });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const d = db();
    const key = `${bab}:${sub}`;
    if ((p.content || {})[key]) return res.json({ text: p.content[key], cached: true, cost: 0 });
    const { data: paid } = await d.from('credit_ledger').select('id').eq('user_id', req.userId!).eq('ref', `proyek:${id}:${bab}`).limit(1);
    let cost = 0;
    if ((!paid || !paid.length) && !(p.content || {})[bab]) {
      try {
        const r = await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`);
        cost = r.cost;
      } catch (e: any) {
        if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
        throw e;
      }
    }
    const refs = await crossrefTop(`${p.judul} ${sub}`, 5, p.min_year);
    const text = await generateContent(
      `Susun sub-bab "${sub}" dari ${(OUTLINE[bab] || {}).bab || bab} untuk karya berikut. Judul: ${p.judul}. Metode: ${p.metode}. Bahasa: ${p.language || 'Indonesia'}. Gaya sitasi: ${p.citation_style || 'APA 7th'}.\n${refBlock(refs)}\nTulis 300-600 kata akademik dengan bodynote bila memakai teori. Jangan mengarang DOI.`
    );
    const content = { ...(p.content || {}), [key]: text };
    await d.from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text, cost });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Streaming SSE per sub-bab (kata-per-kata). Kredit sama seperti generate-subbab.
router.post('/:id/generate-subbab-stream', requireAuthOrKey, async (req: AuthRequest, res) => {  try {
    const id = String(req.params.id);
    const { bab, sub } = req.body || {};
    if (!OUTLINE[bab]) return res.status(400).json({ error: 'bab tidak dikenal' });
    if (!sub || String(sub).trim().length < 2) return res.status(400).json({ error: 'sub wajib diisi' });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const key = `${bab}:${sub}`;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (ev: string, data: any) => res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
    if ((p.content || {})[key]) {
      send('Cached', true);
      for (const w of String(p.content[key]).split(/(\s+)/)) send('chunk', { t: w });
      send('done', { cost: 0, cached: true });
      return res.end();
    }
    const d = db();
    const { data: paid } = await d.from('credit_ledger').select('id').eq('user_id', req.userId!).eq('ref', `proyek:${id}:${bab}`).limit(1);
    let cost = 0;
    if ((!paid || !paid.length) && !(p.content || {})[bab]) {
      try {
        const r = await consumeCredits(req.userId!, 'bab', `proyek:${id}:${bab}`);
        cost = r.cost;
      } catch (e: any) {
        if (e.code === 'INSUFFICIENT_CREDITS') { send('error', { error: e.message }); return res.end(); }
        throw e;
      }
    }
    send('cost', { cost });
    const refs = await crossrefTop(`${p.judul} ${sub}`, 5, p.min_year);
    const prompt = `Susun sub-bab "${sub}" dari ${(OUTLINE[bab] || {}).bab || bab} untuk karya berikut. Judul: ${p.judul}. Metode: ${p.metode}. Bahasa: ${p.language || 'Indonesia'}. Gaya sitasi: ${p.citation_style || 'APA 7th'}.\n${refBlock(refs)}\nTulis 300-600 kata akademik dengan bodynote bila memakai teori. Jangan mengarang DOI.`;
    let full = '';
    try {
      for await (const t of generateContentStream(prompt)) {
        full += t;
        send('chunk', { t });
      }
    } catch (e: any) {
      const { addCredits } = await import('../services/credits.service');
      if (cost) await addCredits(req.userId!, cost, `refund:${id}:${bab}-stream-gagal`).catch(() => {});
      send('error', { error: e.message || 'Gagal generate' });
      return res.end();
    }
    const content = { ...(p.content || {}), [key]: full };
    await d.from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    send('done', { cost });
    res.end();
  } catch (e: any) {
    try { res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`); res.end(); } catch { /* abaikan */ }
  }
});

// Lanjutkan skripsi dari file: deteksi bab selesai (BAB I-VII) lalu jadi proyek Studio
router.post('/from-file', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const multer = (await import('multer')).default;
    const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }).single('file');
    await new Promise<void>((resolve, reject) => up(req as any, res as any, (e: any) => (e ? reject(e) : resolve())));
    const judul = String(req.body?.judul || '').trim();
    const jenis = String(req.body?.jenis || 'skripsi');
    if (judul.length < 10) return res.status(400).json({ error: 'Judul minimal 10 karakter' });
    if (!(req as any).file) return res.status(400).json({ error: 'Upload file .docx/.pdf (maks 15 MB)' });
    const f = (req as any).file as { originalname: string; buffer: Buffer };
    let text = '';
    if (/\.docx$/i.test(f.originalname)) {
      const mammoth = await import('mammoth');
      const r = await (mammoth as any).extractRawText({ buffer: f.buffer });
      text = String(r.value || '');
    } else if (/\.pdf$/i.test(f.originalname)) {
      const pdf = await import('pdf-parse');
      const fn = (pdf as any).default || pdf;
      text = String((await fn(f.buffer)).text || '');
    } else {
      text = f.buffer.toString('utf-8');
    }
    text = text.slice(0, 60000);
    const ROMAWI: Record<string, string> = { I: 'bab1', II: 'bab2', III: 'bab3', IV: 'bab4', V: 'bab5', VI: 'bab6', VII: 'bab7' };
    const parts = text.split(/(?=\bBAB\s+[IVX]+\b)/i);
    const content: Record<string, string> = {};
    const found: string[] = [];
    for (const part of parts) {
      const m = part.match(/^\s*BAB\s+([IVX]+)/i);
      if (!m) continue;
      const key = ROMAWI[m[1].toUpperCase()];
      if (!key) continue;
      const body = part.slice(m[0].length).trim();
      if (body.length > 500) {
        content[key] = body.slice(0, 30000);
        found.push(key);
      }
    }
    const db2 = (supabaseAdmin || supabaseAnon);
    const { data, error } = await db2.from('projects').insert({
      user_id: (req as AuthRequest).userId!, judul, jenis, tahap: found.length >= 3 ? 'full' : 'proposal',
      content, initial_data: `Diimpor dari file ${f.originalname}. Bab terdeteksi: ${found.join(', ') || 'tidak ada (mulai dari nol)'}.`,
    }).select().single();
    if (error) throw new Error(error.message);
    res.json({ item: data, detected: found });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { error } = await db().from('projects').delete().eq('id', String(req.params.id)).eq('user_id', req.userId!);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Abstrak ID + EN (1 kredit)
router.post('/:id/generate-abstrak', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    try {
      await consumeCredits(req.userId!, 'revisi', `proyek:${id}:abstrak`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const text = await generateContent(
      `Susun ABSTRAK (Indonesia, 1 paragraf 150-200 kata + 3-5 kata kunci urut abjad) dan ABSTRACT (Inggris, terjemahan setara) untuk karya: ${pr.judul}. Metode: ${pr.metode}. Isi: ${(pr.content?.bab1 || '').slice(0, 2000)}`
    );
    const content = { ...(pr.content || {}), abstrak: text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Tambah sitasi ke bab (GRATIS): 1 paragraf ber-bodynote dari referensi nyata
router.post('/:id/tambah-sitasi', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { bab } = req.body || {};
    if (!bab) return res.status(400).json({ error: 'bab wajib' });
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const refs = await crossrefTop(pr.judul, 4, pr.min_year);
    if (!refs.length) return res.status(404).json({ error: 'Tidak ada referensi cocok' });
    const text = await generateContent(
      `Tulis 1 paragraf akademik (80-120 kata) relevan dengan "${bab}" untuk judul ${pr.judul}, dengan 2-3 bodynote ${pr.citation_style || 'APA 7th'} dari referensi berikut (jangan karang di luar daftar):\n${refs.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). ${r.title}. https://doi.org/${r.doi}`).join('\n')}`
    );
    const content = { ...(pr.content || {}), [bab]: String(pr.content?.[bab] || '') + '\n\n' + text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Karil UT (MKWI4560): artikel sistematika UT (15 kredit, pakai tarif artikel)
router.post('/:id/generate-karil', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    try {
      await consumeCredits(req.userId!, 'artikel', `proyek:${id}:karil`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const refs = await crossrefTop(pr.judul, 10, pr.min_year);
    const text = await generateContent(
      `Susun KARYA ILMIAH UT (MKWI4560) berbahasa Indonesia, sistematika: Judul, Identitas (Nama/NIM/UPBJJ), Abstrak 150-200 kata + 3-5 kata kunci abjad, Pendahuluan, Metode, Hasil dan Pembahasan, Simpulan dan Saran, Daftar Pustaka APA (min 10 sumber, 5 jurnal 5 tahun terakhir). Penulis: mahasiswa pertama. Judul: ${pr.judul}.\n${refs.map((r, i) => `${i + 1}. ${r.authors} (${r.year}). ${r.title}. https://doi.org/${r.doi}`).join('\n')}\nJangan mengarang DOI.`
    );
    const content = { ...(pr.content || {}), karil: text };
    await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    res.json({ text });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
