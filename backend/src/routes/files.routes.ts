import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { AuthRequest, requireAuth } from '../middleware/auth';
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

router.post('/pptx', requireAuth, async (req: AuthRequest, res) => {
  try {
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
