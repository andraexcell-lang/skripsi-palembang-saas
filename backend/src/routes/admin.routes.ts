import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { bacaSetting, tulisSetting, hapusSetting } from '../services/settings.service';
import {
  MODELS, daftarModel, muatPengaturanModel, statusModel, tesModel, EntriModel,
} from '../services/ai.service';

const router = Router();

const defaultModels = (): EntriModel[] => MODELS.map((id) => ({ id, provider: 'gemini', aktif: true }));

function pesanTabel(e: any): string {
  const m = String(e?.message || e);
  if (/relation .*app_settings|does not exist|42P01/i.test(m)) {
    return 'Tabel app_settings belum ada — jalankan backend/supabase/migration_admin.sql di SQL Editor Supabase dulu.';
  }
  return m;
}

function validasiEntri(list: any): EntriModel[] | string {
  if (!Array.isArray(list) || !list.length) return 'Daftar model minimal 1 entri';
  const bersih: EntriModel[] = [];
  for (const [i, x] of list.entries()) {
    if (!x || typeof x.id !== 'string' || !x.id.trim()) return `Entri #${i + 1}: nama model (id) wajib diisi`;
    const provider = x.provider === 'openai' ? 'openai' : 'gemini';
    if (provider === 'openai') {
      if (!x.baseUrl || typeof x.baseUrl !== 'string') return `Entri #${i + 1} (${x.id}): baseUrl wajib untuk provider openai/gateway`;
      try { new URL(x.baseUrl); } catch { return `Entri #${i + 1} (${x.id}): baseUrl bukan URL valid`; }
    }
    bersih.push({
      id: x.id.trim(),
      provider,
      baseUrl: x.baseUrl ? String(x.baseUrl).replace(/\/+$/, '') : undefined,
      apiKey: x.apiKey ? String(x.apiKey) : undefined,
      aktif: x.aktif !== false,
    });
  }
  if (!bersih.some((e) => e.aktif)) return 'Minimal 1 entri harus aktif';
  return bersih;
}

// ——— Model ———
async function muatLama(): Promise<any[]> {
  try {
    const v = await bacaSetting('ai_models');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

/** Padukan key: '••••'/kosong = pertahankan key tersimpan; hapusKey = buang key. */
function sambungKey(x: any, lama: any[]): any {
  if (x?.hapusKey) return { ...x, apiKey: undefined, hapusKey: undefined };
  if (x?.apiKey && x.apiKey !== '••••') return x;
  const norm = (s: any) => String(s || '').replace(/\/+$/, '');
  const cocok = lama.find(
    (m) => m && m.id === x?.id &&
      (m.provider || 'gemini') === (x?.provider === 'openai' ? 'openai' : 'gemini') &&
      norm(m.baseUrl) === norm(x?.baseUrl),
  );
  return { ...x, apiKey: cocok?.apiKey || undefined };
}

router.get('/models', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const dariDb = await bacaSetting('ai_models');
    const list = Array.isArray(dariDb) && dariDb.length ? dariDb : daftarModel();
    // API key TIDAK dikirim balik ke klien — hanya penanda sudah diisi
    res.json({ models: list.map((e) => ({ ...e, apiKey: e.apiKey ? '••••' : '', punyaKey: !!e.apiKey })) });
  } catch (e: any) {
    res.status(500).json({ error: pesanTabel(e) });
  }
});

router.put('/models', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const mentah = (req.body || {}).models;
    const lama = await muatLama();
    const dirapikan = Array.isArray(mentah) ? mentah.map((x: any) => sambungKey(x, lama)) : mentah;
    const hasil = validasiEntri(dirapikan);
    if (typeof hasil === 'string') return res.status(400).json({ error: hasil });
    await tulisSetting('ai_models', hasil);
    await muatPengaturanModel();
    res.json({ ok: true, total: hasil.length, aktif: hasil.filter((e) => e.aktif).length });
  } catch (e: any) {
    res.status(500).json({ error: pesanTabel(e) });
  }
});

// Kembalikan daftar model ke bawaan sistem (hapus pengaturan 'ai_models')
router.post('/models/reset', requireAdmin, async (_req: Request, res: Response) => {
  try {
    await hapusSetting('ai_models');
    await muatPengaturanModel();
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: pesanTabel(e) });
  }
});

// Tes koneksi 1 entri (belum tentu tersimpan) — 1 request mini ke provider
router.post('/models/test', requireAdmin, async (req: Request, res: Response) => {
  try {
    const x = (req.body || {}).model;
    const hasil = validasiEntri([sambungKey(x, await muatLama())]);
    if (typeof hasil === 'string') return res.status(400).json({ error: hasil });
    const r = await tesModel(hasil[0]);
    res.json(r);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ——— Status runtime (blok kuota / rpm / urutan) ———
router.get('/status', requireAdmin, async (_req: Request, res: Response) => {
  try {
    res.json({ ...statusModel(), defaultModels: MODELS.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ——— Fitur flags (baca: juga ada endpoint publik GET /api/flags) ———
router.get('/flags', requireAdmin, async (_req: Request, res: Response) => {
  try {
    res.json({ flags: (await bacaSetting('feature_flags')) || {} });
  } catch (e: any) {
    res.status(500).json({ error: pesanTabel(e) });
  }
});

router.put('/flags', requireAdmin, async (req: Request, res: Response) => {
  try {
    const f = (req.body || {}).flags;
    if (!f || typeof f !== 'object' || Array.isArray(f)) return res.status(400).json({ error: 'flags wajib berupa object { slug: boolean }' });
    const bersih: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(f)) bersih[k] = !!v;
    await tulisSetting('feature_flags', bersih);
    res.json({ ok: true, total: Object.keys(bersih).length });
  } catch (e: any) {
    res.status(500).json({ error: pesanTabel(e) });
  }
});

export default router;
