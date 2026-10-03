import { Router } from 'express';
import { randomUUID } from 'crypto';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { addCredits } from '../services/credits.service';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { midtransReady, snapCharge, verifySignature } from '../services/midtrans.service';

const router = Router();

export const PACKAGES = [
  { id: 'mhs-bulanan', group: 'Mahasiswa', name: 'Bulanan', price: 89000, credits: 110, desc: '100 + 10 bonus kredit' },
  { id: 'mhs-3bulan', group: 'Mahasiswa', name: '3 Bulan', price: 248000, credits: 365, desc: '300 + 65 bonus kredit', popular: true },
  { id: 'mhs-semester', group: 'Mahasiswa', name: 'Semester (6 bln)', price: 484000, credits: 750, desc: '600 + 150 bonus kredit' },
  { id: 'mhs-tahunan', group: 'Mahasiswa', name: 'Tahunan', price: 849000, credits: 1500, desc: '1200 + 300 bonus kredit' },
  { id: 'prof-bulanan', group: 'Profesor', name: 'Bulanan', price: 134000, credits: 160, desc: '150 + 10 bonus kredit' },
  { id: 'prof-3bulan', group: 'Profesor', name: '3 Bulan', price: 399000, credits: 525, desc: '450 + 75 bonus kredit', popular: true },
  { id: 'prof-semester', group: 'Profesor', name: 'Semester (6 bln)', price: 775000, credits: 1100, desc: '900 + 200 bonus kredit' },
];

router.get('/packages', (_req, res) => res.json({ items: PACKAGES, midtrans: midtransReady() }));

// Mock checkout (dev/sandbox tanpa Midtrans). Bila Midtrans terkonfigurasi, pakai /midtrans/charge.
router.post('/checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { packageId } = req.body || {};
    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return res.status(400).json({ error: 'packageId tidak dikenal' });
    const db = supabaseAdmin || supabaseAnon;
    const { data, error } = await db
      .from('transactions')
      .insert({ user_id: req.userId!, package_id: pkg.id, amount: pkg.price, credits: pkg.credits, status: 'pending' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    // Mock QRIS: frontend tampilkan QR + tombol "Saya sudah bayar" -> /confirm
    res.json({ transaction: data, qrisPayload: `QRIS-MOCK-${data.id}-${pkg.price}`, note: 'Mock QRIS. Panggil POST /api/billing/confirm untuk simulasi lunas.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/confirm', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { transactionId } = req.body || {};
    if (!transactionId) return res.status(400).json({ error: 'transactionId wajib' });
    const db = supabaseAdmin || supabaseAnon;
    const { data: trx, error } = await db.from('transactions').select('*').eq('id', transactionId).eq('user_id', req.userId!).single();
    if (error || !trx) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    if (trx.status === 'paid') return res.json({ ok: true, already: true });
    await db.from('transactions').update({ status: 'paid' }).eq('id', transactionId);
    const remaining = await addCredits(req.userId!, trx.credits, `billing:${trx.package_id}`, { transactionId });
    res.json({ ok: true, remaining });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const db = supabaseAdmin || supabaseAnon;
    const { data, error } = await db
      .from('transactions')
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

// Midtrans Snap: buat transaksi + redirect_url (QRIS/e-wallet/transfer)
router.post('/midtrans/charge', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!midtransReady()) return res.status(503).json({ error: 'Midtrans belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY di backend/.env.' });
    const { packageId } = req.body || {};
    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return res.status(400).json({ error: 'packageId tidak dikenal' });
    const orderId = `skp-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const db = supabaseAdmin || supabaseAnon;
    const { data, error } = await db
      .from('transactions')
      .insert({ user_id: req.userId!, package_id: pkg.id, amount: pkg.price, credits: pkg.credits, status: 'pending' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await db.from('transactions').update({ status: `pending:${orderId}` }).eq('id', data.id);
    const snap = await snapCharge(orderId, pkg.price, req.userEmail || '', `${pkg.group} ${pkg.name}`);
    res.json({ transactionId: data.id, orderId, redirect_url: snap.redirect_url, token: snap.token });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Webhook Midtrans (pasang URL ini di dashboard Midtrans: https://domain-anda/api/billing/midtrans/webhook)
router.post('/midtrans/webhook', async (req, res) => {
  try {
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = req.body || {};
    if (!order_id || !verifySignature(String(order_id), String(status_code), String(gross_amount), String(signature_key || ''))) {
      return res.status(403).json({ error: 'Signature tidak valid' });
    }
    if ((transaction_status === 'capture' && fraud_status !== 'deny') || transaction_status === 'settlement') {
      const db = supabaseAdmin || supabaseAnon;
      const { data: trx } = await db.from('transactions').select('*').eq('status', `pending:${order_id}`).single();
      if (trx && trx.status !== 'paid') {
        await db.from('transactions').update({ status: 'paid' }).eq('id', trx.id);
        await addCredits(trx.user_id, trx.credits, `billing:${trx.package_id}`, { orderId: order_id });
      }
    } else if (['deny', 'expire', 'cancel'].includes(transaction_status)) {
      const db = supabaseAdmin || supabaseAnon;
      await db.from('transactions').update({ status: `failed:${transaction_status}` }).eq('status', `pending:${order_id}`);
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
