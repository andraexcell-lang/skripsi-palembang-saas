import { Router } from 'express';
import multer from 'multer';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { requireAuthOrKey } from '../middleware/apiKey';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { consumeCredits } from '../services/credits.service';
import { generateContent, generateContentStream } from '../services/ai.service';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;

const BAB_LIST = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'lampiran'];

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

const SITASI = `Aturan format: tulis TEKS BERSIH tanpa markdown (tanpa **, tanpa ---, tanpa preamble seperti "Berikut adalah..."). Langsung mulai dari judul bab. Wajib: (1) tulis dalam bahasa yang diminta, (2) bodynote sesuai gaya sitasi yang diminta di setiap sub-bab yang memakai teori/temuan, (3) akhiri dengan sub-bagian "Daftar Pustaka Bab Ini" berisi referensi di atas dalam format gaya sitasi yang diminta lengkap dengan link DOI yang bisa diklik. Jangan mengarang DOI/judul di luar daftar. Jangan tulis kata "Ilustratif": tabel fenomena hanya boleh berisi data nyata bersumber, bila tidak ada maka hapus tabelnya.`;

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
    lampiran: `Susun LAMPIRAN skripsi (bab penunjang setelah Bab V) berisi instrumen penelitian.\n${base}${ref}\nIsinya diturunkan dari kajian pustaka dan metode artikelmu: ${p.metode === 'Kualitatif'
      ? 'kisi-kisi wawancara/pedoman wawancara, daftar informan, contoh transkrip, lembar observasi'
      : 'kisi-kisi kuisioner, daftar pernyataan per indikator skala Likert, contoh lembar jawaban responden'} serta Lembar Pernyataan/Afirasi. Susun per bagian bernomor 6.1, 6.2, dst. gunakan tabel Markdown bila membantu.\n${scopeNote}${outlineNote}${SITASI}`,
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
    const { bab, studi, force } = req.body || {};
    if (!BAB_LIST.includes(bab)) return res.status(400).json({ error: `bab harus salah satu: ${BAB_LIST.join(', ')}` });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const extraStudi = bab === 'bab2' && studi ? ` Bahas ${Math.min(Math.max(parseInt(studi, 10) || 10, 5), 50)} studi terdahulu, 1 paragraf per studi.` : '';
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (ev: string, data: any) => res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
    if ((p.content || {})[bab] && !force) {
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

// Referensi proyek (untuk Unduh RIS + tab Pustaka): unggahan user dahulu, lalu Crossref by judul — tanpa AI, tanpa kredit
router.get('/:id/references', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { data: p, error } = await db().from('projects').select('judul,min_year,identitas').eq('id', String(req.params.id)).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const custom = Array.isArray(p.identitas?.refs) ? p.identitas.refs : [];
    res.json({ items: [...custom, ...(await crossrefTop(p.judul, 20, p.min_year))] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ---------------------------------------------------------------------------
// Unggah Artikel Sendiri (GRATIS): PDF/DOCX jurnal atau arahan pembimbing →
// diekstrak metadatanya (DOI dulu, lalu Crossref by judul) → masuk Daftar Pustaka.
// Disimpan di identitas.refs (tanpa migrasi kolom).
// ---------------------------------------------------------------------------
const upArtikel = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }).single('file');

async function crossrefByDoi(doi: string) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=admin@skripsiplg.my.id`);
    if (!res.ok) return null;
    const it: any = (await res.json()).message || {};
    return {
      doi: it.DOI || doi,
      title: (it.title || [''])[0] || '',
      authors: (it.author || []).map((a: any) => `${a.family || ''}${a.given ? ', ' + a.given : ''}`).join('; ').slice(0, 300),
      year: String(it.published?.['date-parts']?.[0]?.[0] || ''),
      url: it.URL || `https://doi.org/${doi}`,
      jurnal: (it['container-title'] || [''])[0] || '',
    };
  } catch { return null; }
}

