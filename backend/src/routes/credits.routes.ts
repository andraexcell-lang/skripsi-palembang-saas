import { Router } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { requireAuthOrKey } from '../middleware/apiKey';
import { getBalance, consumeCredits } from '../services/credits.service';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

const router = Router();

router.get('/balance', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    res.json(await getBalance(req.userId!));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/ledger', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const db = supabaseAdmin || supabaseAnon;
    const { data, error } = await db
      .from('credit_ledger')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    res.json({ items: data });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/consume', requireAuthOrKey, async (req: AuthRequest, res) => {
  try {
    const { feature, ref } = req.body || {};
    if (!feature) return res.status(400).json({ error: 'feature wajib diisi' });
    res.json(await consumeCredits(req.userId!, feature, ref));
  } catch (e: any) {
    if (e.code === 'INSUFFICIENT_CREDITS') return res.status(402).json({ error: e.message, cost: e.cost, remaining: e.remaining });
    res.status(500).json({ error: e.message });
  }
});

export default router;
