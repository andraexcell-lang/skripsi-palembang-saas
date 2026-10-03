import { Router } from 'express';
import { randomBytes } from 'crypto';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

const router = Router();
const db = () => supabaseAdmin || supabaseAnon;
const COMMISSION_RATE = 0.1;

function myCode(userId: string) {
  return 'SP-' + userId.replace(/-/g, '').slice(0, 8).toUpperCase();
}

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const d = db();
    let { data: p } = await d.from('profiles').select('referral_code').eq('id', req.userId!).single();
    if (p && !p.referral_code) {
      const code = myCode(req.userId!);
      await d.from('profiles').update({ referral_code: code }).eq('id', req.userId!);
      p = { referral_code: code };
    }
    const { data: refs } = await d.from('profiles').select('id,created_at').eq('referred_by', req.userId!);
    const { data: comms } = await d.from('referral_commissions').select('amount,status').eq('referrer_id', req.userId!);
    const total = (comms || []).reduce((a: number, c: any) => a + c.amount, 0);
    res.json({ code: p?.referral_code, referrals: (refs || []).length, commission: total, items: comms || [] });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/attribute', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'code wajib' });
    const d = db();
    const { data: ref } = await d.from('profiles').select('id').eq('referral_code', String(code).toUpperCase()).single();
    if (!ref) return res.status(404).json({ error: 'Kode referral tidak dikenal' });
    if (ref.id === req.userId) return res.status(400).json({ error: 'Tidak bisa memakai kode sendiri' });
    await d.from('profiles').update({ referred_by: ref.id }).eq('id', req.userId!);
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export async function grantCommission(refereeId: string, transactionId: string, amount: number) {
  try {
    const d = db();
    const { data: p } = await d.from('profiles').select('referred_by').eq('id', refereeId).single();
    if (!p?.referred_by) return;
    await d.from('referral_commissions').insert({
      referrer_id: p.referred_by,
      referee_id: refereeId,
      transaction_id: transactionId,
      amount: Math.round(amount * COMMISSION_RATE),
    });
  } catch { /* komisi gagal jangan gagalkan pembayaran */ }
}

export function affiliateCodeFor(userId: string) {
  return 'SP-' + randomBytes(4).toString('hex').toUpperCase();
}

export default router;