router.post('/:id/references/upload', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    await new Promise<void>((resolve, reject) => upArtikel(req as any, res as any, (e: any) => (e ? reject(e) : resolve())));
    const id = String(req.params.id);
    const f = (req as any).file as { originalname: string; buffer: Buffer } | undefined;
    if (!f) return res.status(400).json({ error: 'Pilih berkas PDF/DOCX (maks 8 MB)' });
    if (!/\.(pdf|docx)$/i.test(f.originalname)) return res.status(400).json({ error: 'Format harus PDF atau DOCX' });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });

    let text = '';
    if (/\.docx$/i.test(f.originalname)) {
      const mammoth = await import('mammoth');
      const r = await (mammoth as any).extractRawText({ buffer: f.buffer });
      text = String(r.value || '');
    } else {
      const { pdfText } = await import('../utils/pdf');
      text = await pdfText(f.buffer, 60000);
    }
    const head = text.slice(0, 12000);

    // 1) DOI di dalam berkas
    const mDoi = head.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    let ref: any = mDoi ? await crossrefByDoi(String(mDoi[0]).replace(/[.,;)]+$/, '')) : null;

    // 2) Kalimat judul: baris panjang tanpa angka berlebih sebelum kata Abstrak/Keywords
    const baris = head.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const hentikan = (l: string) => /^(abstrak|abstract|kata kunci|keywords|pendahuluan|introduction|1\.|http|doi)/i.test(l);
    let judulTeuken = '';
    for (const l of baris.slice(0, 40)) {
      if (hentikan(l)) break;
      if (l.length >= 25 && l.length <= 220 && (l.match(/[a-zA-Z]/g) || []).length / l.length > 0.6 && !/^\d+$/.test(l)) {
        judulTeuken = l.replace(/^[\d.\s]+/, '');
        if (judulTeuken.split(' ').length >= 5) break;
      }
    }
    if (!ref && judulTeuken) {
      const kandidat = await crossrefTop(judulTeuken, 3);
      const skor = (t: string) => {
        const a = new Set(t.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
        const b = new Set(judulTeuken.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
        if (!a.size) return 0;
        let sama = 0; a.forEach((w) => { if (b.has(w)) sama++; });
        return sama / a.size;
      };
      const cocok = kandidat.map((k) => ({ k, s: skor(k.title) })).sort((x, y) => y.s - x.s)[0];
      if (cocok && cocok.s >= 0.5) ref = { ...cocok.k, jurnal: '' };
    }

    if (!ref) {
      const th = head.match(/\b(19|20)\d{2}\b/);
      const aLines = baris.slice(0, 12);
      const penulis = aLines.find((l) => /^[\p{L}][\p{L}. ,'&-]{4,80}$/u.test(l) && !hentikan(l)) || '';
      ref = {
        doi: mDoi ? String(mDoi[0]) : '',
        title: judulTeuken || f.originalname.replace(/\.(pdf|docx)$/i, ''),
        authors: penulis,
        year: th ? th[0] : '',
        url: '',
        jurnal: '',
      };
      if (!judulTeuken && !mDoi) return res.status(422).json({ error: 'Judul/DOI artikel tidak terbaca. Coba berkas yang halaman awalnya memuat judul artikel.' });
    }

    const custom = Array.isArray(p.identitas?.refs) ? [...p.identitas.refs] : [];
    const kembar = custom.some((c: any) => String(c.doi || '') === String(ref.doi || '') && String(c.title || '').toLowerCase() === String(ref.title || '').toLowerCase());
    if (kembar) return res.status(409).json({ error: 'Artikel ini sudah ada di Daftar Pustaka proyek.' });
    if (custom.length >= 10) return res.status(400).json({ error: 'Maksimal 10 artikel unggahan per proyek.' });

    const entri = {
      doi: String(ref.doi || ''),
      title: String(ref.title || ''),
      authors: String(ref.authors || ''),
      year: String(ref.year || ''),
      url: String(ref.url || ''),
      jurnal: String(ref.jurnal || ''),
      file: f.originalname,
      sumber: 'unggahan',
    };
    const ident = { ...(p.identitas || {}), refs: [entri, ...custom] };
    const { error: e2 } = await db().from('projects').update({ identitas: ident, updated_at: new Date().toISOString() }).eq('id', id);
    if (e2) throw new Error(e2.message);
    res.json({ ref: entri, refs: ident.refs, total: ident.refs.length });
  } catch (e: any) {
    if (e?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Berkas terlalu besar (maks 8 MB).' });
    res.status(500).json({ error: e.message });
  }
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
    const { bab, sub, force } = req.body || {};
    if (!OUTLINE[bab]) return res.status(400).json({ error: 'bab tidak dikenal' });
    if (!sub || String(sub).trim().length < 2) return res.status(400).json({ error: 'sub wajib diisi' });
    const { data: p, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !p) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const d = db();
    const key = `${bab}:${sub}`;
    if ((p.content || {})[key] && !force) return res.json({ text: p.content[key], cached: true, cost: 0 });
    const { data: paid } = await d.from('credit_ledger').select('id').eq('user_id', req.userId!).eq('ref', `proyek:${id}:${bab}`).limit(1);
    let cost = 0;
    if (force || ((!paid || !paid.length) && !(p.content || {})[bab])) {
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
      const { pdfText } = await import('../utils/pdf');
      text = await pdfText(f.buffer, 60000);
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

// Export .docx asli: sampul + semua bab + hyperlink DOI + footer romawi/arab + TOC
router.get('/:id/export-docx', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageNumber, NumberFormat, Footer, TableOfContents, ExternalHyperlink } = await import('docx');
    const ident = pr.identitas || {};
    const C: any[] = [];
    const center = (text: string, bold = false, size = 24) =>
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, font: 'Times New Roman', size, bold })] });
    const just = (text: string) =>
      new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 }, indent: { firstLine: 567 }, children: [new TextRun({ text, font: 'Times New Roman', size: 24 })] });
    // Sampul
    C.push(center(String(pr.judul || '').toUpperCase(), true, 28));
    if (ident.nama) C.push(center(ident.nama, true));
    if (ident.nim) C.push(center(`NIM: ${ident.nim}`));
    if (ident.kampus || ident.jurusan || ident.fakultas) C.push(center([ident.kampus, ident.jurusan, ident.fakultas].filter(Boolean).join(' — '), true));
    const mdBody = (md: string) => {
      for (const raw of String(md || '').split('\n')) {
        const line = raw.trim();
        if (!line) continue;
        const h = line.match(/^(#{1,3})\s+(.*)/);
        if (h) {
          C.push(new Paragraph({ heading: h[1].length === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2, alignment: h[1].length === 1 ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: h[2].replace(/\*\*/g, ''), font: 'Times New Roman', size: 28, bold: true })] }));
          continue;
        }
        const parts = line.split(/(https?:\/\/doi\.org\/[^\s)]+|https?:\/\/[^\s)]+)/g);
        const runs: any[] = [];
        parts.forEach((seg, i) => {
          if (/^https?:\/\//.test(seg)) runs.push(new ExternalHyperlink({ children: [new TextRun({ text: seg, style: 'Hyperlink', font: 'Times New Roman', size: 24 })], link: seg }));
          else runs.push(new TextRun({ text: seg.replace(/\*\*/g, ''), font: 'Times New Roman', size: 24 }));
        });
        const mSub = line.match(/^(\d+\.\d+(?:\.\d+)?)\s+(\S.*)/);
        if (mSub && line.length < 120) {
          C.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: line.replace(/\*\*/g, ''), font: 'Times New Roman', size: 24, bold: true })] }));
        } else {
          C.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 }, indent: { firstLine: 567 }, children: runs }));
        }
      }
    };
    if (pr.content?.abstrak) {
      C.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ABSTRAK', font: 'Times New Roman', size: 28, bold: true })] }));
      mdBody(pr.content.abstrak);
    }
    const order = ['bab1', 'bab2', 'bab3', 'bab4', 'bab5'];
    for (const b of order) if (pr.content?.[b]) mdBody(pr.content[b]);
    if (pr.content?.lampiran) {
      C.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'LAMPIRAN', font: 'Times New Roman', size: 28, bold: true })] }));
      mdBody(pr.content.lampiran);
    }
    const doc = new Document({
      creator: 'Skripsi Palembang',
      title: String(pr.judul || ''),
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 2268, left: 2268, bottom: 1701, right: 1701 } } },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT] })] })] }) },
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DAFTAR ISI', font: 'Times New Roman', size: 28, bold: true })] }),
          new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: '1-2' }),
          ...C,
        ],
      }],
    });
    const buf = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="skripsi.docx"');
    res.send(Buffer.from(buf));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ---------------------------------------------------------------------------
