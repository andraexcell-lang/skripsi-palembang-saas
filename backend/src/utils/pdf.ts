// pdf-parse v2 (pdfjs): API-nya kelas PDFParse, bukan fungsi seperti v1.
// Dipakai files.routes (plagiasi/analisis) dan projects.routes (Unggah Artikel Sendiri).
export async function pdfText(buffer: Buffer, max = 60000): Promise<string> {
  const mod: any = await import('pdf-parse');
  const PDFParse = mod.PDFParse || mod.default?.PDFParse;
  if (typeof PDFParse !== 'function') throw new Error('Parser PDF tidak tersedia di server.');
  // salinan Uint8Array: pdfjs boleh "mengambil alih" buffer yang dikirim
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const r = await parser.getText();
    return String(r?.text || '').slice(0, max);
  } finally {
    try { await parser.destroy(); } catch { /* abaikan */ }
  }
}
