import { Router } from 'express';
import { createHash, randomBytes } from 'crypto';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;

function newCode() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const b = randomBytes(8);
  let s = '';
  for (let i = 0; i < 8; i++) s += abc[b[i] % abc.length];
  return s.slice(0, 4) + '-' + s.slice(4);
}

// Dipanggil plugin Word (tanpa login): minta kode pairing
router.post('/pair/request', async (req, res) => {
  try {
    const code = newCode();
    const { error } = await db().from('word_pairings').insert({ code, status: 'pending' });
    if (error) throw new Error(error.message);
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.json({ code, url: `${base}/hubungkan?kode=${code}` });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Dipolling plugin: sudah disetujui? Kunci mentah hanya diberikan SEKALI.
router.get('/pair/status', async (req, res) => {
  try {
    const code = String(req.query.code || '').toUpperCase();
    const { data, error } = await db().from('word_pairings').select('*').eq('code', code).single();
    if (error || !data) return res.status(404).json({ error: 'Kode tidak dikenal' });
    if (new Date(data.expires_at) < new Date()) return res.json({ status: 'expired' });
    if (data.status !== 'approved') return res.json({ status: data.status });
    if (!data.temp_key || data.consumed) return res.json({ status: 'approved' });
    await db().from('word_pairings').update({ temp_key: null, consumed: true }).eq('code', code);
    res.json({ status: 'approved', key: data.temp_key });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Dipanggil dari browser yang sudah login: setujui kode dari plugin
router.post('/pair/approve', requireAuth, async (req: AuthRequest, res) => {
  try {
    const code = String(req.body?.code || '').toUpperCase().trim();
    const { data, error } = await db().from('word_pairings').select('*').eq('code', code).single();
    if (error || !data) return res.status(404).json({ error: 'Kode tidak dikenal atau kedaluwarsa' });
    if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'Kode kedaluwarsa. Minta kode baru di plugin.' });
    if (data.status === 'approved') return res.json({ ok: true, already: true });
    const raw = 'skp_' + randomBytes(24).toString('hex');
    const hash = createHash('sha256').update(raw).digest('hex');
    await db().from('api_keys').insert({ user_id: req.userId!, name: 'Perangkat Word', key_hash: hash, key_prefix: raw.slice(0, 10) });
    await db().from('word_pairings').update({ status: 'approved', user_id: req.userId!, temp_key: raw }).eq('code', code);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
