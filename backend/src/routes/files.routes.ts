import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { requireAuthOrKey } from '../middleware/apiKey';
import { consumeCredits, addCredits } from '../services/credits.service';
import { generateContent } from '../services/ai.service';
import { crossrefTop } from './projects.routes';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

async function extractText(file: Express.Multer.File): Promise<string> {
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.pdf')) {
    const pdf = await import('pdf-parse');
    const fn = (pdf as any).default || pdf;
    const r = await fn(file.buffer);
    return String(r.text || '').slice(0, 20000);
  }
  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth');
    const r = await (mammoth as any).extractRawText({ buffer: file.buffer });
    return String(r.value || '').slice(0, 20000);
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_csv(ws).slice(0, 20000);
  }
  return file.buffer.toString('utf-8').slice(0, 20000);
}

router.post('/extract', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {  try {
    if (!req.file) return res.status(400).json({ error: 'File wajib (pdf/docx/xlsx/csv/txt, maks 10MB)' });
    res.json({ filename: req.file.originalname, text: await extractText(req.file) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Rapihkan dua-langkah ala referensi: analisis struktur dulu, lalu terapkan.
// POST /rapihkan/analisis (multipart file) -> { setelan, judul[], paragraf[], statistik }
router.post('/rapihkan/analisis', requireAuthOrKey, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload file .docx (maks 15 MB)' });
    if (!/\.docx$/i.test(req.file.originalname)) return res.status(400).json({ error: 'Berkas harus .docx (Word). PDF belum bisa.' });
    const mammoth = await import('mammoth');
    const cheerio = await import('cheerio');
    const { value: html } = await (mammoth as any).convertToHtml({ buffer: req.file.buffer });
    const $ = (cheerio as any).load(html);
    const judul: any[] = [];
    const paragraf: any[] = [];
    let idx = 0, tables = 0, images = 0;
    const norm = (el: any) => $(el).text().replace(/\s+/g, ' ').trim();
    $('h1, h2, h3, p, li, table, img').each((_: any, el: any) => {
      const tag = ((el as any).tagName || '').toLowerCase();
      if (tag === 'table') { tables++; return; }
      if (tag === 'img') { images++; return; }
      const text = norm(el);
      if (!text) return;
      const myIdx = idx++;
      if (tag === 'h1') judul.push({ idx: myIdx, tingkat: 1, asal: 'gaya', teks: text.slice(0, 160), nomorLama: '', ragu: false });
      else if (tag === 'h2') judul.push({ idx: myIdx, tingkat: 2, asal: 'gaya', teks: text.slice(0, 160), nomorLama: '', ragu: false });
      else if (tag === 'h3') judul.push({ idx: myIdx, tingkat: 3, asal: 'gaya', teks: text.slice(0, 160), nomorLama: '', ragu: false });
      else {
        const mBab = text.match(/^(BAB\s+[IVX]+)\b\s*[:.-]?\s*(.*)$/i);
        const mNum = text.match(/^(\d+(?:\.\d+){0,2})\s+(.{4,120})$/);
        const isCaps = text.length < 90 && text === text.toUpperCase() && /[A-Z]{3,}/.test(text);
        if (mBab) judul.push({ idx: myIdx, tingkat: 1, asal: 'pola', teks: text.slice(0, 160), nomorLama: '', ragu: false, bab: true });
        else if (mNum) {
          const depth = mNum[1].split('.').length;
          judul.push({ idx: myIdx, tingkat: Math.min(depth, 3), asal: 'pola', teks: text.slice(0, 160), nomorLama: mNum[1], ragu: false });
        } else if (isCaps) judul.push({ idx: myIdx, tingkat: 2, asal: 'pola', teks: text.slice(0, 160), nomorLama: '', ragu: true });
        if (paragraf.length < 400) paragraf.push({ idx: myIdx, teks: text.slice(0, 220) });
      }
    });
    const setelan = {
      marginAtasCm: 4, marginBawahCm: 3, marginKiriCm: 4, marginKananCm: 3,
      font: 'Times New Roman', ukuranPt: 12, spasi: 1.5, indentCm: 1.27,
      nomorBab: 'romawi', nomorSubBab: 'angka', daftarIsi: '3', nomorHalaman: 'romawi-arab',
      autoHeading: true, rataKiriKanan: true, babHalamanBaru: true,
      gantungDaftarPustaka: true, buangDaftarIsiLama: true, sertakanTabel: true,
    };
    res.json({
      setelan,
      judul, paragraf,
      statistik: { paragraf: paragraf.length, tabel: tables, gambar: images, catatanKaki: 0, punyaTocLama: /daftar isi/i.test(html.slice(0, 2000)) },
      gagalWaras: judul.length === 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /rapihkan/terapkan (multipart file + setelan JSON + koreksi JSON) -> .docx + header X-Rapih-Ringkasan
router.post('/rapihkan/terapkan', requireAuthOrKey, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload file .docx' });
    const { createHash } = await import('crypto');
    const fhash = createHash('sha256').update(req.file.buffer).digest('hex');
    const db = (await import('../config/supabase')).supabaseAdmin || (await import('../config/supabase')).supabaseAnon;
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: prev } = await db.from('credit_ledger').select('id').eq('user_id', (req as any).userId!).eq('ref', `rapihkan:${fhash}`).gte('created_at', dayAgo).limit(1);
    let tarif = 1;
    if (!prev || !prev.length) {
      try {
        await consumeCredits((req as any).userId!, 'dokumen', `rapihkan:${fhash}`);
      } catch (e: any) {
        if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
        throw e;
      }
    } else tarif = 0;
    const setelan = JSON.parse(String(req.body?.setelan || '{}'));
    const koreksi: any[] = JSON.parse(String(req.body?.koreksi || '[]'));
    const S = {
      marginAtasCm: 4, marginBawahCm: 3, marginKiriCm: 4, marginKananCm: 3,
      font: 'Times New Roman', ukuranPt: 12, spasi: 1.5, indentCm: 1.27,
      nomorBab: 'romawi', nomorSubBab: 'angka', daftarIsi: '3', nomorHalaman: 'romawi-arab',
      autoHeading: true, rataKiriKanan: true, babHalamanBaru: true,
      gantungDaftarPustaka: false, buangDaftarIsiLama: true, sertakanTabel: true, ...setelan,
    };
    const mammoth = await import('mammoth');
    const cheerio = await import('cheerio');
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageNumberElement, Footer, TableOfContents } = await import('docx');
    const { value: html } = await (mammoth as any).convertToHtml({ buffer: req.file.buffer });
    const $ = (cheerio as any).load(html);
    const TW = 567;
    const lvlOf = new Map<number, number | null>(koreksi.map((k: any) => [k.idx, k.tingkat === 'bukan' ? null : Number(k.tingkat)]));
    const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    let babNo = 0;
    const body: any[] = [];
    let diubah = 0, ditandai = 0;
    const norm = (el: any) => $(el).text().replace(/\s+/g, ' ').trim();
    const F = (n: number) => ({ font: S.font, size: Math.round(n * 2) });
    let idx = 0;
    const isTocPara = (text: string) => S.buangDaftarIsiLama && /^\s*(daftar isi|daftar tabel|daftar gambar)\b/i.test(text) && text.length < 40;
    $('h1, h2, h3, p, li').each((_: any, el: any) => {
      const tag = ((el as any).tagName || '').toLowerCase();
      const text = norm(el);
      if (!text || isTocPara(text)) return;
      const myIdx = idx++;
      let lvl: number | null | undefined = lvlOf.has(myIdx) ? lvlOf.get(myIdx) : undefined;
      if (lvl === undefined) {
        if (tag === 'h1') lvl = 1;
        else if (tag === 'h2') lvl = 2;
        else if (tag === 'h3') lvl = 3;
        else {
          const mB = text.match(/^BAB\s+[IVX]+\b/i);
          const mN = text.match(/^(\d+(?:\.\d+){0,2})\s+.{4,}/);
          if (mB) lvl = 1;
          else if (mN) lvl = Math.min(mN[1].split('.').length, 3);
          else lvl = null;
        }
      }
      if (lvl === 1) {
        babNo++;
        let title = text.replace(/^(BAB\s+[IVX0-9]+)\b\s*[:.-]?\s*/i, '').trim() || text;
        const label = S.nomorBab === 'arab' ? `BAB ${babNo}` : `BAB ${ROM[babNo - 1] || babNo}`;
        body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, ...(S.babHalamanBaru ? { pageBreakBefore: true } : {}), children: [new TextRun({ text: `${label} ${title}`.trim(), ...F(S.ukuranPt + 2), bold: true })] }));
        ditandai++;
      } else if (lvl === 2 || lvl === 3) {
        body.push(new Paragraph({ heading: lvl === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3, children: [new TextRun({ text, ...F(S.ukuranPt), bold: true })] }));
        ditandai++;
      } else {
        diubah++;
        body.push(new Paragraph({
          alignment: S.rataKiriKanan ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
          spacing: { line: Math.round(S.spasi * 240) },
          indent: S.indentCm ? { firstLine: Math.round(S.indentCm * TW) } : undefined,
          children: [new TextRun({ text, ...F(S.ukuranPt) })],
        }));
      }
    });
    const children: any[] = [];
    if (S.daftarIsi !== 'mati') {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DAFTAR ISI', ...F(S.ukuranPt + 2), bold: true })] }));
      children.push(new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: S.daftarIsi === '2' ? '1-2' : '1-3' }));
    }
    children.push(...body);
    let footer: any = undefined;
    if (S.nomorHalaman !== 'mati') {
      footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new PageNumberElement()] })] });
    }
    const doc = new Document({
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: Math.round(S.marginAtasCm * TW), left: Math.round(S.marginKiriCm * TW), bottom: Math.round(S.marginBawahCm * TW), right: Math.round(S.marginKananCm * TW) } } },
        footers: footer ? { default: footer } : undefined,
        children,
      }],
    });
    const buf = await Packer.toBuffer(doc);
    const ringkasan = { tarif, paragrafDiubah: diubah, judulDitandai: ditandai, bagian: 1, paragrafTabelDilewati: 0, gratis: tarif === 0 };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname.replace(/\.docx$/i, '')} (rapih).docx"`);
    res.setHeader('X-Rapih-Ringkasan', encodeURIComponent(JSON.stringify(ringkasan)));
    res.send(Buffer.from(buf));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Rapihkan .docx (legacy satu-langkah; disarankan /rapihkan/analisis + /rapihkan/terapkan)
