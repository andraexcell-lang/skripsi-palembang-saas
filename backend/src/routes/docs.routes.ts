import { Router } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('documents').select('id,title,updated_at').eq('user_id', req.userId!).order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ items: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title = 'Dokumen Baru' } = req.body || {};
    const { data, error } = await db().from('documents').insert({ user_id: req.userId!, title }).select().single();
    if (error) throw new Error(error.message);
    res.json({ item: data });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await db().from('documents').select('*').eq('id', String(req.params.id)).eq('user_id', req.userId!).single();
    if (error) throw new Error('Dokumen tidak ditemukan');
    res.json({ item: data });
  } catch (e: any) { res.status(404).json({ error: e.message }); }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, content } = req.body || {};
    const patch: any = { updated_at: new Date().toISOString() };
    if (typeof title === 'string') patch.title = title.slice(0, 200);
    if (typeof content === 'string') patch.content = content.slice(0, 100000);
    const { error } = await db().from('documents').update(patch).eq('id', String(req.params.id)).eq('user_id', req.userId!);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await db().from('documents').delete().eq('id', String(req.params.id)).eq('user_id', req.userId!);
    if (error) throw new Error(error.message);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
