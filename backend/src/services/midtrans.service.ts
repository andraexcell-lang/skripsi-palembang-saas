import { createHash } from 'crypto';

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const IS_PROD = (process.env.MIDTRANS_IS_PRODUCTION || 'false') === 'true';
const BASE = IS_PROD ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';

export const midtransReady = () => !!SERVER_KEY;

export async function snapCharge(orderId: string, grossAmount: number, email: string, pkgName: string) {
  const auth = Buffer.from(SERVER_KEY + ':').toString('base64');
  const res = await fetch(`${BASE}/snap/v1/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      customer_details: { email },
      item_details: [{ id: orderId, price: grossAmount, quantity: 1, name: pkgName.slice(0, 50) }],
      callbacks: { finish: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing` },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as any).error_messages?.join('; ') || 'Midtrans Snap gagal');
  return json as { token: string; redirect_url: string };
}

export function verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string) {
  const h = createHash('sha512').update(orderId + statusCode + grossAmount + SERVER_KEY).digest('hex');
  return h === signatureKey;
}
