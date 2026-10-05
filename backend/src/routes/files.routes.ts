import { Router } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { requireAuthOrKey } from '../middleware/apiKey';
import { consumeCredits, addCredits, FEATURE_COSTS } from '../services/credits.service';
import { generateContent } from '../services/ai.service';
import { crossrefTop } from './projects.routes';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

async function extractText(file: Express.Multer.File): Promise<string> {
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.pdf')) {
    const { pdfText } = await import('../utils/pdf');
    return (await pdfText(file.buffer, 20000)).slice(0, 20000);
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
    if (!req.file) return res.status(400).json({ error: 'Upload file .docx (maks 8 MB)' });
    if (!/\.docx$/i.test(req.file.originalname)) return res.status(400).json({ error: 'Berkas harus .docx (Word). PDF belum bisa.' });
    const mammoth = await import('mammoth');
    const cheerio = await import('cheerio');
    const { value: html } = await (mammoth as any).convertToHtml({ buffer: req.file.buffer });
    const $ = (cheerio as any).load(html);
    const rawXml = req.file.buffer.toString('latin1');
    const footCount = (rawXml.match(/w:footnoteReference/g) || []).length;
    const judul: any[] = [];
    const paragraf: any[] = [];
    let idx = 0;
    const tables = $('table').length;
    const images = $('img').length;
    const norm = (el: any) => $(el).text().replace(/\s+/g, ' ').trim();
    $('body').children('h1, h2, h3, p, li').each((_: any, el: any) => {
      const tag = ((el as any).tagName || '').toLowerCase();
      const text = norm(el);
      if (!text) return;
      // Wajib sama persis dengan terapkan supaya idx koreksi level tidak meleset
      if (/^\s*(daftar isi|daftar tabel|daftar gambar)\b/i.test(text) && text.length < 40) return;
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
      marginAtasCm: 3, marginBawahCm: 3, marginKiriCm: 4, marginKananCm: 3,
      font: 'Times New Roman', ukuranPt: 12, spasi: 1.5, indentCm: 1.27,
      nomorBab: 'romawi', nomorSubBab: 'angka', daftarIsi: '3', nomorHalaman: 'romawi-arab',
      autoHeading: true, rataKiriKanan: true, babHalamanBaru: true,
      gantungDaftarPustaka: true, buangDaftarIsiLama: true, sertakanTabel: true,
    };
    res.json({
      setelan,
      judul, paragraf,
      statistik: { paragraf: $('body').children('p, h1, h2, h3, li').length, tabel: tables, gambar: images, catatanKaki: footCount, punyaTocLama: /daftar isi/i.test(html.slice(0, 2000)) },
      gagalWaras: judul.length === 0,
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// POST /rapihkan/terapkan (multipart file + setelan JSON + koreksi JSON) -> .docx + header X-Rapih-Ringkasan
router.post('/rapihkan/terapkan', requireAuthOrKey, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload file .docx (maks 8 MB)' });
    const { createHash } = await import('crypto');
    const fhash = createHash('sha256').update(req.file.buffer).digest('hex');
    const db = (await import('../config/supabase')).supabaseAdmin || (await import('../config/supabase')).supabaseAnon;
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: prev } = await db.from('credit_ledger').select('id').eq('user_id', (req as any).userId!).eq('ref', `rapihkan:${fhash}`).gte('created_at', dayAgo).limit(1);
    let tarif = FEATURE_COSTS.rapihkan ?? 1;
    if (!prev || !prev.length) {
      try {
        tarif = (await consumeCredits((req as any).userId!, 'rapihkan', `rapihkan:${fhash}`)).cost;
      } catch (e: any) {
        if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
        throw e;
      }
    } else tarif = 0;
    const setelan = JSON.parse(String(req.body?.setelan || '{}'));
    const koreksi: any[] = JSON.parse(String(req.body?.koreksi || '[]'));
    const S = {
      marginAtasCm: 3, marginBawahCm: 3, marginKiriCm: 4, marginKananCm: 3,
      font: 'Times New Roman', ukuranPt: 12, spasi: 1.5, indentCm: 1.27,
      nomorBab: 'romawi', nomorSubBab: 'angka', daftarIsi: '3', nomorHalaman: 'romawi-arab',
      autoHeading: true, rataKiriKanan: true, babHalamanBaru: true,
      gantungDaftarPustaka: false, buangDaftarIsiLama: true, sertakanTabel: true, ...setelan,
    };
    const mammoth = await import('mammoth');
    const cheerio = await import('cheerio');
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageNumber, NumberFormat, Footer, TableOfContents, ExternalHyperlink, ImageRun, Table, TableRow, TableCell, WidthType, VerticalAlign } = await import('docx');
    const { value: html } = await (mammoth as any).convertToHtml({ buffer: req.file.buffer });
    const $ = (cheerio as any).load(html);
    const TW = 567;
    const lvlOf = new Map<number, number | null>(koreksi.map((k: any) => [k.idx, k.tingkat === 'bukan' ? null : Number(k.tingkat)]));
    const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    let babNo = 0;
    let n2 = 0, n3 = 0;
    let inDapus = false;
    let firstBabIdx = -1;
    const splitRomawi = S.nomorHalaman === 'romawi-arab';
    const body: any[] = [];
    let diubah = 0, ditandai = 0, tabelDipertahankan = 0, paragrafTabel = 0;
    const norm = (el: any) => $(el).text().replace(/\s+/g, ' ').trim();
    const F = (n: number) => ({ font: S.font, size: Math.round(n * 2) });
    let idx = 0;
    const isTocPara = (text: string) => /^\s*(daftar isi|daftar tabel|daftar gambar)\b/i.test(text) && text.length < 40; // harus sama dengan analisis
    const maxPx = Math.max(200, Math.round((11906 - Math.round(S.marginKiriCm * TW) - Math.round(S.marginKananCm * TW)) / 15));

    // Ukuran gambar asli dari header PNG/JPEG/GIF/BMP/SVG
    const sniff = (buf: Buffer, kind: string): { w: number; h: number } | null => {
      try {
        if (kind === 'png' && buf.length > 24) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
        if (kind === 'gif' && buf.length > 10) return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
        if (kind === 'bmp' && buf.length > 26) return { w: buf.readInt32LE(18), h: Math.abs(buf.readInt32LE(22)) };
        if (kind === 'jpg' || kind === 'jpeg') {
          let i = 2;
          while (i + 9 < buf.length) {
            if (buf[i] !== 0xff) { i++; continue; }
            const marker = buf[i + 1];
            if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
              return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
            }
            const len = buf.readUInt16BE(i + 2);
            if (!len) break;
            i += 2 + len;
          }
          return null;
        }
        if (kind === 'svg+xml') {
          const s = buf.toString('utf8', 0, Math.min(buf.length, 4000));
          const w = s.match(/width=["']?([\d.]+)/);
          const h = s.match(/height=["']?([\d.]+)/);
          if (w && h) return { w: Math.round(parseFloat(w[1])), h: Math.round(parseFloat(h[1])) };
        }
      } catch { /* ukuran tak terbaca -> default */ }
      return null;
    };

    const imgRun = (node: any) => {
      const src = String((node && node.attribs && node.attribs.src) || '');
      const m = src.match(/^data:image\/(png|jpe?g|gif|bmp|svg\+xml);base64,([\s\S]+)$/);
      if (!m) return null;
      const kind = m[1];
      const buf = Buffer.from(String(m[2]).replace(/\s/g, ''), 'base64');
      if (!buf.length) return null;
      const dim = sniff(buf, kind) || { w: 480, h: 360 };
      const natW = Math.max(1, dim.w || 480);
      const natH = Math.max(1, dim.h || 360);
      const w = Math.max(40, Math.min(natW, maxPx));
      const h = Math.max(30, Math.round(natH * (w / natW)));
      const type = kind === 'png' ? 'png' : kind === 'gif' ? 'gif' : kind === 'bmp' ? 'bmp' : kind === 'svg+xml' ? 'svg' : 'jpg';
      return new ImageRun({ data: buf, transformation: { width: w, height: h }, type } as any);
    };

    // Run teks dari node HTML: tebal/miring/garisbawah/sub-sup + tautan + gambar + checkbox
    const ST = { b: false, i: false, u: false, sup: false, sub: false, link: false };
    const mkRuns = (node: any, st: typeof ST, pakaiFont = true): any[] => {
      const out: any[] = [];
      for (const child of node.children || []) {
        if (child.type === 'text') {
          const text = String(child.data || '').replace(/\u00a0/g, ' ');
          if (text) out.push(new TextRun({
            text, ...(pakaiFont ? F(S.ukuranPt) : {}),
            bold: st.b || undefined,
            italics: st.i || undefined,
            underline: (st.u || st.link) ? {} : undefined,
            superScript: st.sup || undefined,
            subScript: st.sub || undefined,
            color: st.link ? '0563C1' : undefined,
          }));
          continue;
        }
        if (child.type !== 'tag') continue;
        const tag = String(child.tagName || '').toLowerCase();
        if (tag === 'br') { out.push(new TextRun({ text: '', break: 1 })); continue; }
        if (tag === 'table' || tag === 'tbody' || tag === 'thead' || tag === 'tfoot' || tag === 'tr' || tag === 'td' || tag === 'th') continue; // ditangani buildTable
        if (tag === 'img') { const r = imgRun(child); if (r) out.push(r); continue; }
        if (tag === 'input') {
          const t = String((child.attribs && child.attribs.type) || 'text');
          if (t === 'checkbox') out.push(new TextRun({ text: child.attribs && child.attribs.checked !== undefined ? ' ☑' : ' ☐', ...F(S.ukuranPt) }));
          else {
            const v = String((child.attribs && child.attribs.value) || '');
            if (v && t !== 'hidden') out.push(new TextRun({ text: v, ...F(S.ukuranPt) }));
          }
          continue;
        }
        const nst = {
          b: st.b || tag === 'strong' || tag === 'b',
          i: st.i || tag === 'em' || tag === 'i',
          u: st.u || tag === 'u',
          sup: st.sup || tag === 'sup',
          sub: st.sub || tag === 'sub',
          link: st.link || tag === 'a',
        };
        const inner = mkRuns(child, nst, pakaiFont);
        if (!inner.length) continue;
        if (tag === 'a') {
          const href = String((child.attribs && child.attribs.href) || '');
          if (/^https?:\/\//.test(href)) out.push(new ExternalHyperlink({ children: inner, link: href }));
          else out.push(...inner);
        } else out.push(...inner);
      }
      return out;
    };

    // Tabel asli dipertahankan: baris/kolom/kSel + header abu-abu
    const buildTable = (el: any): any => {
      const rows: any[] = [];
      $(el).find('tr').each((_: any, tr: any) => {
        if ($(tr).parents('table').first().get(0) !== el) return; // lewati tabel bersarang
        const cells: any[] = [];
        $(tr).children('td, th').each((__: any, td: any) => {
          const isTh = String((td as any).tagName || '').toLowerCase() === 'th';
          const src: any[] = $(td).children('p').length ? ($(td).children('p').toArray() as any[]) : [td];
          const paras: any[] = [];
          for (const pe of src) {
            const runs = mkRuns(pe, { ...ST, b: isTh }, !!S.sertakanTabel);
            if (!runs.length) continue;
            paras.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 240, before: 20, after: 20 }, children: runs }));
          }
          if (!paras.length) paras.push(new Paragraph({ children: [new TextRun({ text: '', ...F(S.ukuranPt) })] }));
          const nested: any[] = [];
          $(td).children('table').each((___: any, nt: any) => { const ntb = buildTable(nt); if (ntb) nested.push(ntb); });
          cells.push(new TableCell({
            children: [...paras, ...nested],
            verticalAlign: VerticalAlign.CENTER,
            ...(isTh ? { shading: { fill: 'EDEDED' } } : {}),
          }));
        });
        if (cells.length) rows.push(new TableRow({ children: cells }));
      });
      if (!rows.length) return null;
      return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
    };

    $('body').children('h1, h2, h3, p, li, table').each((_: any, el: any) => {
      const tag = String((el as any).tagName || '').toLowerCase();
      if (tag === 'table') {
        paragrafTabel += $(el).find('p').length;
        const tb = buildTable(el);
        if (tb) {
          body.push(tb);
          // Word menggabungkan dua tabel berdempetan jadi satu; wajib ada paragraf pemisah
          body.push(new Paragraph({ spacing: { line: 240, before: 0, after: 0 }, children: [new TextRun({ text: '', ...F(S.ukuranPt) })] }));
          tabelDipertahankan++;
        }
        return;
      }
      const text = norm(el);
      const hasImg = $(el).find('img').length > 0;
      if (!text && !hasImg) return;
      if (text && isTocPara(text)) {
        // Indeks tetap dilewati supaya koreksi level tidak meleset; hanya cetak ulang kalau toggle dimatikan
        if (!S.buangDaftarIsiLama) {
          diubah++;
          body.push(new Paragraph({
            alignment: S.rataKiriKanan ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
            spacing: { line: Math.round(S.spasi * 240) },
            children: mkRuns(el, ST),
          }));
        }
        return;
      }
      const myIdx = text ? idx++ : -1;
      let lvl: number | null | undefined = lvlOf.has(myIdx) ? lvlOf.get(myIdx) : undefined;
      if (lvl === undefined) {
        if (tag === 'h1') lvl = 1;
        else if (tag === 'h2') lvl = 2;
        else if (tag === 'h3') lvl = 3;
        else if (!text) lvl = null;
        else {
          const mB = text.match(/^BAB\s+[IVX]+\b/i);
          const mN = text.match(/^(\d+(?:\.\d+){0,2})\s+.{4,}/);
          const isCaps = text.length < 90 && text === text.toUpperCase() && /[A-Z]{3,}/.test(text);
          if (mB) lvl = 1;
          else if (mN) lvl = Math.min(mN[1].split('.').length, 3);
          else if (isCaps) lvl = 2;
          else lvl = null;
        }
      }
      if (/^DAFTAR PUSTAKA$/i.test(text)) inDapus = true;
      else if (lvl !== null && lvl !== undefined) inDapus = false;
      if (lvl === 1) {
        if (babNo === 0) firstBabIdx = body.length;
        babNo++; n2 = 0; n3 = 0;
        let title = text.replace(/^(BAB\s+[IVX0-9]+)\b\s*[:.-]?\s*/i, '').trim() || text;
        const label = S.nomorBab === 'arab' ? `BAB ${babNo}` : `BAB ${ROM[babNo - 1] || babNo}`;
        const mulaiBagian = splitRomawi && firstBabIdx === body.length;
        const h1Runs = [new TextRun({ text: `${label} ${title}`.trim(), ...F(S.ukuranPt + 2), bold: true })];
        if (S.autoHeading) {
          body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, ...(S.babHalamanBaru && !mulaiBagian ? { pageBreakBefore: true } : {}), children: h1Runs }));
        } else {
          body.push(new Paragraph({ alignment: AlignmentType.CENTER, ...(S.babHalamanBaru && !mulaiBagian ? { pageBreakBefore: true } : {}), spacing: { line: Math.round(S.spasi * 240) }, children: h1Runs }));
        }
        ditandai++;
      } else if (lvl === 2 || lvl === 3) {
        // Penomoran sub-bab (angka 1.1 / huruf A.) — hanya ganti kalau memang sudah ada nomornya
        if (lvl === 2) { n2++; n3 = 0; } else n3++;
        const lead = text.match(/^\s*((?:\d+\.)+\s*|\d+\s+|[A-Z]\.[\s]*)/);
        let isi = text;
        if (lead) {
          const nomor = S.nomorSubBab === 'huruf'
            ? (lvl === 2 ? `${String.fromCharCode(64 + Math.min(n2, 26))}. ` : `${n3}. `)
            : (lvl === 2 ? `${Math.max(babNo, 1)}.${n2} ` : `${Math.max(babNo, 1)}.${n2}.${n3} `);
          isi = nomor + text.slice(lead[0].length);
        }
        const hRuns = [new TextRun({ text: isi, ...F(S.ukuranPt), bold: true })];
        if (S.autoHeading) {
          body.push(new Paragraph({ heading: lvl === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3, children: hRuns }));
        } else {
          body.push(new Paragraph({ spacing: { line: Math.round(S.spasi * 240) }, children: hRuns }));
        }
        ditandai++;
      } else {
        diubah++;
        const runs = mkRuns(el, ST);
        const hanging = S.gantungDaftarPustaka && inDapus;
        const gambarSaja = !text && hasImg;
        body.push(new Paragraph({
          alignment: S.rataKiriKanan && !gambarSaja ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
          spacing: { line: Math.round(S.spasi * 240) },
          indent: gambarSaja ? undefined : (hanging ? { hanging: Math.round(1.27 * TW) } : (S.indentCm ? { firstLine: Math.round(S.indentCm * TW) } : undefined)),
          children: runs.length ? runs : [new TextRun({ text, ...F(S.ukuranPt) })],
        }));
      }
    });
    const pembuka: any[] = [];
    if (S.daftarIsi !== 'mati') {
      pembuka.push(new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DAFTAR ISI', ...F(S.ukuranPt + 2), bold: true })] }));
      pembuka.push(new TableOfContents('Daftar Isi', { hyperlink: true, headingStyleRange: S.daftarIsi === '2' ? '1-2' : '1-3' }));
    }
    // Nomor halaman: PAGE field asli (PageNumberElement lama menghasilkan <w:pgNum/> yang bikin Word gagal buka)
    const mkFooter = () => (S.nomorHalaman === 'mati'
      ? undefined
      : { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT] })] })] }) });
    const page = { size: { width: 11906, height: 16838 }, margin: { top: Math.round(S.marginAtasCm * TW), left: Math.round(S.marginKiriCm * TW), bottom: Math.round(S.marginBawahCm * TW), right: Math.round(S.marginKananCm * TW) } };
    const sections: any[] = [];
    if (splitRomawi && firstBabIdx >= 0) {
      // Halaman awal romawi (i, ii) lalu mulai Bab I kembali dari 1
      const sebelumBab = [...pembuka, ...body.slice(0, firstBabIdx)];
      if (sebelumBab.length) sections.push({ properties: { page: { ...page, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } } }, footers: mkFooter(), children: sebelumBab });
      sections.push({ properties: { page: { ...page, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } } }, footers: mkFooter(), children: body.slice(firstBabIdx) });
    } else {
      const fmt = splitRomawi ? { start: 1, formatType: NumberFormat.UPPER_ROMAN }
        : S.nomorHalaman === 'arab' ? { start: 1, formatType: NumberFormat.DECIMAL } : undefined;
      sections.push({ properties: { page: { ...page, ...(fmt ? { pageNumbers: fmt } : {}) } }, footers: mkFooter(), children: [...pembuka, ...body] });
    }
    const doc = new Document({ sections });
    const buf = await Packer.toBuffer(doc);
    const ringkasan = { tarif, paragrafDiubah: diubah, judulDitandai: ditandai, bagian: sections.length, tabelDipertahankan, paragrafTabelDilewati: paragrafTabel, gratis: tarif === 0 };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname.replace(/\.docx$/i, '')} (rapih).docx"`);
    res.setHeader('X-Rapih-Ringkasan', encodeURIComponent(JSON.stringify(ringkasan)));
    res.send(Buffer.from(buf));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Rapihkan .docx (legacy satu-langkah; disarankan /rapihkan/analisis + /rapihkan/terapkan)
router.post('/rapihkan', requireAuthOrKey, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload file .docx (maks 8 MB)' });
    if (!/\.docx$/i.test(req.file.originalname)) return res.status(400).json({ error: 'Hanya .docx yang didukung' });
    try {
      await consumeCredits(req.userId!, 'dokumen', 'rapihkan:docx');
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, remaining: e.remaining });
      throw e;
    }
    const mammoth = await import('mammoth');
    const cheerio = await import('cheerio');
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageNumber, Footer, TableOfContents } = await import('docx');
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
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Halaman ', font: 'Times New Roman', size: 20 }), new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 })] })],
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