// Helpers: ambil / ganti satu sub-bab di dalam teks sebuah bab
// ---------------------------------------------------------------------------
const RE_SUB = /^\d+\.\d+(?:\.\d+)?\s+\S/;

function batasBagian(lines: string[], start: number): number {
  for (let j = start + 1; j < lines.length; j++) {
    const t = lines[j].trim();
    if (!t) continue;
    if (RE_SUB.test(t) || /^BAB\s+[IVX]+/i.test(t) || /^DAFTAR PUSTAKA/i.test(t)) return j;
  }
  return lines.length;
}

// Cari judul sub-babnya: baris pendek lebih dulu (mis. "2.6 Hipotesis"),
// biar paragraf biasa yang kebetulan menyebut kata kunci tidak dianggap judul.
function cariJudul(lines: string[], re: RegExp): number {
  const pendek = lines.findIndex((l) => l.trim().length <= 110 && re.test(l.trim()));
  return pendek >= 0 ? pendek : lines.findIndex((l) => re.test(l.trim()));
}

function ambilBagian(text: string, re: RegExp): string {
  const lines = String(text || '').split('\n');
  const start = cariJudul(lines, re);
  if (start < 0) return '';
  return lines.slice(start + 1, batasBagian(lines, start)).join('\n').trim();
}