router.post('/rapihkan', requireAuthOrKey, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload file .docx (maks 15 MB)' });
    if (!/\.docx$/i.test(req.file.originalname)) return res.status(400).json({ error: 'Hanya .docx yang didukung' });
    try {
      await consumeCredits(req.userId!, 'dokumen', 'rapihkan:docx');
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const mammoth = await import('mammoth');
    const cheerio = await import('cheerio');
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageNumberElement, Footer, TableOfContents } = await import('docx');
    const { value: html } = await (mammoth as any).convertToHtml({ buffer: req.file.buffer });
    const $ = (cheerio as any).load(html);
    const CM = 567; // twips per cm
    const body: any[] = [];
    let h1 = 0, h2 = 0, paras = 0;
    const norm = (el: any) => $(el).text().replace(/\s+/g, ' ').trim();
    $('h1, h2, h3, p, li').each((_: any, el: any) => {
      const tag = ((el as any).tagName || '').toLowerCase();
      const text = norm(el);
      if (!text) return;
      const base = { font: 'Times New Roman', size: 24 };
      if (tag === 'h1') {
        h1++;
        body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text, ...base, bold: true })] }));
      } else if (tag === 'h2' || tag === 'h3') {
        h2++;
        body.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, ...base, bold: true })] }));
      } else {
        paras++;
        const isList = tag === 'li';
        body.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360 },
          indent: isList ? undefined : { firstLine: 567 },
          children: [new TextRun({ text: (isList ? '• ' : '') + text, ...base })],
        }));
      }
    });
    if (!body.length) return res.status(400).json({ error: 'Dokumen kosong / tidak terbaca' });
    const doc = new Document({
      sections: [{
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: 4 * CM, left: 4 * CM, bottom: 3 * CM, right: 3 * CM } },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Halaman ', font: 'Times New Roman', size: 20 }), new PageNumberElement()] })],
          }),
        },
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DAFTAR ISI', font: 'Times New Roman', size: 28, bold: true })] }),
          new TableOfContents('Daftar Isi — klik kanan > Update Field', { hyperlink: true, headingStyleRange: '1-2' }),
          ...body,
        ],
      }],
    });
    const buf = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="rapi-skripsi.docx"');
    res.setHeader('X-Rapi-Stat', JSON.stringify({ heading1: h1, heading2: h2, paragraf: paras }));
    res.send(Buffer.from(buf));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/pptx', requireAuthOrKey, async (req: AuthRequest, res) => {  try {
    const { jenis = 'sempro', materi = '', judul = 'Presentasi' } = req.body || {};
    if (!materi || String(materi).length < 50) return res.status(400).json({ error: 'Materi minimal 50 karakter (paste atau upload dulu)' });
    try {
      await consumeCredits(req.userId!, 'ppt', 'ppt:generate');
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const outline = await generateContent(
      `Buatkan outline ${jenis === 'sempro' ? 'Seminar Proposal (10 slide)' : 'Seminar Hasil (12 slide)'} dari materi berikut. Format JSON array: [{"title":"...","points":["...","..."]}]. Hanya JSON, tanpa markdown fence.\n\n${String(materi).slice(0, 8000)}`
    ).catch(async (e) => {
      await addCredits(req.userId!, 8, 'refund:pptx-gagal').catch(() => {});
      throw e;
    });
    let slides: { title: string; points: string[] }[] = [];
    try {
      const clean = outline.replace(/```json|```/g, '').trim();
      slides = JSON.parse(clean.slice(clean.indexOf('[')));
    } catch { /* fallback di bawah */ }
    if (!Array.isArray(slides) || slides.length === 0) {
      slides = String(outline).split('\n').filter((l) => l.trim()).slice(0, 12).map((l, i) => ({ title: `Slide ${i + 1}`, points: [l.trim().slice(0, 200)] }));
    }
    const PptxGen = (await import('pptxgenjs')).default;
    const pptx = new PptxGen();
    pptx.defineLayout({ name: 'W16x9', width: 13.33, height: 7.5 });
    pptx.layout = 'W16x9';
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: '1E3A8A' };
    titleSlide.addText(String(judul).slice(0, 80), { x: 0.5, y: 2.5, w: 12.3, h: 1.2, fontSize: 32, bold: true, color: 'FFFFFF', align: 'center' });
    titleSlide.addText(jenis === 'sempro' ? 'Seminar Proposal' : 'Seminar Hasil', { x: 0.5, y: 4, w: 12.3, h: 0.8, fontSize: 20, color: 'F59E0B', align: 'center' });
    for (const s of slides.slice(0, 18)) {
      const sl = pptx.addSlide();
      sl.addText(String(s.title || '').slice(0, 90), { x: 0.5, y: 0.3, w: 12.3, h: 0.9, fontSize: 26, bold: true, color: '1E3A8A' });
      sl.addText((s.points || []).map((p) => ({ text: '• ' + String(p).slice(0, 220), options: { fontSize: 16, breakLine: true } })), { x: 0.7, y: 1.5, w: 11.9, h: 5.3, color: '222222' });
    }
    const buf = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="presentasi-${jenis}.pptx"`);
    res.send(Buffer.from(buf));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/spss', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    let csv = (req.body?.csv || '') as string;
    if (req.file) {
      const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
      csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]).slice(0, 20000);
    }
    if (!csv) return res.status(400).json({ error: 'Kirim csv (teks) atau upload xlsx/csv' });
    try {
      await consumeCredits(req.userId!, 'spss', 'olahdata:spss');
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const rows = csv.trim().split('\n').map((l) => l.split(/[;,]/).map((v) => v.trim()));
    const header = rows[0];
    const desc = header.map((h, c) => {
      const col = rows.slice(1).map((r) => parseFloat(r[c])).filter((v) => !isNaN(v));
      if (!col.length) return null;
      const mean = col.reduce((a, b) => a + b, 0) / col.length;
      const sd = Math.sqrt(col.reduce((a, b) => a + (b - mean) ** 2, 0) / col.length);
      return { variabel: h, n: col.length, mean: +mean.toFixed(3), sd: +sd.toFixed(3), min: Math.min(...col), max: Math.max(...col) };
    }).filter(Boolean);
    let interpretasi: string;
    try {
      interpretasi = await generateContent(`Berperan sebagai dosen statistik. Data: ${header.join(', ')} (${rows.length - 1} responden). Statistik deskriptif: ${JSON.stringify(desc)}. Tulis interpretasi gaya SPSS (validitas/reliabilitas belum dihitung tanpa item detail) + saran uji lanjutan (asumsi klasik, regresi) dalam Markdown Indonesia.`);
    } catch (e: any) {
      await addCredits(req.userId!, 3, 'refund:spss-gagal').catch(() => {});
      throw e;
    }
    res.json({ deskriptif: desc, n: rows.length - 1, interpretasi });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Pencarian referensi nyata ber-DOI via OpenAlex (gratis, tanpa kredit, tanpa login)
router.get('/referensi', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (q.trim().length < 3) return res.status(400).json({ error: 'q minimal 3 karakter' });
    const since = req.query.since ? parseInt(String(req.query.since), 10) : null;
    const lang = req.query.lang === 'id' ? 'id' : req.query.lang === 'en' ? 'en' : null;
    const page = Math.min(Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1), 20);
    const { openalexTop } = await import('./projects.routes');
    const r = await openalexTop(q, 10, since, lang, page);
    res.json({ items: r.items, total: r.total, page });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
