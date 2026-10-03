import { Router } from 'express';
import { createHash, randomBytes } from 'crypto';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;
const hash = (k: string) => createHash('sha256').update(k).digest('hex');

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('api_keys').select('id,name,key_prefix,created_at').eq('user_id', req.userId!).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ items: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name = 'Plugin Word' } = req.body || {};
    const raw = 'skp_' + randomBytes(24).toString('hex');
    const { data, error } = await db().from('api_keys').insert({ user_id: req.userId!, name, key_hash: hash(raw), key_prefix: raw.slice(0, 10) }).select('id,name,key_prefix,created_at').single();
    if (error) throw new Error(error.message);
    res.json({ item: data, key: raw });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await db().from('api_keys').delete().eq('id', String(req.params.id)).eq('user_id', req.userId!);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