function gantiBagian(text: string, re: RegExp, body: string): string | null {
  const lines = String(text || '').split('\n');
  const start = cariJudul(lines, re);
  if (start < 0) return null;
  const end = batasBagian(lines, start);
  const isi = String(body || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!isi.length) return null;
  return [...lines.slice(0, start), lines[start], '', ...isi, '', ...lines.slice(end)]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

function parseJson<T>(s: string, fallback: T): T {
  const t = String(s || '').replace(/```json/gi, '').replace(/```/g, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) return fallback;
  try { return JSON.parse(t.slice(a, b + 1)) as T; } catch { return fallback; }
}

function ambilTeks(content: any, keys: string[], perBab = 6000) {
  return keys.map((k) => (content?.[k] ? `\n=== ${k.toUpperCase()} ===\n${String(content[k]).slice(0, perBab)}` : '')).join('').slice(0, perBab * keys.length);
}

// Kembalikan kredit bila generate gagal / hasil tidak terbaca (sama seperti pola bab)
async function addCreditsRefund(userId: string, feature: string, ref: string) {
  try {
    const { addCredits, FEATURE_COSTS } = await import('../services/credits.service');
    await addCredits(userId, FEATURE_COSTS[feature] ?? 1, ref);
  } catch { /* abaikan */ }
}

// Tinjau Hasil (5 kredit): kelebihan, kekurangan & pertanyaan penguji dari draf sekarang
router.post('/:id/tinjau', requireAuthOrKey, async (req: AuthRequest, res) => {
  const id = String(req.params.id);
  try {
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    if (!pr.content || !Object.keys(pr.content).length) return res.status(400).json({ error: 'Belum ada bab yang bisa ditinjau. Generate minimal Bab I dulu.' });
    try {
      await consumeCredits(req.userId!, 'tinjau', `proyek:${id}:tinjau`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const teks = ambilTeks(pr.content, ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'abstrak', 'lampiran'], 5000);
    let out = '';
    try {
      out = await generateContent(
        `Kamu dosen pembimbing dan penguji skripsi yang kritis. Analisis draf skripsi berikut (judul: ${pr.judul}; metode: ${pr.metode}).\n` +
        `${teks.slice(0, 30000)}\n\n` +
        `Balas HANYA JSON valid tanpa teks lain, tanpa markdown, dengan struktur (ketiga kunci wajib ada dan berisi butir):\n` +
        `{"kelebihan":["3-5 butir spesifik yang sudah baik"],"kekurangan":["4-6 butir paling rawan diperiksa penguji, konkret + lokasi sub-babnya"],"pertanyaan":["4-6 pertanyaan penguji yang paling mungkin diajukan beserta inti jawabannya"]}`
      );
    } catch (e: any) {
      await addCreditsRefund(req.userId!, 'tinjau', `refund:${id}:tinjau-gagal`);
      throw e;
    }
    const j: any = parseJson(out, {});
    const rapih = (arr: any[]) => (Array.isArray(arr) ? arr : [])
      .map((x) => (typeof x === 'string'
        ? x
        : x && typeof x === 'object'
          ? String(x.pertanyaan ?? x.q ?? x.isi ?? x.tes ?? x.jawaban ?? x.teks ?? '')
          : ''))
      .map((x) => x.replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean).slice(0, 10);
    // Kunci JSON bisa berganti nama antar panggilan (model), jadi cari juga lewat token.
    const pick = (keys: string[], tokens: string[]) => {
      const low: Record<string, any> = {};
      for (const k of Object.keys(j || {})) low[String(k).toLowerCase().trim()] = j[k];
      for (const k of keys) {
        const v = j?.[k] ?? low[k.toLowerCase()];
        if (Array.isArray(v)) return v;
      }
      for (const [k, v] of Object.entries(low)) {
        if (Array.isArray(v) && tokens.some((t) => k.includes(t))) return v;
      }
      return [];
    };
    const hasil = {
      kelebihan: rapih(pick(['kelebihan', 'strengths'], ['kelebihan', 'strength'])),
      kekurangan: rapih(pick(['kekurangan', 'kelemahan', 'weaknesses'], ['kekurangan', 'kelemahan', 'weakness'])),
      pertanyaan: rapih(pick(['pertanyaan', 'pertanyaan_penguji', 'pertanyaan penelitian', 'questions'], ['pertanyaan', 'penguji', 'question'])),
    };
    // Bila bagian pertanyaan tidak ikut terkirim, minta ulang secara khusus (tanpa potong kredit).
    if (!hasil.pertanyaan.length) {
      try {
        const out2 = await generateContent(
          `Dari draf skripsi berikut (judul: ${pr.judul}; metode: ${pr.metode}), buatkan 4-6 pertanyaan penguji sidang yang paling mungkin diajukan beserta inti jawabannya.\n` +
          `${teks.slice(0, 8000)}\n\nBalas HANYA JSON valid: {"pertanyaan":["..."]}`
        );
        const j2: any = parseJson<any>(out2, {});
        const v = Array.isArray(j2.pertanyaan) ? j2.pertanyaan
          : Object.values(j2).find((x) => Array.isArray(x) && x.every((y: any) => typeof y === 'string' || typeof y === 'object')) || [];
        hasil.pertanyaan = rapih(v as any[]);
      } catch { /* biarkan kosong */ }
    }
    if (!hasil.kelebihan.length && !hasil.kekurangan.length) {
      await addCreditsRefund(req.userId!, 'tinjau', `refund:${id}:tinjau-gagal`);
      return res.status(502).json({ error: 'Hasil tinjauan tidak terbaca. Coba lagi.' });
    }
    res.json({ hasil });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Sesuaikan Skripsi (5 kredit): rapikan tujuan, hipotesis, kerangka konsep & Bab III
// agar selaras dengan rumusan masalah terbaru, lalu timpa bagiannya di naskah.
router.post('/:id/sesuaikan', requireAuthOrKey, async (req: AuthRequest, res) => {
  const id = String(req.params.id);
  try {
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const c = pr.content || {};
    const rumusan = ambilBagian(c.bab1 || '', /rumusan masalah/i);
    if (!rumusan) return res.status(400).json({ error: 'Rumusan Masalah belum ada di Bab I. Generate Bab I dulu, baru Sesuaikan Skripsi.' });
    if (!c.bab1 && !c.bab2 && !c.bab3) return res.status(400).json({ error: 'Belum ada Bab I–III untuk disesuaikan.' });
    try {
      await consumeCredits(req.userId!, 'sesuaikan', `proyek:${id}:sesuaikan`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }

    const hipotesis = ambilBagian(c.bab2 || '', /hipotesis/i);
    const kerangka = ambilBagian(c.bab2 || '', /kerangka (berpikir|teori|konsep)/i);
    let out = '';
    try {
      out = await generateContent(
        `Tugas: menyesuaikan bagian-bagian skripsi berikut agar selaras RUMUSAN MASALAH.\nJudul: ${pr.judul}\nMetode: ${pr.metode}\n\n` +
        `--- RUMUSAN MASALAH (Bab I) ---\n${rumusan.slice(0, 4000)}\n\n` +
        `--- TUJUAN PENELITIAN saat ini ---\n${ambilBagian(c.bab1 || '', /tujuan penelitian/i).slice(0, 2000) || '(belum ada)'}\n\n` +
        `--- HIPOTESIS saat ini ---\n${hipotesis.slice(0, 2000) || '(belum ada)'}\n\n` +
        `--- KERANGKA BERPIKIR saat ini ---\n${kerangka.slice(0, 2000) || '(belum ada)'}\n\n` +
        `--- BAB III (metode) ---\n${String(c.bab3 || '').slice(0, 6000) || '(belum ada)'}\n\n` +
        `Balas HANYA JSON valid tanpa markdown, tanpa penjelasan:\n` +
        `{"tujuan":"isi paragraf tujuan penelitian baru (tanpa judul sub-bab), tiap butik rumusan masalah sejajar","hipotesis":"isi hipotesis baru tanpa judul sub-bab (kosong bila kualitatif/hipotesis tidak ada)","kerangka":"isi kerangka berpikir baru tanpa judul sub-bab","catatan_bab3":["3-5 butir penyesuaian Bab III yang perlu kamu lakukan manual"]}`
      );
    } catch (e: any) {
      await addCreditsRefund(req.userId!, 'sesuaikan', `refund:${id}:sesuaikan-gagal`);
      throw e;
    }
    const j: any = parseJson(out, {});

    const baru: Record<string, string> = {};
    const diterapkan: { key: string; judul: string }[] = [];
    const pasang = (key: string, re: RegExp, judul: string, body: any) => {
      const teks = Array.isArray(body) ? body.join('\n\n') : String(body || '').trim();
      if (!teks) return;
      const g = gantiBagian(String(baru[key] ?? c[key] ?? ''), re, teks);
      if (g) { baru[key] = g; diterapkan.push({ key, judul }); }
    };
    pasang('bab1', /tujuan penelitian/i, '1.x Tujuan Penelitian (Bab I)', j.tujuan);
    if (c.bab2) {
      pasang('bab2', /hipotesis/i, 'Hipotesis (Bab II)', j.hipotesis);
      pasang('bab2', /kerangka (berpikir|teori|konsep)/i, 'Kerangka Berpikir (Bab II)', j.kerangka);
    }

    if (!diterapkan.length) {
      await addCreditsRefund(req.userId!, 'sesuaikan', `refund:${id}:sesuaikan-tidak-diterapkan`);
      return res.status(422).json({
        error: 'Sub-bab Tujuan Penelitian/Hipotesis/Kerangka tidak ditemukan di naskah, jadi belum ada yang ditimpa. Kredit dikembalikan.',
        catatan: (j.catatan_bab3 || []).filter((x: any) => typeof x === 'string'),
      });
    }

    const content = { ...c, ...baru };
    const { error: e2 } = await db().from('projects').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    if (e2) throw new Error(e2.message);
    res.json({
      ok: true,
      diterapkan,
      catatan: (j.catatan_bab3 || []).filter((x: any) => typeof x === 'string').slice(0, 8),
      isi: { tujuan: String(j.tujuan || ''), hipotesis: String(j.hipotesis || ''), kerangka: String(j.kerangka || '') },
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Cek Sitasi (GRATIS): deteksi sitasi "yatim" (tidak ada di daftar referensi proyek)
router.post('/:id/cek-sitasi', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { data: pr, error } = await db().from('projects').select('*').eq('id', id).eq('user_id', req.userId!).single();
    if (error || !pr) return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    const c = pr.content || {};
    const teks = ambilTeks(c, ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'abstrak', 'lampiran', 'artikel', 'karil'], 40000);

    // 1) Kumpulkan sitasi: (Penulis, Tahun) termasuk gabungan (A, 2020; B, 2018) dan gaya naratif Penulis (2020)
    const unik = new Map<string, { penulis: string; tahun: string }>();
    const simpan = (raw: string, penulis: string, tahun: string) => {
      const k = raw.trim().replace(/\s+/g, ' ');
      if (k.length < 6 || !/^(19|20)\d{2}$/.test(tahun)) return;
      if (!unik.has(k)) unik.set(k, { penulis: penulis.trim(), tahun });
    };
    for (const g of teks.match(/\([^()]{1,200}\)/g) || []) {
      if (!/\b(19|20)\d{2}\b/.test(g)) continue;
      for (const potong of g.slice(1, -1).split(';')) {
        const t = potong.trim().replace(/\s+/g, ' ');
        const m = t.match(/^(.{2,70}?)\s*,?\s+((?:19|20)\d{2})[a-z]?$/i);
        if (m && m[1].length > 1) simpan(t, m[1], m[2]);
      }
    }
    const nar = [...teks.matchAll(/\b([\p{L}][\p{L}'’.-]{2,30}(?:\s+(?:dkk\.?|et al\.?|dll\.?))?)\s+\(((?:19|20)\d{2})[a-z]?\)/gu)];
    for (const m of nar) simpan(`${m[1]}, ${m[2]}`, m[1], m[2]);

    const daftar = [...unik.entries()].slice(0, 300).map(([raw, v]) => ({ raw, ...v }));
    if (!daftar.length) return res.json({ total: 0, nyata: 0, perluDitinjau: 0, semuaCocok: true, temuan: [], catatan: 'Belum ada sitasi (Penulis, Tahun) di naskah.' });

    // 2) Cocokkan dengan Daftar Pustaka proyek (unggahan + Crossref by judul)
    const custom = Array.isArray(pr.identitas?.refs) ? pr.identitas.refs : [];
    const refs = [...custom, ...(await crossrefTop(pr.judul, 20, pr.min_year))];
    const nurut = (s: string) => String(s || '').toLowerCase().replace(/[^\p{L}\s]/gu, '');
    const kata = (s: string) => nurut(s).split(/\s+/).filter(Boolean);
    const cocokRef = (penulis: string, tahun: string) => {
      const p = kata(penulis).filter((w) => !['et', 'al', 'dkk', 'dll', 'dan', 'dkk', 'dengan', 'lain', 'the', 'of'].includes(w));
      const nama = p[0] || '';
      if (!nama) return null;
      return refs.find((r: any) => String(r.year || '') === tahun && p.every((w) => nurut(r.authors).includes(w))) || null;
    };

    const temuan = daftar.map((d) => {
      const r = cocokRef(d.penulis, d.tahun);
      return {
        raw: d.raw, penulis: d.penulis, tahun: d.tahun,
        status: r ? 'nyata' : 'yatim',
        dukungan: r ? (r.doi || r.url ? 'kuat' : 'lemah') : null,
        rujukan: r ? { title: r.title, authors: r.authors, year: r.year, doi: r.doi || '', url: r.url || '', sumber: r.sumber || 'crossref' } : null,
        saran: null as any,
      };
    });

    // 3) Sitasi yatim diverifikasi ke Crossref (maks 8) — boleh nyata di luar, tapi belum ada di Daftar Pustakamu
    const yatim = temuan.filter((t) => t.status === 'yatim').slice(0, 8);
    await Promise.all(yatim.map(async (t) => {
      const cari = await crossrefTop(`${t.penulis} ${t.tahun}`, 5, Number(t.tahun) || null);
      const nama = kata(t.penulis).filter((w) => !['et', 'al', 'dkk', 'dll', 'dan'].includes(w))[0] || '';
      const ada = cari.find((r) => String(r.year) === t.tahun && nurut(r.authors).includes(nama) && (r.title || '').length > 10);
      if (ada) { t.dukungan = 'lemah'; t.saran = { title: ada.title, authors: ada.authors, year: ada.year, doi: ada.doi, url: ada.url }; }
    }));

    const nyata = temuan.filter((t) => t.status === 'nyata').length;
    const perluDitinjau = temuan.length - nyata;
    res.json({
      total: temuan.length, nyata, perluDitinjau, semuaCocok: perluDitinjau === 0,
      temuan: [...temuan.filter((t) => t.status === 'yatim'), ...temuan.filter((t) => t.status === 'nyata')],
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
